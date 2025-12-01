# 🛠️ TinyTools - Micro-Services Platform

A modern, full-stack SaaS platform offering 28+ free productivity tools for developers and professionals. Built with React, Node.js, Express, and MongoDB with Stripe integration for premium subscriptions.

## ✨ Features

### Core Tools (28+)
- **Developer Tools**: JSON formatter, CSV/JSON converter, UUID generator, Regex tester, SQL formatter, JWT decoder, Hash generator
- **File & PDF Tools**: PDF merge/split/compress, Image compression, QR code generator
- **Text & Productivity**: Word counter, Case converter, Duplicate remover, Text diff checker
- **Business & Utility**: Invoice generator, Password generator, Color picker, Unit converter

### Platform Features
- ⚡ Client-side processing (privacy-first)
- 🎨 Modern, responsive UI with smooth animations
- 🔐 JWT-based authentication
- 💳 Stripe payment integration
- 📊 Usage analytics dashboard
- 🚀 SEO-optimized tool pages
- 📱 Mobile-friendly design

## 🏗️ Architecture

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navigation.jsx
│   │   ├── Hero.jsx
│   │   ├── ToolsGrid.jsx
│   │   ├── ToolModal.jsx
│   │   └── Footer.jsx
│   ├── pages/            # Route pages
│   │   ├── PricingPage.jsx
│   │   └── Dashboard.jsx
│   ├── context/          # React Context
│   │   └── AuthContext.jsx
│   ├── data/             # Static data
│   │   └── tools.js
│   ├── utils/            # Utility functions
│   │   └── toolProcessors.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Backend (Node.js + Express + MongoDB)
```
backend/
├── config/               # Configuration files
│   └── database.js
├── middleware/           # Express middleware
│   ├── auth.js
│   └── errorHandler.js
├── models/               # Mongoose models
│   └── User.js
├── routes/               # API routes
│   ├── auth.js
│   ├── subscription.js
│   └── analytics.js
├── server.js             # Main server file
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tinytools-platform
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure Environment Variables**

Backend (.env):
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

Key variables to set:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Generate a secure random string
- `STRIPE_SECRET_KEY`: From your Stripe dashboard
- `STRIPE_PRICE_ID`: Create a product in Stripe and use its price ID
- `STRIPE_WEBHOOK_SECRET`: For webhook verification

Frontend (.env):
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Development

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Start Backend Server**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

3. **Start Frontend Dev Server**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique, required),
  password: String (hashed, required),
  isPremium: Boolean (default: false),
  subscriptionId: String,
  customerId: String (Stripe),
  subscriptionStatus: String,
  subscriptionEndDate: Date,
  toolsUsed: [{
    toolId: String,
    count: Number,
    lastUsed: Date
  }],
  totalToolUsage: Number,
  createdAt: Date,
  lastLogin: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Subscription
- `POST /api/subscription/create` - Create subscription (protected)
- `POST /api/subscription/cancel` - Cancel subscription (protected)
- `GET /api/subscription/status` - Get subscription status (protected)
- `POST /api/subscription/webhook` - Stripe webhook handler

### Analytics
- `POST /api/analytics/track` - Track tool usage (protected)
- `GET /api/analytics/stats` - Get user stats (protected)
- `GET /api/analytics/admin/overview` - Platform stats (protected)

## 💳 Stripe Integration Setup

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Create an account and get API keys

2. **Create Product & Price**
   ```bash
   # In Stripe Dashboard:
   1. Products → Create Product
   2. Name: "TinyTools Premium"
   3. Price: $4.99/month (recurring)
   4. Copy the Price ID (starts with price_)
   ```

3. **Setup Webhook**
   ```bash
   # In Stripe Dashboard:
   1. Developers → Webhooks → Add Endpoint
   2. URL: https://yourdomain.com/api/subscription/webhook
   3. Events: 
      - customer.subscription.updated
      - customer.subscription.deleted
      - invoice.payment_failed
   4. Copy the Webhook Secret
   ```

4. **Test Payments**
   - Use test card: 4242 4242 4242 4242
   - Any future expiry date
   - Any CVC

## 🌐 Deployment

### Backend (Heroku/Railway/Render)

**Heroku:**
```bash
# Install Heroku CLI
heroku create tinytools-api
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=your_key
git subtree push --prefix backend heroku main
```

**Railway:**
```bash
# Install Railway CLI
railway init
railway add
railway up
```

### Frontend (Vercel/Netlify)

**Vercel:**
```bash
cd frontend
vercel
# Follow prompts
# Set environment variable: VITE_API_URL=https://your-api-url
```

**Netlify:**
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Database (MongoDB Atlas)

1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Get connection string
4. Update `MONGODB_URI` in backend .env

## 📈 Monetization Strategy

### Free Tier
- Access to all basic tools
- Ad-supported
- Community support
- Rate limits apply

### Premium Tier ($4.99/month)
- No ads
- Batch processing
- Advanced PDF tools
- Priority support
- Invoice/receipt templates
- Unlimited usage
- Early access to new tools

### Projected Revenue (Conservative)
- 1,000 monthly users
- 5% conversion rate = 50 premium users
- Revenue: 50 × $4.99 = **$249.50/month**

- 10,000 monthly users
- 5% conversion rate = 500 premium users
- Revenue: 500 × $4.99 = **$2,495/month**

## 🎯 Growth Strategy

### SEO
- Each tool has dedicated page with meta tags
- Long-tail keywords: "free json formatter", "pdf merge tool"
- Tool-specific content and examples

### Marketing
- Product Hunt launch
- Dev.to / Hacker News posts
- Reddit communities (r/webdev, r/programming)
- Social media sharing
- Blog with tool tutorials

### Expansion
- Add 5-10 new tools monthly
- API access for developers
- Browser extensions
- Mobile apps
- White-label solutions for businesses

## 🔒 Security Features

- Bcrypt password hashing
- JWT token authentication
- Rate limiting on auth routes
- Helmet.js security headers
- CORS configuration
- Input validation
- MongoDB injection prevention
- XSS protection

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 License

MIT License - feel free to use this for your own projects!

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For support, email support@tinytools.com or create an issue on GitHub.

## 🎉 Acknowledgments

- React team for the amazing framework
- Stripe for payment processing
- MongoDB for database solution
- All open-source contributors

---

Built with ❤️ by the TinyTools Team
