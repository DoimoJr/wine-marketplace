# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **wine marketplace monorepo** - a Vinted-style platform for buying and selling wines. Built with modern TypeScript stack using pnpm workspaces for independent deployment of backend and frontend applications.

## Architecture

### Monorepo Structure
- **Apps**: Deployable applications (`apps/`)
  - `api/` - NestJS REST API with PostgreSQL/Prisma 
  - `web/` - Next.js customer frontend
  - `admin/` - Next.js admin dashboard
- **Packages**: Shared libraries (`packages/`)
  - `database/` - Prisma client and schema
  - `shared/` - TypeScript types, utilities, constants
  - `ui/` - Reusable React components with Tailwind

### Key Technologies
- **Backend**: NestJS with class-validator DTO pattern
- **Database**: PostgreSQL with Prisma ORM (designed for Neon)
- **Frontend**: Next.js with NextAuth for authentication
- **Deployment**: Apps deploy independently to Render

## Fixed Port Configuration

**Standard Development Ports:**
- **API**: Port `3010` (NestJS backend)
- **Web**: Port `3000` (Next.js customer frontend)
- **Admin**: Port `3001` (Next.js admin dashboard)

## Common Commands

### Development
```bash
# Start all apps with fixed ports (RECOMMENDED)
pnpm dev                     # Auto-cleanup + start all services

# Alternative commands
pnpm dev:clean               # Same as pnpm dev (cleanup + start)
pnpm kill                    # Stop all development services

# Legacy individual start (not recommended)
pnpm --filter api dev        # NestJS API on :3010
pnpm --filter web dev        # Next.js web on :3000
pnpm --filter admin dev      # Next.js admin on :3001
```

### Database Operations
```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create and apply migrations
pnpm db:migrate

# Seed database with sample data
pnpm --filter database db:seed

# Open Prisma Studio
pnpm --filter database db:studio
```

### Build & Quality
```bash
# Build all packages and apps
pnpm build

# Run linting across monorepo
pnpm lint

# Type checking across monorepo  
pnpm type-check

# Clean all build artifacts
pnpm clean
```

### Testing
```bash
# API tests
pnpm --filter api test
pnpm --filter api test:watch
pnpm --filter api test:cov
```

## Architecture Patterns

### NestJS API Structure
- **Modular design**: Auth, Users, Wines, Orders, Messages, Admin modules
- **DTO validation**: All endpoints use class-validator DTOs for request/response
- **Guards & Decorators**: JWT authentication with role-based access control
- **Global services**: PrismaService available across all modules
- **Swagger docs**: Auto-generated at `/api/docs` in development

### Authentication Flow
- JWT tokens with refresh capability
- Google OAuth integration via Passport
- Role-based permissions (USER, ADMIN, SUPER_ADMIN)
- Public routes marked with `@Public()` decorator

### Database Design
- **Wine marketplace entities**: Users, Wines, Orders, Reviews, Messages
- **Advanced features**: Refund requests, admin logs, shipping addresses
- **Soft deletion**: Wines marked as INACTIVE rather than deleted
- **Audit trails**: CreatedAt/UpdatedAt timestamps on all entities

### Type Safety
- **End-to-end types**: Shared package ensures API contracts match frontend
- **Prisma integration**: Database types auto-generated and exported
- **Validation**: Runtime validation with class-validator matches TypeScript types

### Payment Integration
- PaymentService abstracts multiple providers (PayPal, Stripe, Escrow)
- Shipping label generation for automatic fulfillment
- Refund handling integrated with payment providers

## Environment Setup

The API expects these environment variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon recommended)
- `JWT_SECRET` - Secret for JWT token signing
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth configuration
- `WEB_URL` / `ADMIN_URL` - Frontend URLs for CORS and redirects

## Development Notes

### Adding New Features
1. **Database changes**: Update `packages/database/prisma/schema.prisma`
2. **Types**: Add to appropriate file in `packages/shared/src/types/`
3. **API**: Create DTO, Service, Controller in relevant `apps/api/src/` module
4. **Frontend**: Consume via shared types for full type safety

### Package Dependencies
- Use `workspace:*` for internal package references
- Install dependencies in correct workspace: `pnpm --filter <package> add <dep>`
- Shared dependencies should go in root for consistency

### Code Quality
- ESLint/Prettier configured across monorepo
- TypeScript strict mode enabled
- All API endpoints require proper DTO validation
- Swagger documentation required for all public endpoints

## MCP Server Integration

This project has 5 configured MCP servers that should be used proactively:

