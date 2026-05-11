'use client'

import { useState } from 'react'
import type { DecryptedMessage } from '@/types'
import { formatTime, truncateHash } from '@/lib/helpers'

interface MessageBubbleProps {
  message: DecryptedMessage
  isMine: boolean
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className={`flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
      {/* Bubble */}
      <div
        className={`relative max-w-xs sm:max-w-sm lg:max-w-md ${
          isMine ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
            isMine
              ? 'bg-emerald-600 text-white rounded-br-sm'
              : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/60'
          } ${message.decryptionFailed ? 'opacity-60' : ''}`}
        >
          {message.decryptionFailed ? (
            <span className="flex items-center gap-1.5 text-xs text-red-300 italic">
              <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Unable to decrypt
            </span>
          ) : (
            message.plaintext
          )}
        </div>
      </div>

      {/* Timestamp + integrity */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-1 text-[11px] px-1 transition-colors ${
          message.integrityVerified
            ? 'text-slate-500 hover:text-emerald-400'
            : 'text-red-500 hover:text-red-400'
        }`}
        title="Click to view cryptographic details"
      >
        {message.integrityVerified ? (
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )}
        <span>{formatTime(message.created_at)}</span>
      </button>

      {/* Crypto details panel */}
      {showDetails && (
        <div
          className={`text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono space-y-1.5 w-72 ${
            isMine ? 'self-end' : 'self-start'
          }`}
        >
          <p className="text-slate-400 font-sans font-semibold text-[10px] uppercase tracking-wider mb-2">
            Cryptographic Details
          </p>
          {[
            { label: 'Algorithm', value: 'AES-GCM 256-bit', color: 'text-emerald-400' },
            { label: 'Key Exchange', value: 'ECDH P-256', color: 'text-emerald-400' },
            { label: 'Integrity', value: 'SHA-256', color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <span className="text-slate-500">{label}</span>
              <span className={color}>{value}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-slate-800 space-y-1.5">
            <div className="break-all">
              <span className="text-slate-500">IV: </span>
              <span className="text-blue-400">{message.iv}</span>
            </div>
            <div className="break-all">
              <span className="text-slate-500">Hash: </span>
              <span className={message.integrityVerified ? 'text-emerald-400' : 'text-red-400'}>
                {truncateHash(message.hash)}
              </span>
            </div>
            <div className="break-all">
              <span className="text-slate-500">Ciphertext: </span>
              <span className="text-slate-400">{message.encrypted_message.slice(0, 32)}…</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
