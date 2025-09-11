'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '../common/Toast'
import Modal from './Modal'
import { 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  phone?: string
  bio?: string
  location?: string
  avatar?: string
  verified: boolean
  banned: boolean
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  profileComplete: boolean
  createdAt: string
  _count?: {
    wines: number
    orders: number
  }
}

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUserUpdated: () => void
}

export default function UserEditModal({ isOpen, onClose, user, onUserUpdated }: UserEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [banLoading, setBanLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    bio: '',
    location: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
    verified: false,
    banned: false,
    adminNotes: ''
  })
  const [banReason, setBanReason] = useState('')
  const [showBanConfirm, setShowBanConfirm] = useState(false)

  const { user: currentAdmin } = useAuth()
  const toast = useToast()

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: user.location || '',
        role: user.role || 'USER',
        verified: user.verified || false,
        banned: user.banned || false,
        adminNotes: ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user || !currentAdmin) return

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`http://localhost:3010/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned: formData.banned,
          verified: formData.verified,
          role: formData.role,
          adminNotes: formData.adminNotes
        })
      })

      if (response.ok) {
        toast.success('User updated successfully', 'Changes have been saved to the system')
        onUserUpdated()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user', error instanceof Error ? error.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async () => {
    if (!user || !currentAdmin) return

    setBanLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`http://localhost:3010/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          banned: !user.banned,
          adminNotes: banReason || `User ${user.banned ? 'unbanned' : 'banned'} by admin`
        })
      })

      if (response.ok) {
        toast.success(
          user.banned ? 'User unbanned successfully' : 'User banned successfully',
          user.banned ? 'User can now access the platform' : 'User access has been restricted'
        )
        onUserUpdated()
        setShowBanConfirm(false)
        setBanReason('')
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.message || `Failed to ${user.banned ? 'unban' : 'ban'} user`)
      }
    } catch (error) {
      console.error(`Error ${user?.banned ? 'unbanning' : 'banning'} user:`, error)
      toast.error(`Failed to ${user?.banned ? 'unban' : 'ban'} user`, error instanceof Error ? error.message : 'Please try again')
    } finally {
      setBanLoading(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      USER: 'bg-gray-100 text-gray-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      SUPER_ADMIN: 'bg-purple-100 text-purple-800'
    }
    return colors[role as keyof typeof colors] || colors.USER
  }

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit User: ${user.firstName} ${user.lastName}`}
      size="2xl"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* User Info Header */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-medium">
                {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                {user.verified && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                {user.banned && (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 space-y-1">
                <div>{user._count?.wines || 0} wines listed</div>
                <div>{user._count?.orders || 0} orders placed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              User Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Verification Status
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => handleInputChange('verified', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Verified User
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Account Status
            </label>
            <button
              type="button"
              onClick={() => setShowBanConfirm(true)}
              className={`w-full px-3 py-2 text-sm font-medium rounded-lg ${
                user.banned 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            >
              {user.banned ? 'Unban User' : 'Ban User'}
            </button>
          </div>
        </div>

        {/* User Details */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">User Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled
              />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Admin Notes
            </label>
            <textarea
              value={formData.adminNotes}
              onChange={(e) => handleInputChange('adminNotes', e.target.value)}
              placeholder="Add notes about this user or actions taken..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Ban Confirmation Modal */}
      {showBanConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {user.banned ? 'Unban User' : 'Ban User'}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {user.banned 
                ? `Are you sure you want to unban ${user.firstName} ${user.lastName}? They will regain access to the platform.`
                : `Are you sure you want to ban ${user.firstName} ${user.lastName}? This will prevent them from accessing the platform.`
              }
            </p>
            <div className="space-y-3">
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder={user.banned ? "Reason for unbanning (optional)" : "Reason for banning (required)"}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBanConfirm(false)
                    setBanReason('')
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanUser}
                  disabled={banLoading || (!user.banned && !banReason.trim())}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    user.banned 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  {banLoading ? 'Processing...' : (user.banned ? 'Unban User' : 'Ban User')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}