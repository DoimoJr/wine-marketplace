'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface NavbarProps {
  currentPage?: 'home' | 'browse' | 'sell' | 'login'
}

export default function Navbar({ currentPage = 'home' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout, isLoading } = useAuth()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-wine-700">Wine Marketplace</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/browse" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'browse' 
                  ? 'text-wine-600 font-semibold' 
                  : 'text-gray-700 hover:text-wine-600'
              }`}
            >
              Browse Wines
            </Link>
            <Link 
              href="/sell" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 'sell' 
                  ? 'text-wine-600 font-semibold' 
                  : 'text-gray-700 hover:text-wine-600'
              }`}
            >
              Sell Wine
            </Link>
            {isLoading ? (
              <div className="px-4 py-2">
                <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.name || user?.username}
                </span>
                <button
                  onClick={logout}
                  className="text-white bg-wine-600 hover:bg-wine-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="text-white bg-wine-600 hover:bg-wine-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-wine-600 focus:outline-none focus:ring-2 focus:ring-wine-500 p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/browse" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'browse' 
                    ? 'text-wine-600 bg-wine-50 font-semibold' 
                    : 'text-gray-700 hover:text-wine-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Wines
              </Link>
              <Link 
                href="/sell" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'sell' 
                    ? 'text-wine-600 bg-wine-50 font-semibold' 
                    : 'text-gray-700 hover:text-wine-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sell Wine
              </Link>
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2 mx-3">
                  <span className="text-sm text-gray-700 py-2">
                    Welcome, {user?.name || user?.username}
                  </span>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="text-white bg-wine-600 hover:bg-wine-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-white bg-wine-600 hover:bg-wine-700 px-3 py-2 rounded-md text-sm font-medium transition-colors mx-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}