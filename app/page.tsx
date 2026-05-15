import Link from 'next/link'
import GridBackground from '@/components/GridBackground'
import TerminalAnimation from '@/components/TerminalAnimation'
import LandingNavbar from '@/components/LandingNavbar'
import ScrollReveal from '@/components/ScrollReveal'
import Footer from '@/components/Footer'

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.25 3-7.5 4.5-7.5 9 0 5.25 3.75 8.25 7.5 9.75 3.75-1.5 7.5-4.5 7.5-9.75 0-4.5-2.25-6-7.5-9z" />
    </svg>
  )
}
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}
function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  )
}
function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}
function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
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
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

// Card style shared across sections
const CARD: React.CSSProperties = {
  background: 'rgba(4, 12, 32, 0.82)',
  boxShadow: 'inset 0 1px 0 rgba(16,185,129,0.06), 0 4px 32px rgba(0,0,0,0.3)',
}
const ICON_WRAP: React.CSSProperties = {
  background: 'rgba(16,185,129,0.08)',
  border: '1px solid rgba(16,185,129,0.18)',
}

export default function LandingPage() {
  return (
    <>
      <GridBackground />

      <div className="relative flex flex-col" style={{ zIndex: 1 }}>
        <LandingNavbar />

        {/* ── Hero ── */}
        <section className="relative z-10 min-h-[100dvh] flex items-center pt-20">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

              {/* Left copy */}
              <div className="flex flex-col gap-5">
                <ScrollReveal delay={0}>
                  <div className="inline-flex items-center gap-2 w-fit border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                      End-to-end encrypted
                    </span>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={80}>
                  <h1 className="text-4xl md:text-5xl text-white font-semibold tracking-tighter leading-[1.05]" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                    Communications
                    <br />
                    <span className="text-emerald-400">nobody else</span>
                    <br />
                    can read.
                  </h1>
                </ScrollReveal>

                <ScrollReveal delay={160}>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-[52ch]">
                    Aegis wraps every message in AES-256-GCM encryption before it
                    leaves your device. Keys are generated locally, never sent in
                    plaintext, and protected with ECDH — so only the intended
                    recipient can decrypt what you send.
                  </p>
                </ScrollReveal>

                <ScrollReveal delay={240}>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Link
                      href="/login?mode=signup"
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-slate-950 font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-200 tracking-wide"
                    >
                      Start a secure conversation
                      <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors duration-200 underline underline-offset-4 decoration-slate-700 hover:decoration-slate-400">
                      See how it works
                    </a>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={300}>
                  <div className="flex items-center gap-6 pt-2 border-t border-slate-800">
                    {[
                      { val: '256-bit', label: 'Key strength' },
                      { val: 'P-256',   label: 'ECDH curve' },
                      { val: '0',       label: 'Plaintext stored' },
                    ].map(({ val, label }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-emerald-400 text-base font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>{val}</span>
                        <span className="text-slate-500 text-xs tracking-wide">{label}</span>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>

              {/* Right: terminal */}
              <ScrollReveal delay={200} className="hidden md:block">
                <TerminalAnimation />
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="relative z-10 py-24 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal>
              <div className="mb-14">
                <span className="text-emerald-400 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  Features
                </span>
                <h2 className="text-3xl md:text-4xl text-white font-semibold tracking-tighter mt-2">
                  Everything you need,
                  <br />
                  <span className="text-slate-500">nothing you don&apos;t.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Wide feature */}
              <ScrollReveal delay={0} className="md:col-span-2">
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-8 flex flex-col gap-5 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                    <ChatIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-medium tracking-tight mb-2">Private conversations</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[52ch]">
                      Every conversation between two users is encrypted with a unique shared secret derived via ECDH.
                      No one else — including the server — can read what you send. Messages are decrypted only inside your browser.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex flex-wrap gap-x-6 gap-y-2" style={{ borderTop: '1px solid rgba(16,185,129,0.08)' }}>
                    {['Client-side decryption', 'Unique key per conversation', 'No server-side access'].map(t => (
                      <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                        <CheckIcon className="w-3 h-3 text-emerald-500 shrink-0" />{t}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-8 flex flex-col gap-5 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                    <UsersIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-lg font-medium tracking-tight">See who&apos;s online</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Real-time presence tracking shows you which users are currently active.
                    Start a conversation instantly — no invite links or friend requests needed.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={60}>
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-7 flex flex-col gap-4 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                    <ZapIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-base font-medium tracking-tight">Instant delivery</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Messages are pushed via Supabase Realtime subscriptions — no polling,
                    no page refresh. Typing indicators update live as you type.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-7 flex flex-col gap-4 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                    <KeyIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-base font-medium tracking-tight">Your keys, your control</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Encryption keys are generated in your browser on signup and never leave
                    your device in plaintext. We store only the encrypted form.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={180}>
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-7 flex flex-col gap-4 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                    <EyeOffIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-base font-medium tracking-tight">Minimal data footprint</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Only an email address is required to sign up. No phone number, no profile
                    photo, no metadata stored beyond what encryption demands.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="relative z-10 py-24 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal>
              <div className="mb-14">
                <span className="text-emerald-400 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  Protocol
                </span>
                <h2 className="text-3xl md:text-4xl text-white font-semibold tracking-tighter mt-2">
                  How the encryption works
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {[
                { step: '01', title: 'Local key generation', body: 'On signup, your browser generates an ECDH P-256 key pair. The private key is immediately encrypted with PBKDF2 (310 000 iterations) and only the wrapped key is sent to the server.' },
                { step: '02', title: 'Shared secret negotiation', body: 'When you open a conversation, both sides exchange public keys. ECDH derives a shared secret — entirely in the browser, never on the server.' },
                { step: '03', title: 'Per-message encryption', body: 'Each message is encrypted with AES-256-GCM using a fresh IV. A SHA-256 hash travels alongside so any tampering is caught before the message renders.' },
              ].map(({ step, title, body }, i) => (
                <ScrollReveal key={step} delay={i * 100}>
                  <div className="px-8 py-8 first:pl-0 last:pr-0 flex flex-col gap-4">
                    <span className="text-emerald-600 text-xs tracking-widest" style={{ fontFamily: 'var(--font-geist-mono)' }}>{step}</span>
                    <h3 className="text-white text-lg font-medium tracking-tight">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Security ── */}
        <section id="security" className="relative z-10 py-24 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <ScrollReveal>
              <div className="mb-14">
                <span className="text-emerald-400 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                  Security layers
                </span>
                <h2 className="text-3xl md:text-4xl text-white font-semibold tracking-tighter mt-2">
                  Built to be unreadable
                  <br />
                  <span className="text-slate-500">by design</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScrollReveal delay={0} className="md:col-span-2">
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-8 flex flex-col gap-6 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                      <LockIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-emerald-700 text-xs tracking-widest opacity-60" style={{ fontFamily: 'var(--font-geist-mono)' }}>PRIMARY</span>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-medium tracking-tight mb-2">AES-256-GCM Encryption</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[52ch]">
                      Every message is encrypted client-side before transmission. The server stores only ciphertext
                      and an IV — never plaintext. AES-256-GCM provides both confidentiality and authenticity in a single pass.
                    </p>
                  </div>
                  <div className="mt-auto pt-5 flex items-center gap-6" style={{ borderTop: '1px solid rgba(16,185,129,0.08)' }}>
                    {['256-bit keys', 'GCM authenticated', 'fresh IV per message'].map(tag => (
                      <span key={tag} className="text-xs tracking-widest" style={{ fontFamily: 'var(--font-geist-mono)', color: tag === '256-bit keys' ? 'rgba(52,211,153,0.8)' : 'rgba(100,116,139,0.7)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={80}>
                <div
                  className="h-full rounded-2xl border border-emerald-900/25 p-8 flex flex-col gap-5 transition-colors duration-300 hover:border-emerald-700/40"
                  style={CARD}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                    <KeyIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-lg font-medium tracking-tight">ECDH Key Exchange</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Elliptic-curve Diffie-Hellman on P-256 establishes a shared secret between peers.
                    The secret is never transmitted — only your public keys are.
                  </p>
                </div>
              </ScrollReveal>

              {[
                { Icon: EyeOffIcon, title: 'Zero-Knowledge Server',  body: 'Private keys are wrapped with PBKDF2 before leaving the browser. The server holds encrypted blobs it cannot unwrap.' },
                { Icon: ZapIcon,    title: 'Real-Time Delivery',     body: 'Supabase Realtime carries encrypted frames directly to the recipient. No unencrypted relay, no polling, sub-second delivery.' },
                { Icon: ShieldIcon, title: 'SHA-256 Integrity',      body: 'Every message is hashed on send and verified on receipt. Tampered or corrupted frames are rejected before they render.' },
              ].map(({ Icon, title, body }, i) => (
                <ScrollReveal key={title} delay={i * 80}>
                  <div
                    className="h-full rounded-2xl border border-emerald-900/25 p-7 flex flex-col gap-4 transition-colors duration-300 hover:border-emerald-700/40"
                    style={CARD}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={ICON_WRAP}>
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-white text-base font-medium tracking-tight">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative z-10 py-32 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
              <ScrollReveal className="flex flex-col gap-5 max-w-xl">
                <span className="text-emerald-400 text-xs tracking-widest uppercase" style={{ fontFamily: 'var(--font-geist-mono)' }}>Ready</span>
                <h2 className="text-3xl md:text-5xl text-white font-semibold tracking-tighter leading-tight">
                  Your messages stay
                  <br />
                  <span className="text-emerald-400">yours.</span>
                </h2>
                <p className="text-slate-400 text-base leading-relaxed">
                  No ads, no metadata mining, no plaintext. Just encrypted communications between people who trust each other.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={150} className="flex flex-col gap-3 items-start md:items-end">
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-slate-950 font-semibold px-8 py-4 rounded-xl text-sm transition-all duration-200 tracking-wide"
                >
                  Create your account
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <span className="text-slate-600 text-xs">No personal data required beyond an email address.</span>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