### 🚨 ALWAYS Use MCP Servers When Possible
- **PostgreSQL MCP**: For database queries, schema analysis, data exploration
- **GitHub MCP**: For repository operations, issue management, PR creation  
- **Playwright MCP**: For web scraping, browser automation, screenshot capture
- **File System MCP**: For advanced file operations, bulk processing, search
- **Fetch MCP**: For HTTP requests, API testing, external data retrieval

### MCP Priority Guidelines
1. **Database tasks** → Use PostgreSQL MCP instead of manual queries
2. **Repository tasks** → Use GitHub MCP for issues, PRs, repo analysis  
3. **Web scraping/testing** → Use Playwright MCP for automation
4. **File operations** → Use File System MCP for complex file tasks
5. **API calls** → Use Fetch MCP for external requests

**Rule**: When multiple approaches exist, always prefer MCP server capabilities over basic tools.

## Web App Development Roadmap

### Current State Analysis
The web application currently has:
- ✅ **Homepage** (`/`) - Basic landing page
- ✅ **Browse wines** (`/browse`) - Wine listing with filters (annata, region, price)
- ✅ **Sell wine** (`/sell`) - Wine listing creation
- ✅ **Authentication** - Login page with NextAuth integration
- ✅ **API Integration** - Wines, Auth, Upload endpoints connected

### 🚨 CRITICAL Features (Must implement first)

#### 1. **Wine Product Page** (`/wines/[id]`)
- **Status**: Missing
- **API**: `GET /wines/:id` available  
- **Components needed**:
  - Wine detail view with full information
  - Image gallery component
  - Add to cart button
  - Seller contact information
- **Priority**: Highest - Users can't view wine details or purchase

#### 2. **Shopping Cart System** (`/cart`)
- **Status**: ✅ **COMPLETED** - Multi-seller cart system implemented
- **API**: Full cart API with multi-seller support
- **Components implemented**:
  - Multi-seller cart page with seller grouping
  - Individual seller sections with shipping costs
  - Quantity controls and price calculations
  - Add/update/remove items functionality
  - Separate checkout per seller with batchId linking
- **Architecture**: CardMarket-style multi-seller approach solving shipping logistics

#### 3. **Checkout Process** (`/checkout`)
- **Status**: Missing
- **API**: `POST /orders` available, PaymentService implemented
- **Components needed**:
  - Shipping address form
  - Payment method selection
  - Order summary
  - Payment integration (PayPal/Stripe)
- **Priority**: Highest - Users can't complete purchases

#### 4. **User Profile** (`/profile`)
- **Status**: Missing
- **API**: `GET /users/profile`, `PATCH /users/profile` available
- **Components needed**:
  - Profile information editor
  - My wines listed section  
  - My purchase history
  - Account settings
- **Priority**: High - Users need profile management

#### 5. **User Registration** (`/register`)
- **Status**: Missing (only login exists)
- **API**: `POST /auth/register` available
- **Components needed**:
  - Registration form
  - Email verification flow
  - Welcome onboarding
- **Priority**: High - New users can't create accounts

### 📋 IMPORTANT Features (Second priority)

#### 6. **Order Management** (`/orders`)
- **Status**: Missing
- **API**: `GET /orders`, `GET /orders/:id` available
- **Components needed**:
  - Order history list
  - Order detail view
  - Tracking information
  - Order status updates

#### 7. **Messaging System** (`/messages`)
- **Status**: Missing (WebSocket backend ready)
- **API**: Messages Gateway with WebSocket support
- **Components needed**:
  - Chat interface
  - Conversation list
  - Real-time message updates
  - File/image sharing

#### 8. **Advanced Search & Filters**
- **Status**: Basic filters exist
- **API**: Wine filtering already available
- **Enhancements needed**:
  - Saved searches
  - Price range sliders
  - Multiple wine type selection
  - Sort by popularity/date/price

### 🎯 NICE-TO-HAVE Features (Third priority)

#### 9. **Reviews & Ratings**
- **Status**: Database schema exists, no UI
- **API**: Reviews endpoints available
- **Components needed**:
  - Rating system (stars)
  - Review submission form
  - Review display on wine pages
  - Seller reputation system

#### 10. **Wishlist/Favorites**
- **Status**: ✅ **COMPLETED** - Full wishlist and favorite sellers system implemented
- **API**: Complete wishlist and favorite sellers endpoints
- **Components implemented**:
  - Add/remove from wishlist buttons on wine cards and detail pages
  - Comprehensive wishlist page with tab system
  - Favorite sellers functionality with follow/unfollow
  - Heart-based UI patterns throughout application

