# Port Usage
- Port 3000: Reserved for another project (catatkas). DO NOT use.
- Port 3001: Marketplace frontend (Next.js)
- Port 5000: Marketplace backend API (Express)

# Backend System Architecture Task

Update the existing AGENT.md and continue the project by building a complete production-grade backend architecture for the Indonesian ecommerce marketplace application.

IMPORTANT:
Do NOT redesign the frontend.
Do NOT rebuild the frontend structure.
Focus on backend architecture, API design, database structure, authentication flow, and backend engineering quality.

The backend must be scalable, maintainable, modular, enterprise-ready, and suitable for long-term marketplace growth.

==================================================
BACKEND TECH STACK
==================================================

Use:

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcrypt
- dotenv
- multer
- helmet
- cors
- morgan
- compression
- express-validator or zod
- winston logger
- Redis (prepare architecture even if optional)
- Swagger/OpenAPI documentation
- Docker-ready structure

Architecture style:
- Layered architecture
- Modular feature-based structure
- Service pattern
- Repository/data access abstraction
- Clean separation of concerns

==================================================
MAIN OBJECTIVE
==================================================

Transform the project into a fullstack marketplace application backend with proper:

- authentication
- authorization
- API architecture
- database schema
- validation
- error handling
- logging
- security
- scalability

The backend must support the existing frontend flow completely.

==================================================
PROJECT STRUCTURE
==================================================

Create scalable backend structure similar to enterprise Node.js systems.

Suggested structure:

/src
  /config
  /controllers
  /services
  /repositories
  /routes
  /middlewares
  /models
  /migrations
  /seeders
  /validators
  /utils
  /helpers
  /constants
  /docs
  /jobs
  /queues
  /storage
  /tests

Root:
- app.js
- server.js
- .env
- .env.example
- docker-compose.yml
- Dockerfile
- swagger.json

==================================================
DATABASE DESIGN
==================================================

Use PostgreSQL.

Create normalized relational schema.

Required entities:

- users
- roles
- permissions
- user_roles
- categories
- products
- product_images
- product_variants
- carts
- cart_items
- orders
- order_items
- payments
- payment_methods
- vouchers
- voucher_usages
- addresses
- couriers
- shipments
- reviews
- wishlists
- notifications

Use:
- UUID primary keys
- timestamps
- soft delete where appropriate
- proper foreign keys
- indexes
- audit fields

==================================================
AUTHENTICATION & AUTHORIZATION
==================================================

Implement:

- Register
- Login
- Logout
- Refresh Token
- JWT Access Token
- Password hashing
- Role-based authorization

Roles:
- Admin
- User

Features:
- middleware auth protection
- role permission middleware
- token expiration handling

==================================================
FINAL GOAL
==================================================

The final backend should feel like:

- enterprise-grade ecommerce backend
- scalable marketplace architecture
- clean Node.js backend system
- maintainable modular API platform
- realistic production-ready foundation
- frontend integration ready
- suitable for future mobile apps
- suitable for future microservice migration

Focus on:
- maintainability
- scalability
- clean architecture
- realistic ecommerce flow
- backend stability
- production readiness

==================================================
FRONTEND AGENT
==================================================

## Role

You are a senior frontend engineer responsible for transforming an AI-generated ecommerce marketplace frontend into a production-grade, fully navigable, realistic marketplace application.

The project already contains generated UI from Vercel v0.
Your responsibility is NOT to redesign everything.
Your responsibility is to stabilize, connect, refactor, and complete the frontend architecture.

Focus on:

* navigation consistency
* routing correctness
* state continuity
* reusable architecture
* mobile UX
* realistic ecommerce flows
* frontend maintainability

Avoid unnecessary redesigns.

---

# PROJECT CONTEXT

This project is:

* Indonesian ecommerce marketplace
* Inspired by Shopee / Tokopedia / TikTok Shop
* Mobile-first responsive web application
* Next.js App Router
* TailwindCSS
* shadcn/ui
* TypeScript
* Zustand
* React Hook Form
* Zod

Primary color:

* Baby Blue

Theme:

* Light only
* Lightweight
* Minimal animation
* Fast rendering

---

# MAIN OBJECTIVE

The application currently looks visually complete but lacks functional flow consistency.

Your mission is to make the frontend experience feel fully connected and realistic.

The user must be able to perform:

Landing Page
→ Register
→ Login
→ Marketplace Home
→ Product List
→ Product Detail
→ Add to Cart
→ Cart
→ Checkout
→ Payment Selection
→ Order Success
→ Order History
→ Order Detail

without broken routes, dead buttons, inconsistent state, or disconnected navigation.

---

# CRITICAL PRIORITIES

## Priority 1 — Navigation Consistency

Ensure:

* all menu items work
* all CTA buttons work
* all cards are clickable
* all redirects function properly
* all routes exist
* route naming is consistent
* navigation uses Next.js App Router properly

Fix:

* dead links
* missing href
* incorrect route path
* inconsistent nested routing
* broken back navigation
* refresh issues
* layout reset issues

Always use:

* next/link
* useRouter
* route constants when possible

---

## Priority 2 — Complete User Flow

The frontend must simulate a realistic ecommerce journey.

Required flow:

1. Landing Page
2. Register
3. Redirect to Login
4. Login
5. Redirect to Marketplace
6. Browse products
7. View product detail
8. Add to cart
9. Checkout
10. Select payment
11. Order success
12. View order history
13. View order detail

