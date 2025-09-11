'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'SUPER_ADMIN'
}

interface AuthContextType {
  user: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, isLoading, pathname, router])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const storedUser = localStorage.getItem('adminUser')
      
      if (!token || !storedUser) {
        setIsLoading(false)
        return
      }

      const userData = JSON.parse(storedUser)
      
      // Verify token is still valid by making an API call
      const response = await fetch('http://localhost:3010/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const profileData = await response.json()
        if (profileData.role === 'ADMIN' || profileData.role === 'SUPER_ADMIN') {
          setUser(profileData)
        } else {
          // Not an admin, clear storage
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
        }
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3010/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN')) {
        localStorage.setItem('adminToken', data.accessToken)
        localStorage.setItem('adminUser', JSON.stringify(data.user))
        setUser(data.user)
        return true
      } else if (response.ok && data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN') {
        throw new Error('Access denied. Admin privileges required.')
      } else {
        throw new Error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}