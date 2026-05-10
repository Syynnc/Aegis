export function savePrivateKey(userId: string, privateKey: string): void {
  localStorage.setItem(`aegis_privkey_${userId}`, privateKey)
}

export function loadPrivateKey(userId: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(`aegis_privkey_${userId}`)
}

export function clearPrivateKey(userId: string): void {
  localStorage.removeItem(`aegis_privkey_${userId}`)
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function truncateHash(hash: string): string {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`
}
