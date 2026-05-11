'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { encryptMessage, hashMessage } from '@/lib/crypto'
import { useSecureSession } from '@/hooks/useSecureSession'
import { useOnlineUsers } from '@/hooks/useOnlineUsers'
import { usePrivateRoom } from '@/hooks/usePrivateRoom'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { useUnreadCounts } from '@/hooks/useUnreadCounts'
import type { OnlineUser } from '@/types'
import Navbar from '@/components/Navbar'
import ChatBox from '@/components/ChatBox'

export default function ChatPage() {
  const { currentUser, loading } = useSecureSession()
  const { users } = useOnlineUsers(currentUser?.id ?? null)
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const { unreadCounts, clearUnread, setActiveUser } = useUnreadCounts(currentUser?.id ?? null)

  const { roomId, sharedKey, status: roomStatus } = usePrivateRoom(
    currentUser?.id ?? null,
    selectedUser
  )

  const { messages, addMessage, isOtherTyping, sendTyping } = useRealtimeMessages({
    roomId,
    sharedKey,
    currentUserId: currentUser?.id ?? null,
  })

  async function handleSend(text: string) {
    if (!sharedKey || !currentUser || !roomId) return
    const { ciphertext, iv } = await encryptMessage(sharedKey, text)
    const hash = await hashMessage(text)

    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: currentUser.id, room_id: roomId, encrypted_message: ciphertext, iv, hash })
      .select()
      .single()

    if (data) addMessage({ ...data, plaintext: text, integrityVerified: true })
  }

  function handleSelectUser(user: OnlineUser) {
    setSelectedUser(user)
    setMobileView('chat')
    clearUnread(user.id)
    setActiveUser(user.id)
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      <Navbar username={currentUser.username} />

      <div className="flex flex-1 overflow-hidden">
        {/* User list sidebar */}
        <aside
          className={`
            flex flex-col w-full md:w-72 border-r border-slate-800 bg-slate-900/40 flex-shrink-0
            ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
          `}
        >
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Users</p>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {users.length === 0 && (
              <p className="text-xs text-slate-600 text-center mt-8 px-4">
                No other users registered yet.
              </p>
            )}
            {users.map((user) => {
              const isSelected = selectedUser?.id === user.id
              const unread = unreadCounts[user.id] ?? 0
              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-slate-800 border-r-2 border-emerald-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white uppercase">
                      {user.username[0]}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        user.isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                      {user.username}
                    </p>
                    <p className={`text-xs ${user.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  {unread > 0 && !isSelected ? (
                    <span className="flex-shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  ) : isSelected ? (
                    <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </button>
              )
            })}
          </div>

          {/* Security info footer */}
          <div className="px-4 py-3 border-t border-slate-800 space-y-1.5">
            {[
              { label: 'Auth', value: 'Supabase Auth' },
              { label: 'Encryption', value: 'AES-256-GCM' },
              { label: 'Key Exchange', value: 'ECDH P-256' },
              { label: 'Integrity', value: 'SHA-256' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-emerald-400 font-mono">{value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat area */}
        <main
          className={`
            flex-1 flex flex-col overflow-hidden
            ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
          `}
        >
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <div>
                <p className="text-slate-300 text-sm font-medium">Select a user to chat</p>
                <p className="text-slate-500 text-xs mt-1">Each conversation is end-to-end encrypted with a unique key.</p>
              </div>
            </div>
          ) : (
            <ChatBox
              messages={messages}
              currentUserId={currentUser.id}
              otherUser={selectedUser}
              onSend={handleSend}
              connected={roomStatus === 'ready'}
              isOtherTyping={isOtherTyping}
              onTyping={sendTyping}
              onBack={() => setMobileView('list')}
              roomStatus={roomStatus}
            />
          )}
        </main>
      </div>
    </div>
  )
}
