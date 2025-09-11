import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-wine-700">Wine Marketplace</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/browse" 
                className="text-gray-700 hover:text-wine-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Browse Wines
              </Link>
              <Link 
                href="/sell" 
                className="text-gray-700 hover:text-wine-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sell Wine
              </Link>
              <Link 
                href="/login" 
                className="text-white bg-wine-600 hover:bg-wine-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-wine-50 to-gold-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Discover Premium Wines</span>
              <span className="block text-wine-600">Buy & Sell with Confidence</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Connect with wine enthusiasts worldwide. Find rare vintages, sell your collection, 
              and discover exceptional wines from trusted sellers.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  href="/browse"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-wine-600 hover:bg-wine-700 md:py-4 md:text-lg md:px-10"
                >
                  Start Browsing
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/sell"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-wine-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sell Your Wine
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-wine-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Our Marketplace?
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-wine-600 text-white mx-auto">
                  🍷
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Premium Quality</h3>
                <p className="mt-2 text-base text-gray-500">
                  Curated selection of premium wines from verified sellers with quality guarantees.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-wine-600 text-white mx-auto">
                  🔒
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Transactions</h3>
                <p className="mt-2 text-base text-gray-500">
                  Safe and secure payment processing with buyer protection and escrow services.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-wine-600 text-white mx-auto">
                  📦
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Expert Shipping</h3>
                <p className="mt-2 text-base text-gray-500">
                  Professional packaging and shipping with automatic label generation and tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 Wine Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}