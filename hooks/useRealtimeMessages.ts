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
  onKeyExchanged: (key: CryptoKey, other: User) => void
}

export function useRealtimeMessages({
  roomId,
  sharedKey,
  currentUserId,
  onKeyExchanged,
}: UseRealtimeMessagesOptions) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)

  const keyRef = useRef<CryptoKey | null>(sharedKey)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { keyRef.current = sharedKey }, [sharedKey])

  const addMessage = useCallback((msg: DecryptedMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId },
    })
  }, [currentUserId])

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

  // Load history when both roomId and sharedKey are ready
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

  // Realtime subscription
  useEffect(() => {
    if (!roomId || !currentUserId) return

    let channel: ReturnType<typeof supabase.channel>

    async function subscribe() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`room-${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          async (payload) => {
            const newMsg = payload.new as Message
            if (newMsg.room_id !== roomId) return

            let key = keyRef.current

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
        .on(
          'broadcast',
          { event: 'typing' },
          ({ payload }: { payload: { userId: string } }) => {
            // Only show indicator if it's from the other user
            if (payload.userId === currentUserId) return

            setIsOtherTyping(true)

            // Clear any existing timeout and reset the 2.5s window
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => {
              setIsOtherTyping(false)
            }, 2500)
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('[Aegis] Realtime subscription failed — check RLS policies and JWT')
          }
        })

      channelRef.current = channel
    }

    subscribe()

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (channel) supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [roomId, currentUserId, onKeyExchanged, decryptAndVerify])

  return { messages, loadingHistory, addMessage, isOtherTyping, sendTyping }
}
