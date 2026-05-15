'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  generateKeyPair, exportPublicKey, exportPrivateKey,
  deriveWrappingKey, encryptPrivateKeyForStorage, decryptPrivateKeyFromStorage,
} from '@/lib/crypto'
import { savePrivateKey, loadPrivateKey } from '@/lib/helpers'
import { supabase } from '@/lib/supabase'

type Mode = 'signin' | 'signup'

function LoginPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        await handleSignUp()
      } else {
        await handleSignIn()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleSignUp() {
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) throw new Error(signUpError.message)
    if (!data.user) throw new Error('Sign up failed — no user returned')
    if (!data.session) throw new Error('Email confirmation is enabled on this Supabase project. Disable it under Authentication → Settings → Email Auth.')

    const userId = data.user.id

    const keyPair = await generateKeyPair()
    const publicKeyJwk = await exportPublicKey(keyPair.publicKey)
    const privateKeyJwk = await exportPrivateKey(keyPair.privateKey)

    const salt = crypto.getRandomValues(new Uint8Array(16))
    const wrappingKey = await deriveWrappingKey(password, salt)
    const { encrypted: encryptedPrivKey, iv: privKeyIv } = await encryptPrivateKeyForStorage(privateKeyJwk, wrappingKey)
    const saltB64 = btoa(String.fromCharCode(...salt))

    const { error: profileError } = await supabase.from('users').insert({
      id: userId,
      username: username.trim(),
      public_key: publicKeyJwk,
      encrypted_private_key: encryptedPrivKey + ':' + privKeyIv,
      key_salt: saltB64,
    })

    if (profileError) {
      await supabase.auth.signOut()
      throw new Error(profileError.message)
    }

    savePrivateKey(userId, privateKeyJwk)
    router.push('/chat')
  }

  async function handleSignIn() {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw new Error(signInError.message)
    if (!data.user) throw new Error('Sign in failed')

    const userId = data.user.id

    const { data: profile } = await supabase
      .from('users')
      .select('id, encrypted_private_key, key_salt')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) {
      const keyPair = await generateKeyPair()
      const publicKeyJwk = await exportPublicKey(keyPair.publicKey)
      const privateKeyJwk = await exportPrivateKey(keyPair.privateKey)

      const salt = crypto.getRandomValues(new Uint8Array(16))
      const wrappingKey = await deriveWrappingKey(password, salt)
      const { encrypted: encryptedPrivKey, iv: privKeyIv } = await encryptPrivateKeyForStorage(privateKeyJwk, wrappingKey)
      const saltB64 = btoa(String.fromCharCode(...salt))

      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        username: username.trim(),
        public_key: publicKeyJwk,
        encrypted_private_key: encryptedPrivKey + ':' + privKeyIv,
        key_salt: saltB64,
      })
      if (insertError) throw new Error(insertError.message)
      savePrivateKey(userId, privateKeyJwk)
    } else if (profile.encrypted_private_key && profile.key_salt) {
      // Normal sign-in: decrypt the stored private key using the user's password
      try {
        const saltBytes = new Uint8Array(atob(profile.key_salt).split('').map((c) => c.charCodeAt(0)))
        const wrappingKey = await deriveWrappingKey(password, saltBytes)
        const [encrypted, iv] = profile.encrypted_private_key.split(':')
        const privateKeyJwk = await decryptPrivateKeyFromStorage(encrypted, iv, wrappingKey)
        savePrivateKey(userId, privateKeyJwk)
      } catch {
        throw new Error('Wrong password or corrupted key — unable to decrypt your private key.')
      }
    } else {
      // Legacy account without stored wrapped key — fall back to localStorage only
      const existingPrivKey = loadPrivateKey(userId)
      if (!existingPrivKey) {
        throw new Error('No private key found. Your account was created before key backup was supported. Please sign up again.')
      }
    }

    router.push('/chat')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Back to home — top-left corner */}
      <a
        href="/"
        className="fixed top-5 left-5 z-50 inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-xs font-medium tracking-wide px-3 py-1.5 rounded-full border border-slate-800 hover:border-emerald-900/60 bg-slate-900/60 backdrop-blur-sm transition-all duration-200 hover:bg-emerald-950/30"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to home
      </a>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-lg shadow-emerald-900/20">
            <svg
              className="w-8 h-8 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Aeg<span className="text-emerald-400">is</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Secure Encrypted Messaging</p>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-4">
          {(['signin', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${mode === m
                ? 'bg-slate-700 text-white'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <h2 className="text-lg font-semibold text-white mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {mode === 'signin'
              ? 'Your private key is decrypted locally using your password.'
              : 'A new ECDH P-256 key pair will be generated and encrypted with your password.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alice"
                  autoComplete="off"
                  required={mode === 'signup'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'signup' ? 'Generating keys…' : 'Signing in…'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
            {[
              { label: 'Authentication', value: 'Supabase Auth' },
              { label: 'Key Exchange', value: 'ECDH P-256' },
              { label: 'Encryption', value: 'AES-256-GCM' },
              { label: 'Key Backup', value: 'PBKDF2 + AES-GCM' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{label}</span>
                <span className="text-emerald-400 font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Private key encrypted with your password · stored securely in the DB
        </p>
      </div>
    </div>
  )
}

export default function LoginPageWrapper() {
  return <Suspense><LoginPage /></Suspense>
}
