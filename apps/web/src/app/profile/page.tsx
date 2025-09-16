'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  UserIcon,
  PencilIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  ShoppingBagIcon,
  HeartIcon,
  TruckIcon,
  StarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Navbar from '../../components/Navbar'

interface UserProfile {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  phone?: string
  verified: boolean
  createdAt: string
}

interface UserStats {
  totalSales: number
  totalPurchases: number
  averageRating: number
  totalReviews: number
  totalWinesListed: number
  totalActiveListings: number
  memberSince: string
}

interface ShippingAddress {
  id: string
  firstName: string
  lastName: string
  address1: string
  city: string
  zipCode: string
  state: string
  country: string
  phone?: string
  isDefault: boolean
}

interface UserWine {
  id: string
  title: string
  price: number
  status: string
  quantity: number
  images: string[]
  createdAt: string
  wineType: string
  annata?: number
  region?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [userWines, setUserWines] = useState<UserWine[]>([])
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingWine, setIsEditingWine] = useState(false)
  const [editingWineId, setEditingWineId] = useState<string | null>(null)

  // Form data
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    phone: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [wineForm, setWineForm] = useState({
    title: '',
    description: '',
    price: 0,
    annata: undefined as number | undefined,
    region: '',
    country: '',
    producer: '',
    grapeVariety: '',
    alcoholContent: undefined as number | undefined,
    volume: undefined as number | undefined,
    wineType: 'RED' as const,
    condition: 'EXCELLENT' as const,
    quantity: 1,
    status: 'ACTIVE' as const
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/profile')
      return
    }

    fetchProfileData()
  }, [session, status, router])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch profile, stats, wines, and addresses in parallel
      const [profileRes, statsRes, winesRes, addressesRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/users/me/stats'),
        fetch('/api/wines/my-wines'),
        fetch('/api/users/me/shipping-addresses')
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
        setProfileForm({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          phone: profileData.phone || ''
        })
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (winesRes.ok) {
        const winesData = await winesRes.json()
        setUserWines(winesData.wines || winesData)
      }

      if (addressesRes.ok) {
        const addressesData = await addressesRes.json()
        setAddresses(addressesData)
      }

    } catch (error) {
      console.error('Error fetching profile data:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditingProfile(false)
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile')
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }

    try {
      const response = await fetch('/api/users/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        setIsEditingPassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setSuccess('Password changed successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setError('Failed to change password')
    }
  }

  const handleEditWine = (wine: UserWine) => {
    setEditingWineId(wine.id)
    setWineForm({
      title: wine.title,
      description: wine.description,
      price: wine.price,
      annata: wine.annata,
      region: wine.region || '',
      country: wine.country || '',
      producer: wine.producer || '',
      grapeVariety: wine.grapeVariety || '',
      alcoholContent: wine.alcoholContent,
      volume: wine.volume,
      wineType: wine.wineType,
      condition: wine.condition,
      quantity: wine.quantity,
      status: wine.status
    })
    setIsEditingWine(true)
  }

  const handleWineUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!editingWineId) return

    try {
      const response = await fetch(`/api/wines/${editingWineId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wineForm),
      })

      if (response.ok) {
        const updatedWine = await response.json()
        setUserWines(prev => prev.map(wine =>
          wine.id === editingWineId ? updatedWine : wine
        ))
        setIsEditingWine(false)
        setEditingWineId(null)
        setSuccess('Wine updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to update wine')
      }
    } catch (error) {
      console.error('Error updating wine:', error)
      setError('Failed to update wine')
    }
  }

  const handleCancelWineEdit = () => {
    setIsEditingWine(false)
    setEditingWineId(null)
    setWineForm({
      title: '',
      description: '',
      price: 0,
      annata: undefined,
      region: '',
      country: '',
      producer: '',
      grapeVariety: '',
      alcoholContent: undefined,
      volume: undefined,
      wineType: 'RED',
      condition: 'EXCELLENT',
      quantity: 1,
      status: 'ACTIVE'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getWineTypeColor = (type: string) => {
    switch (type) {
      case 'RED': return 'bg-red-100 text-red-800'
      case 'WHITE': return 'bg-yellow-100 text-yellow-800'
      case 'ROSE': return 'bg-pink-100 text-pink-800'
      case 'SPARKLING': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatWineType = (type: string) => {
    const typeMap: Record<string, string> = {
      'RED': 'Rosso',
      'WHITE': 'Bianco',
      'ROSE': 'Rosato',
      'SPARKLING': 'Spumante'
    }
    return typeMap[type] || type
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarSolidIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="profile" />
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-wine-600"></div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar currentPage="profile" />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
            <p className="text-gray-600 mb-4">Unable to load your profile information</p>
            <button
              onClick={() => fetchProfileData()}
              className="bg-wine-600 text-white px-4 py-2 rounded-md hover:bg-wine-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="profile" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              ) : (
                <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.verified && (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                )}
              </div>
              <p className="text-lg text-gray-600 mb-2">@{profile.username}</p>

              {profile.bio && (
                <p className="text-gray-700 mb-4">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    {profile.phone}
                  </div>
                )}
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Member since {new Date(profile.createdAt).toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-wine-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-wine-600">{stats.totalSales}</div>
                  <div className="text-sm text-gray-600">Sales</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPurchases}</div>
                  <div className="text-sm text-gray-600">Purchases</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalActiveListings}</div>
                  <div className="text-sm text-gray-600">Active Listings</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'wines', label: 'My Wines', icon: ShoppingBagIcon },
              { id: 'settings', label: 'Settings', icon: PencilIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-wine-500 text-wine-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="text-center text-gray-500 py-8">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Recent activity will appear here</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Statistics</h2>
              {stats && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Wines Listed</span>
                    <span className="font-semibold">{stats.totalWinesListed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Listings</span>
                    <span className="font-semibold">{stats.totalActiveListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{stats.totalReviews}</span>
                  </div>
                  {stats.averageRating > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average Rating</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(Math.round(stats.averageRating))}
                        <span className="text-sm text-gray-600 ml-2">
                          {stats.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wines' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Wine Listings</h2>
              <Link
                href="/sell"
                className="bg-wine-600 text-white px-4 py-2 rounded-md hover:bg-wine-700 transition-colors"
              >
                List New Wine
              </Link>
            </div>

            {userWines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userWines.map((wine) => (
                  <div key={wine.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      {wine.images.length > 0 ? (
                        <Image
                          src={wine.images[0]}
                          alt={wine.title}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWineTypeColor(wine.wineType)}`}>
                          {formatWineType(wine.wineType)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          wine.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {wine.status}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">{wine.title}</h3>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-wine-600">
                          {formatPrice(wine.price)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Qty: {wine.quantity}
                        </span>
                      </div>

                      <div className="mt-3 flex space-x-2">
                        <Link
                          href={`/wines/${wine.id}`}
                          className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleEditWine(wine)}
                          className="flex-1 bg-wine-600 text-white py-2 px-3 rounded text-sm hover:bg-wine-700 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No wines listed yet</h3>
                <p className="text-gray-600 mb-4">Start selling by listing your first wine</p>
                <Link
                  href="/sell"
                  className="bg-wine-600 text-white px-6 py-3 rounded-md hover:bg-wine-700 transition-colors"
                >
                  List Your First Wine
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-wine-600 text-white px-4 py-2 rounded-md hover:bg-wine-700 transition-colors flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      placeholder="+39 123 456 7890"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-wine-600 text-white px-6 py-2 rounded-md hover:bg-wine-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="text-gray-900">@{profile.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900">{profile.firstName || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900">{profile.lastName || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <p className="text-gray-900">{profile.bio || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{profile.location || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{profile.phone || '—'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Password Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Password</h2>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="bg-wine-600 text-white px-4 py-2 rounded-md hover:bg-wine-700 transition-colors flex items-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                )}
              </div>

              {isEditingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-wine-600 text-white px-6 py-2 rounded-md hover:bg-wine-700 transition-colors"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingPassword(false)
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">
                  Click "Change Password" to update your account password
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Wine Edit Modal */}
      {isEditingWine && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Wine Details</h3>
              <button
                onClick={handleCancelWineEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleWineUpdate} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={wineForm.title}
                    onChange={(e) => setWineForm({ ...wineForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={wineForm.price}
                    onChange={(e) => setWineForm({ ...wineForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wine Type *
                  </label>
                  <select
                    value={wineForm.wineType}
                    onChange={(e) => setWineForm({ ...wineForm, wineType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                    required
                  >
                    <option value="RED">Red</option>
                    <option value="WHITE">White</option>
                    <option value="ROSE">Rosé</option>
                    <option value="SPARKLING">Sparkling</option>
                    <option value="DESSERT">Dessert</option>
                    <option value="FORTIFIED">Fortified</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    value={wineForm.condition}
                    onChange={(e) => setWineForm({ ...wineForm, condition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                    required
                  >
                    <option value="MINT">Mint</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="VERY_GOOD">Very Good</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={wineForm.quantity}
                    onChange={(e) => setWineForm({ ...wineForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={wineForm.status}
                    onChange={(e) => setWineForm({ ...wineForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                    required
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Wine Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annata
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={wineForm.annata || ''}
                    onChange={(e) => setWineForm({ ...wineForm, annata: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={wineForm.region}
                    onChange={(e) => setWineForm({ ...wineForm, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={wineForm.country}
                    onChange={(e) => setWineForm({ ...wineForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producer
                  </label>
                  <input
                    type="text"
                    value={wineForm.producer}
                    onChange={(e) => setWineForm({ ...wineForm, producer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grape Variety
                  </label>
                  <input
                    type="text"
                    value={wineForm.grapeVariety}
                    onChange={(e) => setWineForm({ ...wineForm, grapeVariety: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alcohol Content (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={wineForm.alcoholContent || ''}
                    onChange={(e) => setWineForm({ ...wineForm, alcoholContent: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volume (ml)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={wineForm.volume || ''}
                    onChange={(e) => setWineForm({ ...wineForm, volume: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  value={wineForm.description}
                  onChange={(e) => setWineForm({ ...wineForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-wine-500 focus:border-wine-500"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelWineEdit}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-wine-600 text-white px-6 py-2 rounded-md hover:bg-wine-700 transition-colors"
                >
                  Update Wine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}