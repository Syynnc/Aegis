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
    <div className={`flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
      <div
        className={`relative max-w-xs sm:max-w-md lg:max-w-lg group ${
          isMine ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
            isMine
              ? 'bg-emerald-600 text-white rounded-br-sm'
              : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700'
          } ${message.decryptionFailed ? 'opacity-60' : ''}`}
        >
          {message.decryptionFailed ? (
            <span className="flex items-center gap-2 text-xs text-red-300 italic">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
              Unable to decrypt message
            </span>
          ) : (
            message.plaintext
          )}
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`mt-1 flex items-center gap-1.5 text-xs transition-colors ${
            message.integrityVerified
              ? 'text-emerald-500 hover:text-emerald-400'
              : 'text-red-500 hover:text-red-400'
          }`}
          title="Click to see cryptographic details"
        >
          {message.integrityVerified ? (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Verified · {formatTime(message.created_at)}</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Integrity check failed · {formatTime(message.created_at)}</span>
            </>
          )}
        </button>
      </div>

      {showDetails && (
        <div
          className={`w-full max-w-xs sm:max-w-md text-xs bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono space-y-2 ${
            isMine ? 'self-end' : 'self-start'
          }`}
        >
          <p className="text-slate-400 font-sans font-semibold text-xs uppercase tracking-wider mb-2">
            Cryptographic Details
          </p>
          <div>
            <span className="text-slate-500">Algorithm: </span>
            <span className="text-emerald-400">AES-GCM 256-bit</span>
          </div>
          <div>
            <span className="text-slate-500">Key Exchange: </span>
            <span className="text-emerald-400">ECDH P-256</span>
          </div>
          <div>
            <span className="text-slate-500">Integrity: </span>
            <span className="text-emerald-400">SHA-256</span>
          </div>
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
      )}
    </div>
  )
}