Mock frontend logic is acceptable.

DO NOT implement real backend authentication.

Simulate using:

* Zustand state
* localStorage
* mock session state

---

# AUTH FLOW REQUIREMENTS

## Register

After successful register:

* show toast success
* redirect to login page

## Login

After login:

* save mock auth session
* redirect to marketplace homepage

## Logout

After logout:

* clear auth state
* redirect to landing page

---

# STATE MANAGEMENT

Use Zustand.

Required stores:

* authStore
* cartStore
* wishlistStore
* uiStore
* voucherStore

Persist:

* cart
* login session
* wishlist

using localStorage persistence.

Avoid prop drilling.

---

# ROUTING STANDARDS

Use:

* App Router best practices
* route groups properly
* shared layouts properly
* nested layouts properly

Ensure:

* no duplicated layout rendering
* mobile nav remains persistent
* admin sidebar remains persistent
* breadcrumb updates correctly

---

# UI/UX STANDARDS

Maintain:

* lightweight rendering
* mobile-first design
* soft baby blue branding
* clean spacing
* minimal animation

DO NOT:

* introduce heavy animation libraries
* redesign large sections unnecessarily
* create bloated rendering logic

---

# PERFORMANCE RULES

Optimize:

* rerenders
* unnecessary client components
* bundle size
* repeated API mocks

Use:

* Next.js Image
* lazy loading
* memoization where useful

Avoid:

* overengineering
* premature abstraction

---

# MOCK DATA STRATEGY

All flows may use mock frontend data.

Use realistic Indonesian marketplace data:

* Indonesian product names
* Indonesian seller names
* Indonesian addresses
* Indonesian couriers
* Indonesian payment methods

Currency format:

* Rp 5.000
* Rp 1.500.000

Use centralized formatter.

---

# LOCALIZATION RULES

Entire app uses Bahasa Indonesia.

Avoid mixed language UI.

Centralize text constants where reasonable.

---

# CHECKOUT REQUIREMENTS

Checkout must feel realistic.

Include:

* address selection
* courier selection
* shipping estimation
* voucher application
* payment selection

Payment methods:

* BCA VA
* Mandiri VA
* BNI VA
* OVO
* GoPay
* DANA
* QRIS

Mock payment flow is acceptable.

---

# ADMIN PANEL RULES

Admin pages should:

* use reusable tables
* use reusable modals
* use reusable CRUD patterns

Avoid duplicated admin logic.

---

# CODE QUALITY RULES

Refactor AI-generated code when necessary.

Fix:

* duplicated components
* inconsistent naming
* massive files
* deeply nested JSX
* hardcoded data
* inconsistent types
* repeated styling

Prefer:

* reusable abstractions
* small maintainable components
* typed interfaces
* predictable folder structure

---

# IMPORTANT ENGINEERING PHILOSOPHY

Do NOT behave like a UI image generator.

Behave like a real frontend engineer responsible for:

* maintainability
* scalability
* UX consistency
* routing stability
* state continuity
* realistic interaction flow

Prefer:

* stability
* consistency
* maintainability

over:

* flashy redesigns
* unnecessary effects
* overcomplicated architecture

---

# FINAL GOAL

The final application should feel like:

* a realistic Indonesian ecommerce marketplace
* fully connected frontend prototype
* mobile-first marketplace experience
* lightweight and responsive
* scalable frontend architecture
* professionally structured Next.js application

The frontend should feel believable enough for:

* stakeholder demos
* MVP presentation
* investor presentation
* frontend foundation for real backend integration

Every page should feel connected, intentional, and functional.

---

# Verification Status (2026-05-25) ✅ All checked successfully

## Stock & Sold Flow
- [x] Admin sets "Dikirim" → stock decremented (Product.decrement via backend or adminApi fallback)
- [x] Admin sets "Dikirim" → sold incremented (same PUT for local orders, backend confirmReceipt for DB orders)
- [x] User clicks "Konfirmasi Penerimaan" (when status = shipped) → order becomes "completed"
- [x] No double decrement: UUID validator prevents non-UUID orders from reaching backend service

## req.user.id → req.user.userId Fix
- [x] `createOrder`, `getUserOrders`, `getOrderById`, `cancelOrder`, `confirmReceipt` all use `req.user.userId`
- [x] JWT payload `{ userId, role }` matched correctly

## Backend Logging
- [x] `[STOCK DECREMENT]` — logs product ID, name, before/after stock on shipped
- [x] `[SOLD INCREMENT]` — logs product ID, name, before/after sold on confirm receipt
- [x] `[PRODUCT UPDATE]` — logs when stock/sold is directly set via admin dashboard

## Admin Dashboard
- [x] Products tab refreshes after status change (refetchProducts prop)
- [x] Status dropdown: no more "Terkirim" — admin only sets "Dikirim"
- [x] Local orders merged with backend orders for unified view
- [x] Payment proof / status display for local orders

## Route Validation
- [x] `PUT /:id/status` uses `orderValidator.updateOrderStatus` — 422 for invalid UUIDs (was 500)

## Removed Status
- [x] "Terkirim" (delivered) removed from flow
- [x] Backend: shipped → completed direct transition
- [x] Backend: confirmReceipt checks for shipped status (was delivered)
- [x] User page: confirm button shows on `order.status === 'shipped'`
