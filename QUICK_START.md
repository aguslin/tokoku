# Quick Start Guide

## Project Setup

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Open http://localhost:3000
```

## Explore the Marketplace

### Main Pages
- **Homepage** (`/`): Hero, categories, flash sales, featured products
- **Login** (`/login`): User authentication
- **Register** (`/register`): Create new account
- **Marketplace** (`/marketplace`): Browse products with filters
- **Cart** (`/cart`): Shopping cart management
- **Checkout** (`/checkout`): Complete purchase
- **Orders** (`/orders`): Order history
- **Admin Dashboard** (`/dashboard`): Admin overview and management

### Key Features to Try

1. **Browse Products**
   - Go to `/marketplace`
   - Use filters: category, price range
   - Sort by: relevance, price, rating
   - Toggle grid/list view
   - Add to favorites (heart icon)
   - Add to cart

2. **Shopping Experience**
   - Go to `/cart` to view items
   - Adjust quantities
   - Proceed to checkout
   - Fill shipping address
   - Select payment method
   - Complete order

3. **Admin Dashboard**
   - Go to `/dashboard`
   - View key metrics
   - Click on tabs: Overview, Orders, Users, Products
   - Try sorting, searching, filtering
   - Export data
   - View order details in modal

4. **Authentication**
   - Try login at `/login`
   - Create account at `/register`
   - See password strength indicator
   - Form validation in real-time

## File Structure

```
/app                          # Next.js App Router
  /(auth)/login              # Login page
  /(auth)/register           # Registration page
  /(user)/marketplace        # Product listing
  /(user)/cart              # Shopping cart
  /(user)/checkout          # Checkout page
  /(user)/orders            # Order history
  /(admin)/dashboard        # Admin dashboard
  page.tsx                  # Homepage
  layout.tsx                # Root layout

/components/shared          # Reusable components
  /button.tsx              # Button component
  /card.tsx                # Card component
  /modal.tsx               # Modal component
  /form-field.tsx          # Form field
  /data-table.tsx          # Admin table
  /badge.tsx               # Status badge
  /rating-stars.tsx        # Star ratings
  /skeleton.tsx            # Loading skeleton

/lib
  /api                     # API client
  /store                   # Zustand stores
  /schemas                 # Zod validation
  /mock-data               # Mock data
  /constants               # Design tokens

/public                    # Static assets
```

## State Management (Zustand)

All stores are in `/lib/store/`:

```typescript
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/store';
import { useVoucherStore } from '@/lib/store';
import { useUIStore } from '@/lib/store';
```

### Cart Store Example
```typescript
const { items, total, addItem, removeItem, updateQuantity } = useCartStore();
```

## Shared Components

All in `/components/shared/`:

```typescript
import { Button, Card, Modal, FormField, DataTable, Badge, RatingStars } from '@/components/shared';

// Button
<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>

// Card
<Card hoverable>
  Content here
</Card>

// DataTable
<DataTable columns={columns} data={data} searchable sortable exportable />
```

## Validation Schemas

Using Zod + React Hook Form:

```typescript
import { loginSchema } from '@/lib/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

## Design System

Colors are defined in `/app/globals.css` as CSS variables:

```css
--primary
--secondary
--success
--warning
--destructive
--info
--muted
```

Use Tailwind classes:
```jsx
<div className="bg-primary text-primary-foreground">
  Primary button color
</div>
```

## Adding New Pages

1. Create file in appropriate route group:
   ```
   /app/(user)/my-page/page.tsx
   ```

2. Use shared components:
   ```typescript
   'use client';
   import { Button, Card } from '@/components/shared';
   
   export default function MyPage() {
     return (
       <main>
         <Card>
           <Button>Click me</Button>
         </Card>
       </main>
     );
   }
   ```

## Adding New Components

1. Create in `/components/shared/my-component.tsx`
2. Export from `/components/shared/index.ts`
3. Use Tailwind CSS with semantic tokens
4. Add TypeScript types

## Mock Data

Replace mock data with API calls:

```typescript
// Current: mock data from /lib/mock-data/products.ts
import { MOCK_PRODUCTS } from '@/lib/mock-data/products';

// Future: real API call
const { data: products } = await apiClient.get('/products');
```

## Environment Variables

Currently using mock data. To connect to backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
DATABASE_URL=your-database-url
AUTH_SECRET=your-auth-secret
```

## Building for Production

```bash
# Build
pnpm build

# Test production build
pnpm start

# Export static
pnpm export
```

## Performance Tips

- Use Next.js Image component for images
- Lazy load components: `dynamic(() => import('./Component'))`
- Memoize expensive components: `React.memo(Component)`
- Use Zustand for state (minimal re-renders)
- Check Core Web Vitals: `pnpm analyze`

## Troubleshooting

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
pnpm dev -- -p 3001
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### TypeScript Errors
```bash
# Check types
pnpm tsc --noEmit

# Watch mode
pnpm tsc --watch --noEmit
```

## Documentation

- `MARKETPLACE.md` - Complete architecture guide
- `IMPLEMENTATION_SUMMARY.md` - What was built
- This file - Quick start guide

## Deployment

### Vercel (Recommended)
```bash
# Push to GitHub
git push origin main

# Connect to Vercel
# Deploy automatically on push
```

### Docker
```bash
# Build image
docker build -t marketplace .

# Run container
docker run -p 3000:3000 marketplace
```

## Support

For detailed component documentation, check `/components/shared/` files.

For API patterns, see `/lib/api/client.ts`.

For state management, see `/lib/store/index.ts`.

## Next Steps

1. Connect to real backend
2. Implement real authentication
3. Add payment processing
4. Set up database
5. Add image storage
6. Configure email notifications
7. Deploy to production

---

Happy building! 🚀
