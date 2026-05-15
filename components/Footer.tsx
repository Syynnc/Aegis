import Link from 'next/link'

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.25 3-7.5 4.5-7.5 9 0 5.25 3.75 8.25 7.5 9.75 3.75-1.5 7.5-4.5 7.5-9.75 0-4.5-2.25-6-7.5-9z" />
    </svg>
  )
}

const NAV_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features',     href: '#features'     },
      { label: 'Security',     href: '#security'      },
      { label: 'How it works', href: '#how-it-works'  },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in',      href: '/login'              },
      { label: 'Get started',  href: '/login?mode=signup'  },
    ],
  },
]

const BADGES = ['AES-256-GCM', 'ECDH P-256', 'PBKDF2', 'SHA-256']

export default function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-slate-800/60"
      style={{ background: 'rgba(2,6,23,0.85)' }}
    >
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Brand column */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <ShieldIcon className="w-5 h-5 text-emerald-400 transition-transform duration-300 group-hover:scale-110" />
            <span
              className="text-white tracking-widest text-sm font-semibold"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              AEGIS
            </span>
          </Link>

          <p className="text-slate-500 text-sm leading-relaxed max-w-[38ch]">
            End-to-end encrypted messaging. Your keys are generated in your browser
            and never leave your device in plaintext.
          </p>

          {/* Encryption badges */}
          <div className="flex flex-wrap gap-2 mt-1">
            {BADGES.map((b) => (
              <span
                key={b}
                className="text-xs px-2.5 py-1 rounded-full border border-emerald-900/50 text-emerald-600"
                style={{ fontFamily: 'var(--font-geist-mono)', background: 'rgba(16,185,129,0.05)' }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {NAV_COLS.map(({ heading, links }) => (
          <div key={heading} className="flex flex-col gap-4">
            <span
              className="text-slate-400 text-xs tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
              {heading}
            </span>
            <ul className="flex flex-col gap-3">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-slate-500 hover:text-emerald-400 text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Aegis. Built for secure communications.
          </span>
          <span
            className="text-slate-700 text-xs"
            style={{ fontFamily: 'var(--font-geist-mono)' }}
          >
            All encryption runs client-side &mdash; zero plaintext on server.
          </span>
        </div>
      </div>
    </footer>
  )
}
