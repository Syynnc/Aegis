'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { decryptMessage, verifyMessageHash } from '@/lib/crypto'
import type { Message, DecryptedMessage } from '@/types'

interface UseRealtimeMessagesOptions {
  roomId: string | null
  sharedKey: CryptoKey | null
  currentUserId: string | null
}

export function useRealtimeMessages({
  roomId,
  sharedKey,
  currentUserId,
}: UseRealtimeMessagesOptions) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([])
  const [isOtherTyping, setIsOtherTyping] = useState(false)

  const keyRef = useRef<CryptoKey | null>(sharedKey)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { keyRef.current = sharedKey }, [sharedKey])

  useEffect(() => {
    setMessages([])
    setIsOtherTyping(false)
  }, [roomId])

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

  // Mark all unread incoming messages in the room as read
  const markAsRead = useCallback(async (msgs: DecryptedMessage[]) => {
    if (!currentUserId || !roomId) return

    const unreadIds = msgs
      .filter((m) => m.sender_id !== currentUserId && m.read_at === null)
      .map((m) => m.id)

    if (unreadIds.length === 0) return

    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)

    // Update local state immediately so sender sees the receipt without waiting
    // for the realtime UPDATE event to bounce back
    setMessages((prev) =>
      prev.map((m) =>
        unreadIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
      )
    )
  }, [currentUserId, roomId])

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

  // Load history
  useEffect(() => {
    if (!roomId || !sharedKey) return

    async function loadHistory() {
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

            const key = keyRef.current
            if (!key) return

            const decrypted = await decryptAndVerify(newMsg, key)
            setMessages((prev) => {
              if (prev.some((m) => m.id === decrypted.id)) return prev
              return [...prev, decrypted]
            })
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          (payload) => {
            const updated = payload.new as Message
            if (updated.room_id !== roomId) return

            // Patch just the read_at field on the matching message
            setMessages((prev) =>
              prev.map((m) =>
                m.id === updated.id ? { ...m, read_at: updated.read_at } : m
              )
            )
          }
        )
        .on(
          'broadcast',
          { event: 'typing' },
          ({ payload }: { payload: { userId: string } }) => {
            if (payload.userId === currentUserId) return
            setIsOtherTyping(true)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2500)
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('[Aegis] Realtime subscription failed')
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
  }, [roomId, currentUserId, decryptAndVerify])

  return { messages, addMessage, isOtherTyping, sendTyping, markAsRead }
}
