'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { loadPrivateKey } from '@/lib/helpers'
import type { User } from '@/types'

export function useSecureSession() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (!profile) {
        router.push('/login')
        return
      }

      setCurrentUser(profile)
      setLoading(false)
    }

    init()
  }, [router])

  return { currentUser, loading }
}
