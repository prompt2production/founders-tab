import { useAuthContext } from '@/components/auth/auth-provider'

export function useAuth() {
  const context = useAuthContext()

  return {
    user: context.user,
    isLoading: context.isLoading,
    isAuthenticated: context.isAuthenticated,
    login: context.login,
    logout: context.logout,
    refreshUser: context.refreshUser,
  }
}
