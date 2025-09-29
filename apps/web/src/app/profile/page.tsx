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
  EyeSlashIcon,
  PlusIcon,
  HomeIcon,
  CameraIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ArrowUpIcon,
  ArrowDownIcon
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
  description?: string
  price: number
  status: string
  quantity: number
  images: string[]
  createdAt: string
  wineType: string
  annata?: number
  region?: string
  country?: string
  producer?: string
  grapeVariety?: string
  alcoholContent?: number
  volume?: number
  condition?: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  shippingCost: number
  createdAt: string
  updatedAt: string
  wine: {
    id: string
    title: string
    images: string[]
    wineType: string
    annata?: number
  }
  seller: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  quantity: number
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  revenueThisMonth: number
  revenueLastMonth: number
  averageOrderValue: number
  topSellingWine?: {
    id: string
    title: string
    totalSold: number
  }
}

interface SellerOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  shippingCost?: number
  createdAt: string
  trackingNumber?: string
  buyer: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  items: {
    id: string
    quantity: number
    price: number
    wine: {
      id: string
      title: string
      imageUrl?: string
      annata: number
    }
  }[]
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
  const [orders, setOrders] = useState<Order[]>([])

  // Dashboard data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(false)

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isEditingWine, setIsEditingWine] = useState(false)
  const [editingWineId, setEditingWineId] = useState<string | null>(null)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

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

  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    city: '',
    zipCode: '',
    state: '',
    country: '',
    phone: '',
    isDefault: false
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login?redirect=/profile')
      return
    }

    fetchProfileData()
  }, [session, status, router])

  useEffect(() => {
    if (activeTab === 'sales' && session && !dashboardLoading && !dashboardStats) {
      fetchDashboardData()
    }
  }, [activeTab, session, dashboardLoading, dashboardStats])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch profile, stats, wines, addresses, and orders in parallel
      const [profileRes, statsRes, winesRes, addressesRes, ordersRes] = await Promise.all([
        fetch('/api/users/me'),
        fetch('/api/users/me/stats'),
        fetch('/api/wines/my-wines'),
        fetch('/api/users/me/shipping-addresses'),
        fetch('/api/orders?limit=5&status=PENDING,PAID,SHIPPED,DELIVERED')
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

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || ordersData)
      }

    } catch (error) {
      console.error('Error fetching profile data:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true)

      // Fetch seller orders with current user as seller
      const ordersResponse = await fetch(`/api/orders?sellerId=${session?.user?.id}&limit=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders')
      }

      const ordersData = await ordersResponse.json()
      setSellerOrders(ordersData.orders || [])

      // Calculate basic stats from orders data
      const allOrders = ordersData.orders || []
      const pendingCount = allOrders.filter((order: SellerOrder) =>
        ['PENDING', 'CONFIRMED', 'PAID'].includes(order.status)
      ).length

      const thisMonth = new Date()
      thisMonth.setDate(1)
      const lastMonth = new Date(thisMonth)
      lastMonth.setMonth(lastMonth.getMonth() - 1)

      const thisMonthOrders = allOrders.filter((order: SellerOrder) =>
        new Date(order.createdAt) >= thisMonth
      )
      const lastMonthOrders = allOrders.filter((order: SellerOrder) =>
        new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < thisMonth
      )

      const revenueThisMonth = thisMonthOrders.reduce((sum: number, order: SellerOrder) =>
        sum + order.totalAmount, 0
      )
      const revenueLastMonth = lastMonthOrders.reduce((sum: number, order: SellerOrder) =>
        sum + order.totalAmount, 0
      )

      const averageOrderValue = allOrders.length > 0
        ? allOrders.reduce((sum: number, order: SellerOrder) => sum + order.totalAmount, 0) / allOrders.length
        : 0

      setDashboardStats({
        totalOrders: allOrders.length,
        pendingOrders: pendingCount,
        revenueThisMonth,
        revenueLastMonth,
        averageOrderValue,
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'In Attesa'
      case 'CONFIRMED':
        return 'Confermato'
      case 'PAID':
        return 'Pagato'
      case 'PROCESSING':
        return 'In Preparazione'
      case 'SHIPPED':
        return 'Spedito'
      case 'DELIVERED':
        return 'Consegnato'
      case 'CANCELLED':
        return 'Cancellato'
      default:
        return status
    }
  }

  const getRevenueChange = () => {
    if (!dashboardStats || dashboardStats.revenueLastMonth === 0) return { percentage: 0, isPositive: true }

    const change = ((dashboardStats.revenueThisMonth - dashboardStats.revenueLastMonth) / dashboardStats.revenueLastMonth) * 100
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0
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
      description: wine.description || '',
      price: wine.price,
      annata: wine.annata,
      region: wine.region || '',
      country: wine.country || '',
      producer: wine.producer || '',
      grapeVariety: wine.grapeVariety || '',
      alcoholContent: wine.alcoholContent,
      volume: wine.volume,
      wineType: wine.wineType as any,
      condition: wine.condition as any || '',
      quantity: wine.quantity,
      status: wine.status as any
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

  // Shipping Address handlers
  const handleAddAddress = () => {
    setAddressForm({
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      zipCode: '',
      state: '',
      country: '',
      phone: '',
      isDefault: false
    })
    setIsAddingAddress(true)
  }

  const handleEditAddress = (address: ShippingAddress) => {
    setEditingAddressId(address.id)
    setAddressForm({
      firstName: address.firstName,
      lastName: address.lastName,
      address1: address.address1,
      city: address.city,
      zipCode: address.zipCode,
      state: address.state,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault
    })
    setIsEditingAddress(true)
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const isEditing = editingAddressId !== null
      const url = isEditing
        ? `/api/users/me/shipping-addresses/${editingAddressId}`
        : '/api/users/me/shipping-addresses'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressForm),
      })

      if (response.ok) {
        const savedAddress = await response.json()

        if (isEditing) {
          setAddresses(prev => prev.map(addr =>
            addr.id === editingAddressId ? savedAddress : addr
          ))
          setIsEditingAddress(false)
          setEditingAddressId(null)
        } else {
          setAddresses(prev => [...prev, savedAddress])
          setIsAddingAddress(false)
        }

        setSuccess(isEditing ? 'Address updated successfully!' : 'Address added successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to save address')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      setError('Failed to save address')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/users/me/shipping-addresses/${addressId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId))
        setSuccess('Address deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      setError('Failed to delete address')
    }
  }

  const handleCancelAddressEdit = () => {
    setIsAddingAddress(false)
    setIsEditingAddress(false)
    setEditingAddressId(null)
    setAddressForm({
      firstName: '',
      lastName: '',
      address1: '',
      city: '',
      zipCode: '',
      state: '',
      country: '',
      phone: '',
      isDefault: false
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Il file deve essere inferiore a 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setError('Seleziona un file immagine valido')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return

    setIsUploadingAvatar(true)
    setError('')

    try {
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
      const file = fileInput?.files?.[0]

      if (!file) {
        setError('Nessun file selezionato')
        return
      }

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Errore nel caricamento')
      }

      const data = await response.json()

      if (profile) {
        setProfile({ ...profile, avatar: data.avatarUrl })
      }

      setAvatarPreview(null)
      setSuccess('Avatar aggiornato con successo!')

      // Reset file input
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError(error instanceof Error ? error.message : 'Errore nel caricamento avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCancelAvatarUpload = () => {
    setAvatarPreview(null)
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
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
              { id: 'sales', label: 'Vendite', icon: CurrencyEuroIcon },
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Attività Recente</h2>
                <div className="flex space-x-2">
                  <Link
                    href="/orders"
                    className="text-wine-600 hover:text-wine-700 text-sm font-medium"
                  >
                    Acquisti
                  </Link>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setActiveTab('sales')}
                    className="text-wine-600 hover:text-wine-700 text-sm font-medium"
                  >
                    Vendite
                  </button>
                </div>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-3">
                    <HeartIcon className="h-4 w-4 inline mr-1" />
                    I tuoi acquisti recenti
                  </div>
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        {/* Wine Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {order.wine.images && order.wine.images.length > 0 ? (
                            <Image
                              src={order.wine.images[0]}
                              alt={order.wine.title}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {order.wine.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Da: {order.seller.firstName} {order.seller.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantità: {order.quantity} • {formatPrice(order.totalAmount)}
                          </p>
                        </div>

                        {/* Order Status */}
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'PAID' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PENDING' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status === 'DELIVERED' ? 'Consegnato' :
                             order.status === 'SHIPPED' ? 'Spedito' :
                             order.status === 'PAID' ? 'Pagato' :
                             order.status === 'PENDING' ? 'In Attesa' :
                             'Annullato'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span>Ordine #{order.id.slice(-6)}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('it-IT')}</span>
                      </div>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-4">
                    <div className="text-center">
                      <button
                        onClick={() => setActiveTab('sales')}
                        className="text-wine-600 hover:text-wine-700 text-sm font-medium inline-flex items-center"
                      >
                        <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                        Vedi anche le tue vendite
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="space-y-4">
                    <ShoppingBagIcon className="h-12 w-12 mx-auto text-gray-300" />
                    <div>
                      <p className="text-gray-900 font-medium mb-2">Nessuna attività recente</p>
                      <p className="text-sm text-gray-600 mb-4">Inizia a comprare o vendere vini per vedere la tua attività qui</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <Link
                        href="/browse"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                      >
                        <HeartIcon className="h-4 w-4 mr-2" />
                        Compra Vini
                      </Link>
                      <Link
                        href="/sell"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                        Vendi Vini
                      </Link>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setActiveTab('sales')}
                        className="text-wine-600 hover:text-wine-700 text-sm font-medium"
                      >
                        O controlla la tua dashboard vendite →
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

        {activeTab === 'sales' && (
          <div className="space-y-8">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Orders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-wine-100 rounded-lg">
                    <ShoppingBagIcon className="h-6 w-6 text-wine-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ordini Totali</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats?.totalOrders || 0}</p>
                  </div>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Da Elaborare</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats?.pendingOrders || 0}</p>
                  </div>
                </div>
              </div>

              {/* Revenue This Month */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CurrencyEuroIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ricavi Mese</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(dashboardStats?.revenueThisMonth || 0)}
                    </p>
                    {dashboardStats && dashboardStats.revenueLastMonth > 0 && (
                      <div className="flex items-center text-sm">
                        {getRevenueChange().isPositive ? (
                          <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={getRevenueChange().isPositive ? 'text-green-600' : 'text-red-600'}>
                          {getRevenueChange().percentage.toFixed(1)}%
                        </span>
                        <span className="text-gray-500 ml-1">vs mese scorso</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Average Order Value */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Valore Medio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(dashboardStats?.averageOrderValue || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Seller Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Ordini Recenti di Vendita</h2>
                  <Link
                    href="/dashboard/orders"
                    className="text-wine-600 hover:text-wine-700 text-sm font-medium"
                  >
                    Vedi tutti →
                  </Link>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {sellerOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nessun ordine di vendita ancora
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Quando riceverai il tuo primo ordine, lo vedrai qui.
                    </p>
                    <Link
                      href="/sell"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                    >
                      Aggiungi Vino
                    </Link>
                  </div>
                ) : (
                  sellerOrders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              Ordine #{order.orderNumber}
                            </h3>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            da {order.buyer.firstName && order.buyer.lastName
                              ? `${order.buyer.firstName} ${order.buyer.lastName}`
                              : order.buyer.username}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {new Date(order.createdAt).toLocaleDateString('it-IT')}
                            </span>
                            <span className="flex items-center">
                              <ShoppingBagIcon className="h-4 w-4 mr-1" />
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} articoli
                            </span>
                            {order.trackingNumber && (
                              <span className="flex items-center">
                                <TruckIcon className="h-4 w-4 mr-1" />
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              Dettagli
                            </Link>
                            {['CONFIRMED', 'PAID'].includes(order.status) && (
                              <Link
                                href={`/dashboard/orders/${order.id}/manage`}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                              >
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Gestisci
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Azioni Rapide Vendite</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/sell"
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 transition-colors"
                >
                  Aggiungi Nuovo Vino
                </Link>

                <Link
                  href="/dashboard/orders?status=PENDING,CONFIRMED,PAID"
                  className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Ordini da Elaborare
                </Link>

                <Link
                  href="/dashboard/analytics"
                  className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Analytics e Report
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Avatar Upload Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Avatar del Profilo</h2>

              <div className="flex items-center space-x-6">
                {/* Current Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    {avatarPreview || profile?.avatar ? (
                      <Image
                        src={avatarPreview || profile?.avatar || ''}
                        alt="Avatar preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <UserIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  {!avatarPreview ? (
                    <div>
                      <label
                        htmlFor="avatar-upload"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 cursor-pointer transition-colors"
                      >
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Scegli Nuova Foto
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        JPG, PNG fino a 5MB. Raccomandato: 300x300px.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-700">Anteprima della nuova foto:</p>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUploadingAvatar ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Caricamento...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Conferma
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancelAvatarUpload}
                          disabled={isUploadingAvatar}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4 mr-2" />
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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

            {/* Shipping Addresses Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Shipping Addresses</h2>
                <button
                  onClick={handleAddAddress}
                  className="bg-wine-600 text-white px-4 py-2 rounded-md hover:bg-wine-700 transition-colors flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Address
                </button>
              </div>

              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                      {address.isDefault && (
                        <span className="absolute top-2 right-2 bg-wine-100 text-wine-800 text-xs font-medium px-2 py-1 rounded">
                          Default
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">
                          {address.firstName} {address.lastName}
                        </div>
                        <div className="text-gray-600">
                          {address.address1}
                        </div>
                        <div className="text-gray-600">
                          {address.city}, {address.state} {address.zipCode}
                        </div>
                        <div className="text-gray-600">
                          {address.country}
                        </div>
                        {address.phone && (
                          <div className="text-gray-600 flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {address.phone}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                        {!address.isDefault && (
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="flex-1 bg-red-100 text-red-700 py-2 px-3 rounded text-sm hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HomeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No shipping addresses</h3>
                  <p className="text-gray-600 mb-4">Add a shipping address to make checkout easier</p>
                  <button
                    onClick={handleAddAddress}
                    className="bg-wine-600 text-white px-6 py-3 rounded-md hover:bg-wine-700 transition-colors"
                  >
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Shipping Address Modal */}
      {(isAddingAddress || isEditingAddress) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {isAddingAddress ? 'Add Shipping Address' : 'Edit Shipping Address'}
              </h3>
              <button
                onClick={handleCancelAddressEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.firstName}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={addressForm.lastName}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.address1}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, address1: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-wine-500 focus:ring-wine-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4 text-wine-600 focus:ring-wine-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                  Set as default address
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelAddressEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-wine-600 hover:bg-wine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wine-500"
                >
                  {isAddingAddress ? 'Add Address' : 'Update Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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