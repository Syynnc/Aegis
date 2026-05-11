'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types'

export function useUnreadCounts(currentUserId: string | null) {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  // Track which user is currently open so we don't badge the active conversation
  const activeUserIdRef = useRef<string | null>(null)

  const setActiveUser = useCallback((userId: string | null) => {
    activeUserIdRef.current = userId
  }, [])

  const clearUnread = useCallback((userId: string) => {
    setUnreadCounts((prev) => ({ ...prev, [userId]: 0 }))
  }, [])

  useEffect(() => {
    if (!currentUserId) return

    let channel: ReturnType<typeof supabase.channel>

    async function subscribe() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`notifications-${currentUserId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            const msg = payload.new as Message

            // Ignore own messages
            if (msg.sender_id === currentUserId) return

            // Ignore messages from the currently open conversation
            if (activeUserIdRef.current === msg.sender_id) return

            setUnreadCounts((prev) => ({
              ...prev,
              [msg.sender_id]: (prev[msg.sender_id] ?? 0) + 1,
            }))
          }
        )
        .subscribe()
    }

    subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [currentUserId])

  return { unreadCounts, clearUnread, setActiveUser }
}
