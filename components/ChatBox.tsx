'use client'

import { useState, useRef, useEffect } from 'react'
import type { DecryptedMessage, User } from '@/types'
import MessageBubble from './MessageBubble'

interface ChatBoxProps {
  messages: DecryptedMessage[]
  currentUserId: string
  otherUser: User | null
  onSend: (text: string) => Promise<void>
  connected: boolean
  isOtherTyping: boolean
  onTyping: () => void
  onBack?: () => void
  roomStatus?: 'idle' | 'loading' | 'ready' | 'error'
}

export default function ChatBox({
  messages,
  currentUserId,
  otherUser,
  onSend,
  connected,
  isOtherTyping,
  onTyping,
  onBack,
  roomStatus,
}: ChatBoxProps) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending || !connected || !otherUser) return
    setSending(true)
    setInput('')
    try {
      await onSend(text)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2">
          {/* Mobile back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          {otherUser && (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                  {otherUser.username[0]}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    connected ? 'bg-emerald-400' : 'bg-slate-600'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{otherUser.username}</p>
                <p className="text-[11px] text-slate-500">
                  {roomStatus === 'loading' ? 'Establishing secure channel…'
                    : roomStatus === 'error' ? 'Key exchange failed'
                    : connected ? 'End-to-end encrypted'
                    : 'Connecting…'}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">AES-256-GCM</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">Secure channel established</p>
              <p className="text-slate-500 text-xs mt-1">Messages are encrypted end-to-end. No one else can read them.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <div className={`px-5 transition-all duration-200 ${isOtherTyping ? 'h-6 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>{otherUser?.username ?? 'The other user'} is typing</span>
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-800 bg-slate-950/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); onTyping() }}
              placeholder={
                !otherUser ? 'Waiting for another user…'
                : !connected ? 'Connecting…'
                : 'Type a message…'
              }
              disabled={!connected || !otherUser || sending}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || !connected || !otherUser || sending}
            className="flex items-center justify-center w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl transition-colors flex-shrink-0"
          >
            {sending ? (
              <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-[11px] text-slate-600 mt-1.5 text-center">
          Encrypted with AES-256-GCM · Click any message to view details
        </p>
      </div>
    </div>
  )
}