### Implementation Priority Order
1. ✅ Wine product page → ✅ Cart → Checkout (critical purchase flow)
2. Registration → Profile (user management)
3. Orders → Messages (post-purchase experience)
4. Enhanced search → Reviews → ✅ Wishlist (engagement features)

### Technical Notes
- All API endpoints use the same JWT authentication system
- Frontend uses NextAuth with credentials provider
- PaymentService supports multiple payment providers
- Database schema already supports most features
- WebSocket messaging system is ready for real-time chat

## ✅ Multi-Seller Shopping Cart System

### Implementation Summary
**Status**: Completed - Full CardMarket-style multi-seller cart architecture

### Problem Solved
The original Vinted-style unified cart created shipping logistics problems since each seller needs to handle their own shipping. The new CardMarket approach groups items by seller, allowing independent shipping management while maintaining a unified user experience.

### Database Changes
- **Added `batchId` field** to Order model in `packages/database/prisma/schema.prisma`
- **Purpose**: Links related orders from same checkout session for administrative tracking
- **Updated with**: `pnpm --filter database db:push`

### Backend Implementation (`apps/api/src/orders/orders.service.ts`)

#### Core Architecture
- **Cart Storage**: Uses Orders with `status: PENDING` instead of separate cart table
- **Multi-seller Logic**: One cart order per seller per user
- **Shipping Calculation**: Per-seller shipping costs based on order value and item count

#### Key Methods Implemented
```typescript
// Groups cart items by seller with shipping costs
async getCart(userId: string): Promise<CartResponse>

// Finds existing seller cart or creates new one
async addToCart(userId: string, addToCartDto: AddToCartDto)

// Updates quantity within seller-specific cart
async updateCartItem(userId: string, wineId: string, quantity: number)

// Removes items from seller-specific cart
async removeFromCart(userId: string, wineId: string)

// Clears all cart orders for user
async clearCart(userId: string)

// Creates separate orders per seller with shared batchId
async checkoutCart(userId: string, checkoutCartDto: CheckoutCartDto)

// Calculates shipping based on order value and item count
private calculateShippingForSeller(totalValue: number, itemCount: number): number
```

#### Shipping Logic
```typescript
// Free shipping over €100, otherwise €5 base + €2 per additional item
if (totalValue >= 100) return 0;
return 5 + Math.max(0, itemCount - 1) * 2;
```

### Frontend Implementation (`apps/web/src/app/cart/page.tsx`)

#### Multi-Seller Interface
- **Seller Grouping**: Items grouped by seller with clear visual separation
- **Seller Headers**: Display seller name and individual shipping costs
- **Order Summary**: Shows breakdown per seller plus grand total
- **Individual Controls**: Quantity/remove controls per item within seller context

#### TypeScript Interfaces
```typescript
interface SellerCart {
  seller: { id: string; username: string; firstName: string; lastName: string }
  orderId: string
  items: CartItem[]
  subtotal: number
  shippingCost: number
  total: number
}

interface CartResponse {
  sellers: SellerCart[]
  grandTotal: number
  totalItems: number
}
```

### API Integration (`apps/web/src/app/api/cart/`)
- **Complete proxy structure** for all cart operations
- **Multi-endpoint support**: GET/POST/PATCH/DELETE across different routes
- **Type-safe integration** with backend service methods

### Benefits Achieved
1. **Shipping Logistics Solved**: Each seller manages their own shipping independently
2. **Order Separation**: Clear boundaries between different sellers' items
3. **Unified UX**: Still feels like single cart to user despite backend complexity
4. **Administrative Tracking**: batchId allows linking related orders from same session
5. **Scalable Architecture**: Supports unlimited sellers in single cart experience

### Testing Status
- **Backend API**: All cart endpoints tested and functional on :3010
- **Frontend Interface**: Cart page displays multi-seller structure on :3000
- **Integration**: Complete end-to-end workflow verified

## ✅ Favorite Sellers System

### Implementation Summary
**Status**: Completed - Full favorite sellers functionality with wishlist integration

### Problem Solved
Users needed the ability to save and follow preferred sellers in addition to favoriting wines, creating a comprehensive favorites system similar to modern marketplaces.

### Database Changes (`packages/database/prisma/schema.prisma`)
- **Added `FavoriteSeller` model** with proper user-seller relationships
- **Many-to-many relationship**: Users can follow multiple sellers, sellers can have multiple followers
- **Constraints**: `@@unique([userId, sellerId])` prevents duplicate favorites
- **Cascading deletes**: Proper cleanup when users or sellers are deleted

