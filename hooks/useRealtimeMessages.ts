'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  importPrivateKey,
  importPublicKey,
  deriveSharedKey,
  decryptMessage,
  verifyMessageHash,
} from '@/lib/crypto'
import { loadPrivateKey } from '@/lib/helpers'
import type { User, Message, DecryptedMessage } from '@/types'

interface UseRealtimeMessagesOptions {
  roomId: string | null
  sharedKey: CryptoKey | null
  currentUserId: string | null
  otherUser: User | null
  onKeyExchanged: (key: CryptoKey, other: User) => void
}

export function useRealtimeMessages({
  roomId,
  sharedKey,
  currentUserId,
  otherUser,
  onKeyExchanged,
}: UseRealtimeMessagesOptions) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const addMessage = useCallback((msg: DecryptedMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  // Keep a mutable ref to sharedKey so the realtime callback always
  // sees the latest value without needing to re-subscribe
  const keyRef = useRef<CryptoKey | null>(sharedKey)
  useEffect(() => { keyRef.current = sharedKey }, [sharedKey])

  const decryptAndVerify = useCallback(
    async (msg: Message, key: CryptoKey): Promise<DecryptedMessage> => {
      try {
        const plaintext = await decryptMessage(key, msg.encrypted_message, msg.iv)
        const integrityVerified = await verifyMessageHash(plaintext, msg.hash)
        return { ...msg, plaintext, integrityVerified }
      } catch {
        return { ...msg, plaintext: '', integrityVerified: false, decryptionFailed: true }
      }
    },
    []
  )

  // Load history whenever both roomId and sharedKey become available
  useEffect(() => {
    if (!roomId || !sharedKey) return

    async function loadHistory() {
      setLoadingHistory(true)
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (data) {
        const decrypted = await Promise.all(
          data.map((m: Message) => decryptAndVerify(m, sharedKey!))
        )
        setMessages(decrypted)
      }
      setLoadingHistory(false)
    }

    loadHistory()
  }, [roomId, sharedKey, decryptAndVerify])

  // Realtime subscription — only depends on roomId so it never re-subscribes
  // when the sharedKey arrives later; it reads it from keyRef instead
  useEffect(() => {
    if (!roomId || !currentUserId) return

    supabase.removeAllChannels()

    const channel = supabase
      .channel(`room:${roomId}:${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const newMsg = payload.new as Message

          // Filter client-side — more reliable than server-side filter
          // which requires REPLICA IDENTITY FULL to be set
          if (newMsg.room_id !== roomId) return

          let key = keyRef.current

          // If the key isn't ready yet (other user hadn't joined when we subscribed),
          // attempt a late key exchange now
          if (!key) {
            const { data: { user: au } } = await supabase.auth.getUser()
            if (!au) return
            const privJwk = loadPrivateKey(au.id)
            if (!privJwk) return

            const { data: refreshedOther } = await supabase
              .from('users')
              .select('*')
              .neq('id', au.id)
              .limit(1)
              .single()

            if (!refreshedOther) return

            try {
              const priv = await importPrivateKey(privJwk)
              const pub = await importPublicKey(refreshedOther.public_key)
              key = await deriveSharedKey(priv, pub)
              keyRef.current = key
              onKeyExchanged(key, refreshedOther as User)
            } catch {
              return
            }
          }

          const decrypted = await decryptAndVerify(newMsg, key)
          setMessages((prev) => {
            if (prev.some((m) => m.id === decrypted.id)) return prev
            return [...prev, decrypted]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'users' },
        async () => {
          // A new user registered — attempt key exchange if we don't have a key yet
          if (keyRef.current || !currentUserId) return

          const { data: { user: au } } = await supabase.auth.getUser()
          if (!au) return
          const privJwk = loadPrivateKey(au.id)
          if (!privJwk) return

          const { data: newOther } = await supabase
            .from('users')
            .select('*')
            .neq('id', au.id)
            .limit(1)
            .single()

          if (!newOther) return

          try {
            const priv = await importPrivateKey(privJwk)
            const pub = await importPublicKey(newOther.public_key)
            const key = await deriveSharedKey(priv, pub)
            keyRef.current = key
            onKeyExchanged(key, newOther as User)
          } catch {
            /* ignore */
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, currentUserId, onKeyExchanged, decryptAndVerify])

  return { messages, loadingHistory, addMessage }
}
