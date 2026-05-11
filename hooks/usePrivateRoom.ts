'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { importPrivateKey, importPublicKey, deriveSharedKey } from '@/lib/crypto'
import { loadPrivateKey } from '@/lib/helpers'
import type { User } from '@/types'

interface UsePrivateRoomResult {
  roomId: string | null
  sharedKey: CryptoKey | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
}

export function usePrivateRoom(
  currentUserId: string | null,
  selectedUser: User | null
): UsePrivateRoomResult {
  const [roomId, setRoomId] = useState<string | null>(null)
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUserId || !selectedUser) {
      setRoomId(null)
      setSharedKey(null)
      setStatus('idle')
      setError(null)
      return
    }

    let cancelled = false

    async function openRoom() {
      setStatus('loading')
      setError(null)

      try {
        // Ensure consistent ordering (smaller UUID = user1)
        const [u1, u2] = [currentUserId!, selectedUser!.id].sort()

        // Look up or create the room for this pair
        let { data: room } = await supabase
          .from('chat_rooms')
          .select('id')
          .eq('user1_id', u1)
          .eq('user2_id', u2)
          .maybeSingle()

        if (!room) {
          const { data: newRoom, error: insertError } = await supabase
            .from('chat_rooms')
            .insert({ user1_id: u1, user2_id: u2 })
            .select('id')
            .single()

          if (insertError) throw new Error(insertError.message)
          room = newRoom
        }

        if (cancelled) return

        // Always fetch the latest public key for the selected user so we
        // use their current key even if they regenerated it on a new device
        const { data: freshUser } = await supabase
          .from('users')
          .select('public_key')
          .eq('id', selectedUser!.id)
          .single()

        if (!freshUser) throw new Error('Could not fetch peer public key')
        if (cancelled) return

        const privateKeyJwk = loadPrivateKey(currentUserId!)
        if (!privateKeyJwk) throw new Error('Private key missing — please sign in again')

        const myPrivateKey = await importPrivateKey(privateKeyJwk)
        const theirPublicKey = await importPublicKey(freshUser.public_key)
        const key = await deriveSharedKey(myPrivateKey, theirPublicKey)

        if (cancelled) return

        setRoomId(room!.id)
        setSharedKey(key)
        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to open room')
          setStatus('error')
        }
      }
    }

    openRoom()

    return () => {
      cancelled = true
      setRoomId(null)
      setSharedKey(null)
      setStatus('idle')
    }
  }, [currentUserId, selectedUser])

  return { roomId, sharedKey, status, error }
}