```prisma
model FavoriteSeller {
  id        String   @id @default(cuid())
  userId    String
  sellerId  String
  createdAt DateTime @default(now())

  user   User @relation("UserFavoriteSellers", fields: [userId], references: [id], onDelete: Cascade)
  seller User @relation("SellerFavorites", fields: [sellerId], references: [id], onDelete: Cascade)

  @@unique([userId, sellerId])
  @@map("favorite_sellers")
}
```

### Backend Implementation (`apps/api/src/favorite-sellers/`)

#### Complete NestJS Module
- **Service**: `favorite-sellers.service.ts` - CRUD operations with validation
- **Controller**: `favorite-sellers.controller.ts` - RESTful endpoints
- **DTOs**: Type-safe request/response validation
- **Module**: Integrated into main app module

#### Key API Endpoints
```typescript
POST   /favorite-sellers          // Add seller to favorites
GET    /favorite-sellers          // Get user's favorite sellers
DELETE /favorite-sellers/:id      // Remove seller from favorites
GET    /favorite-sellers/check/:id // Check if seller is favorited
```

#### Core Methods
```typescript
// Add seller to user's favorites with validation
async addFavoriteSeller(userId: string, sellerId: string)

// Remove seller from user's favorites
async removeFavoriteSeller(userId: string, sellerId: string)

// Get paginated list of user's favorite sellers
async getFavoriteSellers(userId: string, page: number, limit: number)

// Check if user has favorited specific seller
async isFavoriteSeller(userId: string, sellerId: string)
```

### Frontend Implementation

#### Wishlist Page Enhancement (`apps/web/src/app/wishlist/page.tsx`)
- **Tab System**: Clean separation between wines and sellers
- **Dual Loading**: Parallel fetching of wines and favorite sellers
- **Seller Cards**: Rich display with avatar, stats, and bio
- **Remove Functionality**: Individual seller unfavorite with loading states

#### Seller Profile Pages (`apps/web/src/app/sellers/[id]/page.tsx`)
- **Public Profile View**: Non-sensitive seller information display
- **Wine Listings**: Grid view of seller's available wines
- **Follow/Unfollow Button**: Heart-based UI with loading states
- **Statistics Display**: Sales, reviews, wine count, ratings
- **Responsive Design**: Mobile-first approach with Tailwind CSS

#### API Integration (`apps/web/src/app/api/favorite-sellers/`)
- **RESTful Structure**: Proper HTTP methods and status codes
- **Authentication**: JWT token validation for all operations
- **Error Handling**: Graceful degradation and user feedback
- **Type Safety**: Full TypeScript integration with shared types

### Security & Validation
- **Self-favoriting Prevention**: Users cannot favorite themselves
- **Authentication Required**: All operations require valid session
- **Data Validation**: Seller existence checks before operations
- **Rate Limiting**: Built-in protection against abuse

### UI/UX Features
- **Heart Icons**: Consistent favoriting metaphor across app
- **Loading States**: Smooth interactions with spinner feedback
- **Empty States**: Helpful messages and call-to-action buttons
- **Error Handling**: User-friendly error messages and retry options
- **Responsive Cards**: Seller information displays beautifully on all devices

## ✅ Seller Profile System & Auto-Purchase Prevention

### Implementation Summary
**Status**: Completed - Public seller profiles with comprehensive wine listings and purchase restrictions

### Seller Profile Features (`apps/web/src/app/sellers/[id]/page.tsx`)

#### Profile Header
- **Seller Information**: Name, username, avatar, verification badge
- **Location & Bio**: Optional location and biography display
- **Member Since**: Account creation date formatting
- **Follow Button**: Integrated with favorite sellers system

#### Statistics Section
- **Wine Count**: Current wines available for sale
- **Total Sales**: Historical sales performance
- **Review Metrics**: Average rating with star display
- **Activity Data**: Comprehensive seller performance overview

#### Wine Listings Grid
- **Responsive Layout**: 1-4 columns based on screen size
- **Wine Cards**: Image, title, type, vintage, region, price
- **Direct Links**: Each wine links to detail page
- **Pagination Support**: "View all wines" link for extensive catalogs

### Auto-Purchase Prevention System

#### Backend Validation (`apps/api/src/orders/orders.service.ts`)
```typescript
// Prevent users from buying their own wines
if (wine.sellerId === userId) {
  throw new BadRequestException('Cannot purchase your own wine');
}
```

#### Frontend UI Adaptation (`apps/web/src/app/wines/[id]/page.tsx`)
- **Conditional Rendering**: Different UI for own wines vs. other sellers
- **Disabled Add to Cart**: Replaced with "Questo è il tuo vino" message
- **Profile Redirection**: Sellers see "Il mio profilo" instead of "Vedi altri vini"
- **Hidden Actions**: Contact and follow buttons hidden for own wines

