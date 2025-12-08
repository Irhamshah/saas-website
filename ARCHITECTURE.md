# 🏛️ LiteTools Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Frontend (Vite)                    │  │
│  │  - Client-side tool processing                        │  │
│  │  - React Router for navigation                        │  │
│  │  - Framer Motion animations                           │  │
│  │  - Axios for API calls                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           │ HTTPS/REST                       │
└───────────────────────────┼──────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                        │
│                  (Node.js + Express)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                     │  │
│  │  - CORS, Helmet (security)                            │  │
│  │  - Rate limiting                                      │  │
│  │  - JWT authentication                                 │  │
│  │  - Error handling                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Route Handlers                                       │  │
│  │  - /api/auth         (register, login, profile)       │  │
│  │  - /api/subscription (create, cancel, webhook)        │  │
│  │  - /api/analytics    (track, stats)                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                    │                      │
                    │                      │
        ┌───────────┴──────────┐          │
        │                      │          │
        ▼                      ▼          ▼
┌───────────────┐    ┌──────────────┐   ┌────────────┐
│   MongoDB     │    │    Stripe    │   │  Analytics │
│   Database    │    │   Payments   │   │   Service  │
│               │    │              │   │            │
│ - Users       │    │ - Customers  │   │ - Events   │
│ - Sessions    │    │ - Subs       │   │ - Metrics  │
│ - Analytics   │    │ - Invoices   │   │            │
└───────────────┘    └──────────────┘   └────────────┘
```

---

## Component Architecture

### Frontend Components

```
App
├── Navigation
│   ├── Logo
│   ├── NavLinks
│   └── UserMenu / Premium Button
│
├── Routes
│   ├── HomePage
│   │   ├── Hero
│   │   │   ├── Title
│   │   │   ├── SearchBar
│   │   │   └── StatsRow
│   │   │
│   │   └── ToolsGrid
│   │       └── ToolCard (x28+)
│   │
│   ├── PricingPage
│   │   ├── PricingHeader
│   │   ├── PricingCards
│   │   │   ├── Free Plan
│   │   │   └── Premium Plan
│   │   └── FAQ Section
│   │
│   └── Dashboard
│       ├── DashboardHeader
│       ├── StatsGrid
│       ├── AccountInfo
│       └── UpgradeSection
│
├── ToolModal
│   ├── ModalHeader
│   ├── ToolInterface
│   │   ├── InputSection
│   │   ├── ProcessButton
│   │   └── OutputSection
│   └── PremiumNotice (conditional)
│
└── Footer
    ├── FooterLinks
    └── Copyright
```

### Backend Structure

```
Server
├── Middleware
│   ├── helmet (security headers)
│   ├── cors (cross-origin)
│   ├── morgan (logging)
│   ├── auth (JWT verification)
│   └── errorHandler
│
├── Routes
│   ├── /api/auth
│   │   ├── POST /register
│   │   ├── POST /login
│   │   ├── GET /me
│   │   └── PUT /profile
│   │
│   ├── /api/subscription
│   │   ├── POST /create
│   │   ├── POST /cancel
│   │   ├── GET /status
│   │   └── POST /webhook
│   │
│   └── /api/analytics
│       ├── POST /track
│       ├── GET /stats
│       └── GET /admin/overview
│
└── Models
    └── User
        ├── Authentication fields
        ├── Subscription data
        └── Usage analytics
```

---

## Data Flow Diagrams

### User Registration Flow

```
User (Browser)
    │
    │ 1. Fill registration form
    │    (email, password, name)
    ▼
Frontend (React)
    │
    │ 2. Validate input
    │    POST /api/auth/register
    ▼
Backend API
    │
    │ 3. Check if user exists
    │ 4. Hash password (bcrypt)
    │ 5. Create user in DB
    ▼
MongoDB
    │
    │ 6. User document created
    ▼
