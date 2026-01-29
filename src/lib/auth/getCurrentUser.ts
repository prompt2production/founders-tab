import { getSessionCookie } from './cookies'
import { validateSession } from './session'

export type CurrentUser = {
  id: string
  email: string
  name: string
  avatarInitials: string | null
  role: 'FOUNDER' | 'MEMBER'
  companyId: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Get the current authenticated user from the session cookie
 * Returns null if not authenticated or session is expired
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getSessionCookie()

  if (!token) {
    return null
  }

  const user = await validateSession(token)

  if (!user) {
    return null
  }

  return user as CurrentUser
}
