import { type AuthUser } from '@/auth/types'

export const AUTH_SYNC_CHANNEL = 'zbc-auth-sync'

export const AUTH_STORAGE_KEYS = {
  access: 'react-vite-laravel.bearer_token',
  refresh: 'react-vite-laravel.refresh_token',
  user: 'react-vite-laravel.auth_user',
} as const

export type AuthSyncMessage =
  | {
      type: 'login'
      token?: string
      refreshToken?: string | null
      user: AuthUser | null
    }
  | { type: 'logout' }

type AuthSyncListener = (message: AuthSyncMessage) => void

let channel: BroadcastChannel | null = null

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null
  }
  if (!channel) {
    channel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
  }
  return channel
}

export function publishAuthSync(message: AuthSyncMessage) {
  getChannel()?.postMessage(message)
}

export function subscribeAuthSync(listener: AuthSyncListener): () => void {
  const ch = getChannel()
  if (!ch) return () => undefined

  const handler = (event: MessageEvent<AuthSyncMessage>) => {
    listener(event.data)
  }
  ch.addEventListener('message', handler)
  return () => ch.removeEventListener('message', handler)
}