Backend API
    │
    │ 7. Generate JWT token
    │ 8. Return user + token
    ▼
Frontend
    │
    │ 9. Store token in localStorage
    │ 10. Update AuthContext
    │ 11. Redirect to dashboard
    ▼
User sees Dashboard
```

### Tool Usage Flow (Client-Side)

```
User clicks tool card
    ▼
ToolModal opens
    ▼
User enters input
    ▼
Clicks "Process" button
    ▼
toolProcessors[toolId](input)
    │
    │ All processing happens
    │ in browser (client-side)
    │ - No server requests
    │ - Data never leaves device
    │ - Privacy-first
    ▼
Display output
    ▼
Optional: Track usage
    │ POST /api/analytics/track
    └─> Update user.toolsUsed in DB
```

### Subscription Creation Flow

```
User clicks "Upgrade to Premium"
    ▼
PricingPage / Checkout
    ▼
Enter payment details (Stripe)
    ▼
Frontend
    │ POST /api/subscription/create
    │ { paymentMethodId }
    ▼
Backend API
    │
    │ 1. Get/Create Stripe Customer
    ├─────────────────────────────> Stripe API
    │                               (Create customer)
    │ 2. Create Subscription        
    ├─────────────────────────────> Stripe API
    │                               (Create subscription)
    │ 3. Get subscription details
    │<─────────────────────────────┘
    │
    │ 4. Update user in DB:
    │    - isPremium = true
    │    - subscriptionId
    │    - subscriptionStatus
    ▼
MongoDB
    │
    │ User updated
    ▼
Backend returns success
    ▼
Frontend
    │ Update AuthContext
    │ Show success message
    │ Redirect to Dashboard
    ▼
User has Premium access
```

### Stripe Webhook Flow

```
Stripe Event occurs
(payment success/failure, cancellation)
    │
    │ Webhook POST to:
    │ /api/subscription/webhook
    ▼
Backend API
    │
    │ 1. Verify webhook signature
    │    (prevent fake requests)
    │
    │ 2. Parse event type:
    │    - subscription.updated
    │    - subscription.deleted
    │    - payment.failed
    ▼
Update User in MongoDB
    │
    │ Examples:
    │ - Payment failed → status: 'past_due'
    │ - Subscription canceled → isPremium: false
    │ - Payment succeeded → status: 'active'
    ▼
User's premium status updated
    │
    │ Next time user loads app:
    ▼
Frontend fetches updated user data
    ▼
UI reflects current subscription status
```

---

## Security Architecture

### Authentication Flow

```
1. User Registration/Login
   ├─> Password hashed with bcrypt (10 rounds)
   ├─> JWT token generated (expires 30 days)
   └─> Token sent to client

2. Protected API Requests
   Request Headers: { Authorization: "Bearer <token>" }
   ├─> Token extracted from header
   ├─> Token verified with JWT secret
   ├─> User ID decoded from token
   ├─> User fetched from database
   └─> Request proceeds with req.user

3. Token Storage
   ├─> localStorage (frontend)
   └─> Sent with every API request
```

### Security Layers

```
┌────────────────────────────────────────┐
│  1. Helmet.js                          │
│     - X-Frame-Options                  │
│     - X-Content-Type-Options           │
│     - Strict-Transport-Security        │
└────────────────────────────────────────┘
           │
┌────────────────────────────────────────┐
│  2. CORS                               │
│     - Whitelist frontend domain        │
│     - Credentials: true                │
└────────────────────────────────────────┘
           │
┌────────────────────────────────────────┐
│  3. Rate Limiting                      │
│     - 5 login attempts / 15 min        │
│     - Prevent brute force              │
└────────────────────────────────────────┘
           │
┌────────────────────────────────────────┐
│  4. Input Validation                   │
│     - express-validator                │
│     - Sanitize inputs                  │
└────────────────────────────────────────┘
           │
