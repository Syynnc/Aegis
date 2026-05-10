'use client'

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { encryptMessage, hashMessage } from '@/lib/crypto'
import { useSecureSession } from '@/hooks/useSecureSession'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import type { User } from '@/types'
import Navbar from '@/components/Navbar'
import ChatBox from '@/components/ChatBox'

export default function ChatPage() {
  const {
    currentUser,
    otherUser,
    sharedKey,
    roomId,
    connected,
    statusText,
    setOtherUser,
    setSharedKey,
    setConnected,
    setStatusText,
  } = useSecureSession()

  const handleKeyExchanged = useCallback(
    (key: CryptoKey, other: User) => {
      setSharedKey(key)
      setOtherUser(other)
      setConnected(true)
      setStatusText('')
    },
    [setSharedKey, setOtherUser, setConnected, setStatusText]
  )

  const { messages, addMessage, isOtherTyping, sendTyping } = useRealtimeMessages({
    roomId,
    sharedKey,
    currentUserId: currentUser?.id ?? null,
    onKeyExchanged: handleKeyExchanged,
  })

  async function handleSend(text: string) {
    if (!sharedKey || !currentUser || !roomId) return
    const { ciphertext, iv } = await encryptMessage(sharedKey, text)
    const hash = await hashMessage(text)

    const { data } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        room_id: roomId,
        encrypted_message: ciphertext,
        iv,
        hash,
      })
      .select()
      .single()

    // Optimistically add own message — realtime deduplicates if the event also fires
    if (data) {
      addMessage({ ...data, plaintext: text, integrityVerified: true })
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">{statusText}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      <Navbar username={currentUser.username} />

      {statusText && (
        <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-900/20 border-b border-emerald-800/30 py-2">
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {statusText}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 p-4 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Participants
            </p>
            <div className="space-y-2">
              {[
                { user: currentUser, label: 'You' },
                ...(otherUser ? [{ user: otherUser, label: '' }] : []),
              ].map(({ user, label }) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/50"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
                    {user.username[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {user.username}
                      {label && (
                        <span className="ml-1.5 text-xs text-slate-500">({label})</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-600 truncate font-mono">
                      {user.public_key.slice(0, 20)}…
                    </p>
                  </div>
                </div>
              ))}

              {!otherUser && (
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-slate-700">
                  <div className="w-8 h-8 rounded-full border border-dashed border-slate-600 flex items-center justify-center">
                    <span className="text-slate-600 text-xs">?</span>
                  </div>
                  <p className="text-xs text-slate-600">Waiting for user…</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Security Status
            </p>
            <div className="space-y-2">
              {[
                { label: 'Auth', value: 'Supabase Auth', ok: true },
                { label: 'Channel', value: connected ? 'Encrypted' : 'Pending', ok: connected },
                { label: 'Key Exchange', value: sharedKey ? 'Complete' : 'Pending', ok: !!sharedKey },
                { label: 'Algorithm', value: 'AES-256-GCM', ok: true },
                { label: 'Key Type', value: 'ECDH P-256', ok: true },
                { label: 'Integrity', value: 'SHA-256', ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className={ok ? 'text-emerald-400' : 'text-slate-500'}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatBox
            messages={messages}
            currentUserId={currentUser.id}
            otherUser={otherUser}
            onSend={handleSend}
            connected={connected}
            isOtherTyping={isOtherTyping}
            onTyping={sendTyping}
          />
        </main>
      </div>
    </div>
  )
}
