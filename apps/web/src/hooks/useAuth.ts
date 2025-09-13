'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Invalid credentials')
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const register = async (userData: {
    email: string
    password: string
    username: string
    firstName: string
    lastName: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
      }

      // After successful registration, sign in
      const loginResult = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        redirect: false,
      })

      if (loginResult?.error) {
        throw new Error('Registration successful but login failed')
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      }
    }
  }

  const requireAuth = (redirectTo: string = '/login') => {
    if (status === 'loading') return false
    if (!session) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  return {
    session,
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    accessToken: session?.accessToken,
    login,
    logout,
    register,
    requireAuth,
  }
}