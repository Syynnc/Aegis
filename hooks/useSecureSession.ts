'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  importPrivateKey,
  importPublicKey,
  deriveSharedKey,
} from '@/lib/crypto'
import { loadPrivateKey } from '@/lib/helpers'
import type { User } from '@/types'

export interface SecureSession {
  currentUser: User | null
  otherUser: User | null
  sharedKey: CryptoKey | null
  roomId: string | null
  connected: boolean
  statusText: string
  setOtherUser: (user: User) => void
  setSharedKey: (key: CryptoKey) => void
  setConnected: (v: boolean) => void
  setStatusText: (t: string) => void
}

export function useSecureSession(): SecureSession {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [statusText, setStatusText] = useState('Initializing secure session…')

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }

      const privateKeyJwk = loadPrivateKey(authUser.id)
      if (!privateKeyJwk) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setStatusText('Loading user profile…')
      const { data: me } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!me) {
        router.push('/login')
        return
      }
      setCurrentUser(me)

      setStatusText('Finding chat room…')
      const room = await getOrCreateRoom()
      setRoomId(room.id)

      setStatusText('Looking for other user…')
      const { data: others } = await supabase
        .from('users')
        .select('*')
        .neq('id', authUser.id)
        .limit(1)

      const other: User | null = others?.[0] ?? null

      if (other) {
        setOtherUser(other)
        setStatusText('Performing ECDH key exchange…')
        try {
          const myPrivateKey = await importPrivateKey(privateKeyJwk)
          const theirPublicKey = await importPublicKey(other.public_key)
          const key = await deriveSharedKey(myPrivateKey, theirPublicKey)
          setSharedKey(key)
          setConnected(true)
          setStatusText('')
        } catch {
          setStatusText('Key exchange failed')
        }
      } else {
        setStatusText('Waiting for another user to join…')
      }
    }

    init()
  }, [router])

  return {
    currentUser,
    otherUser,
    sharedKey,
    roomId,
    connected,
    statusText,
    setOtherUser,
    setSharedKey,
    setConnected,
    setStatusText,
  }
}

async function getOrCreateRoom() {
  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (existing) return existing

  const { data: newRoom } = await supabase
    .from('chat_rooms')
    .insert({})
    .select()
    .single()

  return newRoom!
}
