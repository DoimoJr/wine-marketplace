'use client'

import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <LoadingSpinner message="Redirecting to login..." />
  }

  return <>{children}</>
}