┌────────────────────────────────────────┐
│  5. JWT Authentication                 │
│     - Token verification               │
│     - User authorization               │
└────────────────────────────────────────┘
```

---

## Database Schema Design

### User Collection

```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",        // Unique, indexed
  password: "$2a$10$...",             // Bcrypt hashed
  name: "John Doe",
  isPremium: false,
  
  // Stripe Integration
  customerId: "cus_...",              // Stripe customer ID
  subscriptionId: "sub_...",          // Stripe subscription ID
  subscriptionStatus: "active",       // active, canceled, past_due
  subscriptionEndDate: ISODate("..."),
  
  // Analytics
  toolsUsed: [
    {
      toolId: "json-formatter",
      count: 42,
      lastUsed: ISODate("...")
    },
    {
      toolId: "uuid",
      count: 15,
      lastUsed: ISODate("...")
    }
  ],
  totalToolUsage: 57,
  
  // Timestamps
  createdAt: ISODate("..."),
  lastLogin: ISODate("..."),
  updatedAt: ISODate("...")
}
```

### Indexes

```javascript
// Optimize query performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ customerId: 1 })
db.users.createIndex({ subscriptionId: 1 })
db.users.createIndex({ isPremium: 1 })
db.users.createIndex({ lastLogin: -1 })
```

---

## Scalability Considerations

### Current Architecture (Phase 1)
- **Users**: 0 - 10,000
- **Tools**: 28
- **Infrastructure**: Free tier (Vercel + Railway + Atlas)
- **Cost**: ~$1/month

### Growth Phase (Phase 2)
- **Users**: 10,000 - 100,000
- **Tools**: 50+
- **Infrastructure**: Paid tiers, CDN
- **Optimizations**:
  - Redis caching for frequent queries
  - Database read replicas
  - Load balancer for API
- **Cost**: ~$50-100/month

### Scale Phase (Phase 3)
- **Users**: 100,000+
- **Tools**: 100+
- **Infrastructure**: Multi-region deployment
- **Optimizations**:
  - Microservices architecture
  - Separate tool processing service
  - Queue system for heavy operations
  - Advanced caching strategies
- **Cost**: ~$500-1000/month

---

## Technology Stack Justification

### Why React?
- ✅ Component reusability (28+ tools = lots of components)
- ✅ Virtual DOM for performance
- ✅ Huge ecosystem (Framer Motion, React Router)
- ✅ SEO possible with SSR/SSG

### Why Vite?
- ✅ Lightning fast dev server
- ✅ Optimized production builds
- ✅ Modern ES modules
- ✅ Better than Create React App

### Why Node.js + Express?
- ✅ Same language as frontend (JavaScript)
- ✅ Non-blocking I/O (handle many requests)
- ✅ Large package ecosystem
- ✅ Easy to scale

### Why MongoDB?
- ✅ Flexible schema (user analytics vary)
- ✅ JSON-like documents (natural for JS)
- ✅ Free tier available (Atlas)
- ✅ Easy to scale horizontally

### Why Stripe?
- ✅ Industry standard for payments
- ✅ Handles compliance (PCI DSS)
- ✅ Excellent API and documentation
- ✅ Supports subscriptions natively

---

## Performance Optimization

### Frontend
```
1. Code Splitting
   - Lazy load tool components
   - Reduce initial bundle size

2. Asset Optimization
   - Compress images
   - Use WebP format
   - CDN for static assets

3. Caching
   - Service Worker
   - LocalStorage for tool results
   - Cache API responses

4. Bundle Analysis
   - npm run build -- --analyze
   - Remove unused dependencies
```

### Backend
```
1. Database
   - Indexes on frequently queried fields
   - Connection pooling
   - Query optimization

2. Caching
   - Redis for session storage
   - Cache user data
   - Cache tool metadata

3. API
   - Response compression (gzip)
   - Pagination for large datasets
   - Rate limiting per user tier
```

---

Need more technical details? Check the code comments or create an issue!
