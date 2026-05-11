'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { OnlineUser, User } from '@/types'

export function useOnlineUsers(currentUserId: string | null) {
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())

  // Load all registered users (excluding self) + watch for new registrations
  useEffect(() => {
    if (!currentUserId) return

    async function loadUsers() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUserId)
        .order('username')

      if (data) {
        setUsers(data.map((u: User) => ({ ...u, isOnline: false })))
      }
    }

    loadUsers()

    const channel = supabase
      .channel('users-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload) => {
          const newUser = payload.new as User
          if (newUser.id === currentUserId) return
          setUsers((prev) => {
            if (prev.some((u) => u.id === newUser.id)) return prev
            const inserted: OnlineUser = { ...newUser, isOnline: false }
            return [...prev, inserted].sort((a, b) => a.username.localeCompare(b.username))
          })
          // Apply current online status in case the new user is already tracked by presence
          setOnlineIds((ids) => {
            if (ids.has(newUser.id)) {
              setUsers((prev) =>
                prev.map((u) => (u.id === newUser.id ? { ...u, isOnline: true } : u))
              )
            }
            return ids
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  // Track presence — who is actively connected right now
  useEffect(() => {
    if (!currentUserId) return

    const channel = supabase.channel('presence:online-users', {
      config: { presence: { key: currentUserId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string }>()
        const ids = new Set(Object.keys(state))
        setOnlineIds(ids)
        setUsers((prev) =>
          prev.map((u) => ({ ...u, isOnline: ids.has(u.id) }))
        )
      })
      .on('presence', { event: 'join' }, ({ key }: { key: string }) => {
        setOnlineIds((prev) => new Set([...prev, key]))
        setUsers((prev) =>
          prev.map((u) => (u.id === key ? { ...u, isOnline: true } : u))
        )
      })
      .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
        setOnlineIds((prev) => {
          const next = new Set(prev)
          next.delete(key)
          return next
        })
        setUsers((prev) =>
          prev.map((u) => (u.id === key ? { ...u, isOnline: false } : u))
        )
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: currentUserId })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId])

  return { users, onlineIds }
}
