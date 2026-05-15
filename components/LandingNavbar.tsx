'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.25 3-7.5 4.5-7.5 9 0 5.25 3.75 8.25 7.5 9.75 3.75-1.5 7.5-4.5 7.5-9.75 0-4.5-2.25-6-7.5-9z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

const NAV_LINKS = [
  { label: 'Features',     href: '#features'    },
  { label: 'Security',     href: '#security'     },
  { label: 'How it works', href: '#how-it-works' },
]

interface UserInfo {
  email: string
  username: string
}

export default function LandingNavbar() {
  const bgRef       = useRef<HTMLDivElement>(null)
  const borderRef   = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [mounted,  setMounted]  = useState(false)
  const [user,     setUser]     = useState<UserInfo | null>(null)
  const [loading,  setLoading]  = useState(true)

  // Mount slide-in
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Auth state — listen for sign-in / sign-out
  useEffect(() => {
    async function fetchUser(uid: string, email: string) {
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('id', uid)
        .maybeSingle()
      setUser({ email, username: data?.username ?? email.split('@')[0] })
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => {
      const s = data.session
      if (s) fetchUser(s.user.id, s.user.email ?? '')
      else    setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchUser(session.user.id, session.user.email ?? '')
      else { setUser(null); setLoading(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // IntersectionObserver for glass background — opacity only, no repaint
  useEffect(() => {
    const bg       = bgRef.current
    const border   = borderRef.current
    const sentinel = sentinelRef.current
    if (!bg || !border || !sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolled = !entry.isIntersecting
        bg.style.opacity     = scrolled ? '1' : '0'
        border.style.opacity = scrolled ? '1' : '0'
      },
      { threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? ''

  return (
    <>
      <div
        ref={sentinelRef}
        className="absolute top-[72px] left-0 w-px h-px pointer-events-none"
        aria-hidden
      />

      <nav
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{
          transform: mounted ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Glass background */}
        <div
          ref={bgRef}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0, background: 'rgba(3,18,12,0.92)', transition: 'opacity 0.3s ease' }}
          aria-hidden
        />
        {/* Bottom border */}
        <div
          ref={borderRef}
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{ opacity: 0, background: 'rgba(16,185,129,0.18)', transition: 'opacity 0.3s ease' }}
          aria-hidden
        />

        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center gap-2.5 group"
          style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.45s ease 0.05s' }}
        >
          <ShieldIcon className="w-5 h-5 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-white tracking-widest text-sm font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
            AEGIS
          </span>
        </Link>

        {/* Nav links */}
        <div className="relative hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={label}
              href={href}
              className="relative text-slate-400 hover:text-emerald-400 text-sm tracking-wide group"
              style={{
                opacity: mounted ? 1 : 0,
                transition: `opacity 0.45s ease ${0.1 + i * 0.07}s, color 0.2s`,
              }}
            >
              {label}
              <span
                className="absolute -bottom-0.5 left-0 h-px bg-emerald-500 w-0 group-hover:w-full"
                style={{ transition: 'width 0.28s cubic-bezier(0.16,1,0.3,1)' }}
              />
            </a>
          ))}
        </div>

        {/* Auth area */}
        <div
          className="relative flex items-center gap-3"
          style={{ opacity: mounted && !loading ? 1 : 0, transition: 'opacity 0.45s ease 0.31s' }}
        >
          {user ? (
            /* ── Signed-in state ── */
            <>
              {/* Avatar + username */}
              <div className="hidden sm:flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-slate-950 bg-emerald-400 shrink-0"
                  title={user.email}
                >
                  {initials}
                </div>
                <span className="text-slate-300 text-sm">{user.username}</span>
              </div>

              {/* Divider */}
              <span className="hidden sm:block w-px h-4 bg-slate-700" />

              {/* Go to chat */}
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg tracking-wide bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] transition-all duration-200"
              >
                Open chat
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            /* ── Signed-out state ── */
            <>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white text-sm px-4 py-2 rounded-lg tracking-wide transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link
                href="/login?mode=signup"
                className="text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg tracking-wide bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] transition-all duration-200"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}
