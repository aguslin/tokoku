# Enterprise-Grade Ecommerce Marketplace

A production-ready, scalable ecommerce marketplace built with Next.js 16, featuring modern UI, advanced state management, and enterprise patterns.

## Architecture Overview

This marketplace follows a feature-based, scalable architecture designed for enterprise applications with clear separation of concerns and reusable components.

### Directory Structure

```
/app
  /(auth)                    # Authentication routes (login, register, forgot-password)
  /(user)                    # Customer-facing routes (marketplace, cart, checkout, orders)
  /(admin)                   # Admin dashboard and management
  layout.tsx                 # Root layout with SEO and viewport config

/components
  /shared                    # Reusable UI components (Button, Card, Modal, DataTable, etc.)
  /features                  # Feature-specific components (organized by feature)

/lib
  /api                       # API client abstraction with error handling
  /store                     # Zustand stores for state management
  /schemas                   # Zod validation schemas
  /mock-data                 # Mock data for development
  /constants                 # Design system tokens and constants
  /services                  # Business logic services

/hooks                       # Custom React hooks

/types                       # TypeScript type definitions

/public                      # Static assets
```

## Key Features

### 1. State Management (Zustand)
- **AuthStore**: User authentication and profile
- **CartStore**: Shopping cart with localStorage persistence
- **WishlistStore**: Favorite products management
- **VoucherStore**: Discount code management
- **UIStore**: Global UI state (modals, toasts, loading states)

### 2. Shared Component System
- **Button**: Multiple variants (primary, secondary, outline, ghost, destructive) and sizes
- **Card**: Flexible container with optional hover effects
- **Modal**: Reusable modal dialogs with backdrop control
- **FormField**: Text input with validation error display
- **DataTable**: Enterprise-grade table with sorting, filtering, search, pagination, bulk actions
- **Badge**: Status indicators with multiple variants
- **RatingStars**: Interactive rating component
- **Skeleton**: Loading skeleton for async content

### 3. Form Validation (React Hook Form + Zod)
- **Auth Schemas**: Login, register, forgot password, reset password
- **Cart Schemas**: Add to cart, update cart, apply vouchers, checkout
- Client-side validation with real-time feedback
- Type-safe form handling

### 4. Design System
- **Baby Blue Color Palette**: Soft, modern aesthetics
- **Semantic Color Tokens**: Primary, secondary, success, warning, destructive, info
- **Spacing Scale**: Consistent rem-based spacing
- **Typography Scale**: Heading and body text sizes
- **Shadow System**: sm, md, lg, xl shadow depths
- **Component Sizing**: Standardized button and input heights

### 5. API Layer
- Centralized API client with error handling
- Request timeout management
- Centralized error handling and logging
- Support for mock data during development
- Prepared for backend integration

### 6. Responsive Design
- Mobile-first approach
- 4 breakpoints: mobile, tablet, desktop, wide desktop
- Touch-friendly spacing (48px minimum for touch targets)
- Responsive tables with scroll on mobile
- Responsive modals and drawers

## Pages & Routes

### Public Routes
- `/` - Homepage with hero, categories, flash sale, featured products, testimonials
- `/(auth)/login` - User login with form validation
- `/(auth)/register` - User registration with password strength indicator

### User Routes
- `/(user)/marketplace` - Product listing with filters, sorting, search
- `/(user)/marketplace/[id]` - Product detail page with gallery and reviews
- `/(user)/cart` - Shopping cart management
- `/(user)/checkout` - Checkout flow with address and payment info
- `/(user)/order-confirmation` - Order success page
- `/(user)/orders` - Order history
- `/(user)/orders/[id]` - Order detail page
- `/(user)/profile` - User profile and settings
- `/(user)/wishlist` - Saved products

### Admin Routes
- `/(admin)/dashboard` - Admin overview with stats and DataTable examples
- `/(admin)/orders` - Order management with CRUD operations
- `/(admin)/users` - User management
- `/(admin)/products` - Product management
- `/(admin)/sellers` - Seller management and verification
- `/(admin)/vouchers` - Discount code management

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

### Project Structure

1. **Design System**: Defined in `/lib/constants/design-system.ts`
2. **Stores**: Located in `/lib/store/` with proper TypeScript types
3. **Schemas**: Validation schemas in `/lib/schemas/`
4. **Mock Data**: Development data in `/lib/mock-data/`
5. **Components**: Reusable components in `/components/shared/`

## Development Guidelines

### Adding New Components

1. Create component in `/components/shared/`
2. Export from `/components/shared/index.ts`
3. Use Tailwind CSS with semantic tokens
4. Implement proper TypeScript types
5. Add JSDoc comments for props

### Adding New Pages

1. Create in appropriate route group
2. Use 'use client' for interactive components
3. Import shared components and utilities
4. Follow layout patterns from existing pages

### Adding New Stores

1. Create new file in `/lib/store/`
2. Use Zustand with TypeScript
3. Export from `/lib/store/index.ts`
4. Use `persist` middleware for data persistence

### Form Validation

1. Create schema in `/lib/schemas/`
2. Use React Hook Form with `zodResolver`
3. Use `FormField` component for inputs
4. Display validation errors automatically

## Best Practices

### Performance
- Use Next.js Image component for images
- Lazy load non-critical sections
- Memoize expensive components
- Avoid unnecessary re-renders with useCallback

### Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus states for all interactive elements
- Color contrast compliance

### Security
- Sanitize user input
- Validate on both client and server
- Use environment variables for secrets
- Implement proper error handling

### SEO
- Proper metadata in layout
- OpenGraph tags
- Semantic HTML
- Heading hierarchy

## Mock Data

The marketplace comes with comprehensive mock data:
- **Products**: 4 products with images, ratings, descriptions
- **Sellers**: 3 verified and non-verified sellers
- **Categories**: 6 product categories
- **Testimonials**: Customer reviews and ratings
- **Vouchers**: Sample discount codes

## Customization

### Colors
Edit `/app/globals.css` to change the baby blue color palette to your brand colors.

### Typography
Adjust font sizes in `/lib/constants/design-system.ts`

### Spacing
Modify the spacing scale in design constants

### Components
All shared components are in `/components/shared/` and can be customized

## Future Enhancements

- Real backend integration with database
- User authentication with Auth.js
- Payment processing with Stripe
- Image upload with Vercel Blob
- Email notifications
- Real-time notifications with WebSockets
- Advanced product filtering and search
- Review and rating system
- Seller dashboard and management
- Analytics and reporting

## Technologies Used

- **Framework**: Next.js 16 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS with semantic tokens
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Validation**: Zod
- **UI Icons**: Lucide React
- **Date Handling**: date-fns

## Performance Metrics

- Mobile-optimized with responsive design
- Lightweight bundle with minimal animations
- Fast load times with lazy loading
- Optimized images with Next.js Image component
- Efficient state updates with Zustand

## Support & Documentation

For detailed component documentation, refer to the specific component files in `/components/shared/`.

For API client usage, see `/lib/api/client.ts`.

For store management, see `/lib/store/index.ts`.
