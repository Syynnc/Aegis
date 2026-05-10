export interface User {
  id: string
  username: string
  public_key: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  room_id: string
  encrypted_message: string
  iv: string
  hash: string
  created_at: string
  sender?: User
}

export interface ChatRoom {
  id: string
  created_at: string
}

export interface DecryptedMessage extends Message {
  plaintext: string
  integrityVerified: boolean
  decryptionFailed?: boolean
}

