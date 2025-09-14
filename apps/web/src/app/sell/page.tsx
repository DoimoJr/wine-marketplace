'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    annata: '',
    region: '',
    country: '',
    producer: '',
    grapeVariety: '',
    alcoholContent: '',
    volume: '750',
    wineType: 'RED',
    condition: 'EXCELLENT',
    quantity: '1'
  })

  const [images, setImages] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value)
      })
      
      // Add images
      images.forEach((image, index) => {
        submitData.append(`images`, image)
      })
      
      const response = await fetch('/api/wines', {
        method: 'POST',
        body: submitData,
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Wine created successfully:', result)
        // TODO: Redirect to wine listing or success page
        alert('Wine listing created successfully!')
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          annata: '',
          region: '',
          country: '',
          producer: '',
          grapeVariety: '',
          alcoholContent: '',
          volume: '750',
          wineType: 'RED',
          condition: 'EXCELLENT',
          quantity: '1'
        })
        setImages([])
      } else {
        const error = await response.json()
        console.error('Failed to create wine:', error)
        alert('Failed to create wine listing. Please try again.')
      }
    } catch (error) {
      console.error('Error creating wine:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentPage="sell" />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">List Your Wine</h1>
            <p className="text-gray-600">
              Create a listing for your wine collection. Provide detailed information to attract serious buyers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h2>
              
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Wine Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                  placeholder="e.g., Barolo DOCG Brunate 2018"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                  placeholder="Describe your wine: tasting notes, storage conditions, provenance..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price (EUR) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="85.50"
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                  />
                </div>
              </div>
            </div>

            {/* Wine Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Wine Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="wineType" className="block text-sm font-medium text-gray-700 mb-2">
                    Wine Type *
                  </label>
                  <select
                    id="wineType"
                    name="wineType"
                    required
                    value={formData.wineType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                  >
                    <option value="RED">Red Wine</option>
                    <option value="WHITE">White Wine</option>
                    <option value="ROSE">Rosé</option>
                    <option value="SPARKLING">Sparkling Wine</option>
                    <option value="DESSERT">Dessert Wine</option>
                    <option value="FORTIFIED">Fortified Wine</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
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
                  <label htmlFor="annata" className="block text-sm font-medium text-gray-700 mb-2">
                    Vintage Year
                  </label>
                  <input
                    type="number"
                    id="annata"
                    name="annata"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.annata}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="2018"
                  />
                </div>

                <div>
                  <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-2">
                    Volume (ml)
                  </label>
                  <input
                    type="number"
                    id="volume"
                    name="volume"
                    min="1"
                    value={formData.volume}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                  />
                </div>

                <div>
                  <label htmlFor="producer" className="block text-sm font-medium text-gray-700 mb-2">
                    Producer
                  </label>
                  <input
                    type="text"
                    id="producer"
                    name="producer"
                    value={formData.producer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="Giuseppe Rinaldi"
                  />
                </div>

                <div>
                  <label htmlFor="grapeVariety" className="block text-sm font-medium text-gray-700 mb-2">
                    Grape Variety
                  </label>
                  <input
                    type="text"
                    id="grapeVariety"
                    name="grapeVariety"
                    value={formData.grapeVariety}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="Nebbiolo"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="Piemonte"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="Italy"
                  />
                </div>

                <div>
                  <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Alcohol Content (%)
                  </label>
                  <input
                    type="number"
                    id="alcoholContent"
                    name="alcoholContent"
                    min="0"
                    max="50"
                    step="0.1"
                    value={formData.alcoholContent}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                    placeholder="14.5"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Images
              </h2>
              
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Max 10 images, 10MB each)
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPEG, PNG, WebP. High-quality images help sell your wine faster.
                </p>
                {images.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{images.length} image(s) selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-3 bg-wine-600 text-white rounded-md hover:bg-wine-700 transition-colors"
              >
                Create Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}