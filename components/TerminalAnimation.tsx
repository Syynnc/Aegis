'use client'

import { useEffect, useRef } from 'react'

const LINES = [
  { color: '#64748b', text: '// Client-side key generation' },
  { color: '#34d399', text: 'const keyPair = await crypto.subtle' },
  { color: '#cbd5e1', text: '  .generateKey(ECDH_P256, ...)' },
  { color: '#64748b', text: '' },
  { color: '#64748b', text: '// PBKDF2 wraps private key' },
  { color: '#34d399', text: 'const wrappingKey = await deriveKey(' },
  { color: '#cbd5e1', text: '  password, salt, 310_000' },
  { color: '#34d399', text: ')' },
  { color: '#64748b', text: '' },
  { color: '#64748b', text: '// AES-256-GCM per message' },
  { color: '#34d399', text: 'const cipher = await encrypt(' },
  { color: '#cbd5e1', text: '  sharedSecret, iv, plaintext' },
  { color: '#34d399', text: ')' },
  { color: '#64748b', text: '' },
  { color: '#6ee7b7', text: '→ only ciphertext leaves device' },
]

const CHAR_MS  = 30
const LINE_MS  = 110
const END_MS   = 2400

export default function TerminalAnimation() {
  const outputRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const output = outputRef.current
    const cursor = cursorRef.current
    if (!output || !cursor) return

    let timerId: ReturnType<typeof setTimeout>
    let stopped = false

    function run() {
      if (stopped) return
      output!.innerHTML = ''
      typeLines(0, 0)
    }

    function typeLines(lineIdx: number, charIdx: number) {
      if (stopped) return

      if (lineIdx >= LINES.length) {
        // All lines done — pause then restart
        timerId = setTimeout(run, END_MS)
        return
      }

      const line = LINES[lineIdx]

      // Empty line — commit immediately
      if (line.text === '') {
        const el = document.createElement('div')
        el.style.height = '1.25rem'
        output!.appendChild(el)
        timerId = setTimeout(() => typeLines(lineIdx + 1, 0), LINE_MS)
        return
      }

      if (charIdx === 0) {
        // Start a new line element
        const el = document.createElement('div')
        el.dataset.line = String(lineIdx)
        el.style.color = line.color
        el.style.minHeight = '1.25rem'
        output!.appendChild(el)
      }

      if (charIdx < line.text.length) {
        // Type next char directly into the DOM — zero React re-render
        const el = output!.querySelector(`[data-line="${lineIdx}"]`) as HTMLElement
        if (el) el.textContent = line.text.slice(0, charIdx + 1)
        timerId = setTimeout(() => typeLines(lineIdx, charIdx + 1), CHAR_MS)
      } else {
        // Line complete — move cursor to next line
        timerId = setTimeout(() => typeLines(lineIdx + 1, 0), LINE_MS)
      }
    }

    run()

    return () => {
      stopped = true
      clearTimeout(timerId)
    }
  }, [])

  return (
    <div
      className="rounded-2xl border border-slate-800 p-5"
      style={{
        background: 'rgba(4, 12, 32, 0.82)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF605C]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD44]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#00CA4E]" />
        <span
          className="ml-2 text-slate-500 text-xs"
          style={{ fontFamily: 'var(--font-geist-mono)' }}
        >
          aegis — key exchange
        </span>
      </div>

      {/* Output — written directly via DOM, no re-renders */}
      <div
        ref={outputRef}
        className="text-xs leading-5 min-h-[200px]"
        style={{ fontFamily: 'var(--font-geist-mono)' }}
      />

      {/* Blinking cursor — pure CSS, no JS */}
      <div className="flex items-center gap-1 mt-1">
        <span className="text-emerald-400 text-xs" style={{ fontFamily: 'var(--font-geist-mono)' }}>{'>'}</span>
        <span
          ref={cursorRef}
          className="inline-block w-[7px] h-[13px] bg-emerald-400 rounded-[1px]"
          style={{ animation: 'cursor-blink 1s step-end infinite' }}
        />
      </div>
    </div>
  )
}
