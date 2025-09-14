'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '../common/Toast'
import Modal from './Modal'
import { 
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Wine {
  id: string
  title: string
  description: string
  price: number
  annata?: number
  region?: string
  country?: string
  producer?: string
  grapeVariety?: string
  alcoholContent?: number
  volume?: number
  wineType: string
  condition: string
  quantity: number
  status: string
  images: string[]
  seller: {
    id: string
    username: string
    firstName: string
    lastName: string
    verified: boolean
  }
  createdAt: string
}

interface WineEditModalProps {
  isOpen: boolean
  onClose: () => void
  wine: Wine | null
  onWineUpdated: () => void
}

const WINE_TYPES = ['RED', 'WHITE', 'ROSE', 'SPARKLING', 'DESSERT', 'FORTIFIED']
const WINE_CONDITIONS = ['EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR']
const WINE_STATUS = ['ACTIVE', 'SOLD', 'RESERVED', 'INACTIVE']

export default function WineEditModal({ isOpen, onClose, wine, onWineUpdated }: WineEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    annata: undefined as number | undefined,
    region: '',
    country: '',
    producer: '',
    grapeVariety: '',
    alcoholContent: undefined as number | undefined,
    volume: 750,
    wineType: 'RED',
    condition: 'EXCELLENT',
    quantity: 1,
    status: 'ACTIVE',
    images: [] as string[],
    adminNotes: ''
  })
  const [newImages, setNewImages] = useState<File[]>([])
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const { user: currentAdmin } = useAuth()
  const toast = useToast()

  // Reset form when wine changes
  useEffect(() => {
    if (wine) {
      setFormData({
        title: wine.title || '',
        description: wine.description || '',
        price: wine.price || 0,
        annata: wine.annata,
        region: wine.region || '',
        country: wine.country || '',
        producer: wine.producer || '',
        grapeVariety: wine.grapeVariety || '',
        alcoholContent: wine.alcoholContent,
        volume: wine.volume || 750,
        wineType: wine.wineType || 'RED',
        condition: wine.condition || 'EXCELLENT',
        quantity: wine.quantity || 1,
        status: wine.status || 'ACTIVE',
        images: wine.images || [],
        adminNotes: ''
      })
      setNewImages([])
      setRejectReason('')
    }
  }, [wine])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validImages = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB max
    )
    
    if (validImages.length !== files.length) {
      toast.warning('Some files were skipped', 'Only images under 5MB are allowed')
    }
    
    setNewImages(prev => [...prev, ...validImages].slice(0, 10)) // Max 10 images
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }))
  }

  const uploadImages = async (files: File[]): Promise<string[]> => {
    setUploading(true)
    try {
      // Simulate image upload - in real implementation, upload to cloud storage
      const uploadPromises = files.map(async (file) => {
        return new Promise<string>((resolve) => {
          setTimeout(() => {
            // Generate mock URL - replace with actual upload logic
            const mockUrl = `https://images.unsplash.com/photo-${Date.now()}-${Math.random()}.jpg?w=800&h=600`
            resolve(mockUrl)
          }, 1000)
        })
      })

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading images:', error)
      throw new Error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!wine || !currentAdmin) return

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      let uploadedImageUrls: string[] = []
      
      // Upload new images if any
      if (newImages.length > 0) {
        uploadedImageUrls = await uploadImages(newImages)
      }

      const updatedImages = [...formData.images, ...uploadedImageUrls]

      const response = await fetch(`http://localhost:3010/api/admin/wines/${wine.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: formData.status,
          adminNotes: formData.adminNotes,
          // Include other fields if backend supports full wine editing
          title: formData.title,
          description: formData.description,
          price: formData.price,
          annata: formData.annata,
          region: formData.region,
          country: formData.country,
          producer: formData.producer,
          grapeVariety: formData.grapeVariety,
          alcoholContent: formData.alcoholContent,
          volume: formData.volume,
          wineType: formData.wineType,
          condition: formData.condition,
          quantity: formData.quantity,
          images: updatedImages
        })
      })

      if (response.ok) {
        toast.success('Wine updated successfully', 'Changes have been saved to the system')
        onWineUpdated()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update wine')
      }
    } catch (error) {
      console.error('Error updating wine:', error)
      toast.error('Failed to update wine', error instanceof Error ? error.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!wine || !currentAdmin) return

    if (newStatus === 'INACTIVE') {
      setShowRejectConfirm(true)
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`http://localhost:3010/api/admin/wines/${wine.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: `Wine ${newStatus.toLowerCase()} by admin`
        })
      })

      if (response.ok) {
        toast.success(
          `Wine ${newStatus.toLowerCase()} successfully`,
          newStatus === 'ACTIVE' ? 'Wine is now visible to customers' : 'Status updated'
        )
        onWineUpdated()
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.message || `Failed to ${newStatus.toLowerCase()} wine`)
      }
    } catch (error) {
      console.error(`Error ${newStatus.toLowerCase()} wine:`, error)
      toast.error(`Failed to ${newStatus.toLowerCase()} wine`, error instanceof Error ? error.message : 'Please try again')
    }
  }

  const handleReject = async () => {
    if (!wine || !rejectReason.trim()) return

    try {
      const token = localStorage.getItem('adminToken')
      if (!token) throw new Error('No admin token')

      const response = await fetch(`http://localhost:3010/api/admin/wines/${wine.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'INACTIVE',
          adminNotes: rejectReason
        })
      })

      if (response.ok) {
        toast.success('Wine rejected successfully', 'Seller will be notified of the rejection')
        onWineUpdated()
        setShowRejectConfirm(false)
        setRejectReason('')
        onClose()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to reject wine')
      }
    } catch (error) {
      console.error('Error rejecting wine:', error)
      toast.error('Failed to reject wine', error instanceof Error ? error.message : 'Please try again')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      SOLD: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      RESERVED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.ACTIVE
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      SOLD: ClockIcon,
      ACTIVE: CheckCircleIcon,
      INACTIVE: XCircleIcon,
      RESERVED: TagIcon
    }
    return icons[status as keyof typeof icons] || ClockIcon
  }

  if (!wine) return null

  const StatusIcon = getStatusIcon(wine.status)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Wine: ${wine.title}`}
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
          {wine.status === 'ACTIVE' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('INACTIVE')}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('ACTIVE')}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Approve
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Wine Info Header */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {wine.images && wine.images.length > 0 ? (
                <img
                  src={wine.images[0]}
                  alt={wine.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                  <PhotoIcon className="h-8 w-8 text-gray-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{wine.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(wine.status)}`}>
                  <StatusIcon className="h-3 w-3 inline mr-1" />
                  {wine.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                  €{wine.price.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {wine.region}, {wine.country}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Listed {new Date(wine.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 space-y-1">
                <div>Seller: @{wine.seller.username}</div>
                <div>{wine.seller.verified ? '✓ Verified' : 'Unverified'}</div>
                <div>Qty: {wine.quantity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Price (€)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Producer</label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => handleInputChange('producer', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Vintage</label>
              <input
                type="number"
                value={formData.annata || ''}
                onChange={(e) => handleInputChange('annata', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Grape Variety</label>
              <input
                type="text"
                value={formData.grapeVariety}
                onChange={(e) => handleInputChange('grapeVariety', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Wine Type</label>
              <select
                value={formData.wineType}
                onChange={(e) => handleInputChange('wineType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {WINE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {WINE_CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Volume (ml)</label>
              <input
                type="number"
                value={formData.volume}
                onChange={(e) => handleInputChange('volume', parseInt(e.target.value) || 750)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Alcohol Content (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.alcoholContent || ''}
                onChange={(e) => handleInputChange('alcoholContent', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Images */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Wine Images</label>
          
          {/* Existing Images */}
          {formData.images.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">Current Images</h5>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Wine image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(imageUrl)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {newImages.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-600 mb-2">New Images to Upload</h5>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> wine images
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB each (max 10 images)</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Admin Controls</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {WINE_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
              <textarea
                value={formData.adminNotes}
                onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                placeholder="Add notes about this wine or actions taken..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Reject Wine</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject "{wine.title}"? The seller will be notified with your reason.
            </p>
            <div className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection (required)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectConfirm(false)
                    setRejectReason('')
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Wine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-900 font-medium">Uploading images...</p>
            <p className="text-gray-500 text-sm">Please wait while we process your images</p>
          </div>
        </div>
      )}
    </Modal>
  )
}