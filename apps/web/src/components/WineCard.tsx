import Link from 'next/link'
import Image from 'next/image'

interface WineCardProps {
  wine: {
    id: string
    title: string
    description: string
    price: number
    imageUrl?: string
    annata?: number
    producer?: string
    region?: string
    country?: string
    wineType: string
    condition: string
    createdAt: string
    averageRating?: number
    totalReviews?: number
    _count?: {
      reviews: number
    }
  }
}

export default function WineCard({ wine }: WineCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'MINT': return 'text-green-600 bg-green-50'
      case 'EXCELLENT': return 'text-green-600 bg-green-50'
      case 'VERY_GOOD': return 'text-blue-600 bg-blue-50'
      case 'GOOD': return 'text-yellow-600 bg-yellow-50'
      case 'FAIR': return 'text-orange-600 bg-orange-50'
      case 'POOR': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  const getWineTypeColor = (type: string) => {
    switch (type) {
      case 'RED': return 'bg-red-100 text-red-800'
      case 'WHITE': return 'bg-yellow-100 text-yellow-800'
      case 'ROSE': return 'bg-pink-100 text-pink-800'
      case 'SPARKLING': return 'bg-blue-100 text-blue-800'
      case 'DESSERT': return 'bg-purple-100 text-purple-800'
      case 'FORTIFIED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/wines/${wine.id}`}>
        <div className="aspect-square relative bg-gray-100">
          {wine.imageUrl ? (
            <Image
              src={wine.imageUrl}
              alt={wine.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          )}
        </div>
      </Link>
        
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWineTypeColor(wine.wineType)}`}>
            {wine.wineType.toLowerCase().replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(wine.condition)}`}>
            {formatCondition(wine.condition)}
          </span>
        </div>

        <Link href={`/wines/${wine.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-wine-600 transition-colors cursor-pointer">
            {wine.title}
          </h3>
        </Link>

        {wine.producer && (
          <p className="text-sm text-gray-600 mb-1">{wine.producer}</p>
        )}

        <div className="flex items-center text-sm text-gray-500 mb-2">
          {wine.annata && <span>{wine.annata}</span>}
          {wine.annata && (wine.region || wine.country) && <span className="mx-1">•</span>}
          {wine.region && <span>{wine.region}</span>}
          {wine.region && wine.country && <span>, </span>}
          {wine.country && <span>{wine.country}</span>}
        </div>

        {/* Rating display */}
        {wine.averageRating != null && wine.totalReviews != null && wine.totalReviews > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(wine.averageRating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-gray-600">
                {wine.averageRating?.toFixed(1)} ({wine.totalReviews})
              </span>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {wine.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-wine-600">
            {formatPrice(wine.price)}
          </div>
          <Link href={`/wines/${wine.id}`}>
            <button className="bg-wine-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-wine-700 transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}