#### Session Management Fix
- **Critical Bug Fixed**: Changed `session?.user?.sub` to `session?.user?.id`
- **Authentication Consistency**: Aligned with NextAuth configuration
- **Verification Complete**: No remaining instances of incorrect property

### API Routes Implementation

#### User Profile API (`apps/web/src/app/api/users/[id]/`)
- **Public Profile**: `GET /api/users/[id]` - Non-sensitive user data
- **User Wines**: `GET /api/users/[id]/wines` - Seller's wine listings
- **Pagination Support**: Query parameters for page and limit
- **Error Handling**: 404 for non-existent users

#### Profile Data Security
- **Filtered Fields**: Only public information exposed
- **No Sensitive Data**: Email, phone, addresses excluded
- **Statistics Included**: Public metrics like sales and ratings
- **Image Handling**: Avatar and wine images properly served

### User Experience Improvements
- **Smart Navigation**: Context-aware profile links
- **Loading States**: Smooth transitions and feedback
- **Error Boundaries**: Graceful handling of missing data
- **Mobile Optimization**: Touch-friendly interface design
- **Italian Localization**: All text properly translated

### Testing & Validation
- **Backend API**: All endpoints tested and functional
- **Frontend Integration**: Seller profiles display correctly
- **Authentication**: Session management working properly
- **Purchase Prevention**: Auto-purchase blocking confirmed
- **Profile Redirection**: Sellers correctly redirected to personal profiles

## ✅ Wine Detail Page & Wishlist System

### Implementation Summary
**Status**: Completed - Comprehensive wine detail pages with full wishlist integration

### Wine Detail Page Features (`apps/web/src/app/wines/[id]/page.tsx`)

#### Core Information Display
- **Wine Details**: Title, producer, vintage (annata), region, description
- **Pricing**: Clear price display with EUR formatting
- **Wine Type**: Color-coded badges for wine categories
- **Condition & Quantity**: Stock management and condition indicators
- **Seller Information**: Profile links and verification status

#### Interactive Features
- **Image Gallery**: Multiple wine images with thumbnail navigation
- **Quantity Selector**: Add to cart with quantity controls
- **Wishlist Heart**: Toggle wine favorites with instant feedback
- **Seller Actions**: Follow seller, contact, view profile
- **Share Functionality**: Social sharing integration

#### Smart UI Adaptations
- **Owner Detection**: Special UI when viewing own wines
- **Stock Management**: Real-time quantity updates from cart
- **Authentication Prompts**: Login redirects for guest users
- **Loading States**: Smooth interactions with progress indicators

### Wishlist System Implementation

#### Backend API (`apps/api/src/wishlist/`)
- **Complete CRUD**: Add, remove, list, check wishlist items
- **Pagination**: Efficient handling of large wishlists
- **Validation**: Wine existence and availability checks
- **Authentication**: User-specific wishlist isolation

#### Frontend Integration
- **Heart Button**: Consistent UI pattern across all wine displays
- **Wishlist Page**: Dedicated page with comprehensive wine grid
- **Real-time Updates**: Instant feedback on wishlist changes
- **Empty States**: Helpful guidance for new users

#### Database Model
```prisma
model WishlistItem {
  id     String @id @default(cuid())
  userId String
  wineId String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  wine Wine @relation(fields: [wineId], references: [id], onDelete: Cascade)

  @@unique([userId, wineId])
  @@map("wishlist_items")
}
```

### Enhanced Features

#### Wine Cards (`apps/web/src/components/WineCard.tsx`)
- **Heart Button Integration**: Wishlist toggle on every wine card
- **Seller Quick Actions**: Follow seller directly from card
- **Responsive Design**: Optimal display across all screen sizes
- **Performance Optimized**: Efficient re-rendering and state management

#### Navigation Integration
- **Navbar Updates**: Wishlist link with item count badge
- **Context Awareness**: Different navigation for authenticated users
- **Mobile Friendly**: Touch-optimized interface elements

### Technical Implementation Details

#### API Route Structure
```
/api/wishlist/
  GET    /          # Get user's wishlist
  POST   /          # Add wine to wishlist
  DELETE /:wineId   # Remove wine from wishlist
  GET    /check/:id # Check if wine is in wishlist
```

#### State Management
- **React Hooks**: useState and useEffect for local state
- **Session Integration**: NextAuth session for user context
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Loading Management**: Granular loading states for better UX

### Performance & Security
- **Authentication Required**: All wishlist operations protected
- **Rate Limiting**: Backend protection against abuse
- **Caching Strategy**: Efficient data fetching and updates
- **Type Safety**: End-to-end TypeScript integration