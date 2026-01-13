import { AuthProvider } from '@/components/auth/auth-provider'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background bg-gradient-to-br from-background via-background to-card">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
