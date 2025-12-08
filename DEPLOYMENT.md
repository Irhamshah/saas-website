# 🚀 LiteTools Deployment Guide

Complete step-by-step guide to deploy your LiteTools platform to production.

## Table of Contents
1. [Database Setup (MongoDB Atlas)](#database-setup)
2. [Backend Deployment (Railway/Render)](#backend-deployment)
3. [Frontend Deployment (Vercel)](#frontend-deployment)
4. [Stripe Configuration](#stripe-configuration)
5. [DNS & Domain Setup](#dns-setup)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 1. Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free tier (512MB storage)
3. Create new cluster

### Step 2: Configure Database
```bash
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string:
   mongodb+srv://username:<password>@cluster.mongodb.net/LiteTools
4. Replace <password> with your database user password
```

### Step 3: Whitelist IP Addresses
```bash
# For development: Add your IP
# For production: Add 0.0.0.0/0 (or your server IPs)
```

### Step 4: Create Database User
- Username: `LiteTools-admin`
- Password: Generate secure password
- Permissions: Read and write to any database

---

## 2. Backend Deployment

### Option A: Railway (Recommended)

**Why Railway?**
- Free tier with $5/month credit
- Automatic HTTPS
- Easy environment variables
- GitHub integration

**Steps:**

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize Project**
```bash
cd backend
railway init
```

3. **Configure Environment Variables**
```bash
railway variables set MONGODB_URI="your-atlas-connection-string"
railway variables set JWT_SECRET="your-secure-secret"
railway variables set STRIPE_SECRET_KEY="sk_live_your_key"
railway variables set STRIPE_PRICE_ID="price_your_price_id"
railway variables set STRIPE_WEBHOOK_SECRET="whsec_your_webhook"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://yourdomain.com"
```

4. **Deploy**
```bash
railway up
```

5. **Get Your API URL**
```bash
railway domain
# Will output something like: https://LiteTools-api.up.railway.app
```

### Option B: Render.com

1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

5. Add Environment Variables (same as Railway)

6. Deploy - you'll get URL like: `https://LiteTools-api.onrender.com`

### Option C: Heroku

```bash
# Install Heroku CLI
heroku login
cd backend

# Create app
heroku create LiteTools-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
heroku config:set STRIPE_PRICE_ID=price_your_id
heroku config:set NODE_ENV=production

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a LiteTools-api
git push heroku main
```

---

## 3. Frontend Deployment

### Option A: Vercel (Recommended)

**Why Vercel?**
- Free tier
- Automatic SSL
- Global CDN
- GitHub integration
- Perfect for React/Vite apps

**Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure Environment**
```bash
cd frontend
# Create .env.production
echo "VITE_API_URL=https://your-backend-url.railway.app/api" > .env.production
```

3. **Deploy**
```bash
vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: LiteTools
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

4. **Set Environment Variables in Dashboard**
```bash
# Go to Vercel dashboard
# Settings → Environment Variables
# Add: VITE_API_URL = https://your-backend-url/api
```

5. **Production Deploy**
```bash
vercel --prod
```

You'll get: `https://LiteTools.vercel.app`

### Option B: Netlify

1. **Build Locally**
```bash
cd frontend
npm run build
```

2. **Deploy**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Or use Netlify Drop (drag & drop dist folder)
```

3. **Configure Redirects**
Create `frontend/public/_redirects`:
```
/* /index.html 200
```

### Option C: Manual GitHub Pages

```bash
cd frontend
npm run build

# Push dist folder to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

---

## 4. Stripe Configuration

### Production Setup

1. **Switch to Live Mode**
   - Go to Stripe Dashboard
   - Toggle from "Test mode" to "Live mode"

2. **Get Live API Keys**
   ```bash
   # In Stripe Dashboard → Developers → API Keys
   # Copy:
   - Publishable key (pk_live_...)
   - Secret key (sk_live_...)
   ```

3. **Create Live Product**
   ```bash
   # Products → Create Product
   Name: LiteTools Premium
   Price: $4.99/month
   Billing: Recurring monthly
   
   # Copy Price ID (price_...)
   ```

4. **Setup Production Webhook**
   ```bash
   # Developers → Webhooks → Add Endpoint
   URL: https://your-backend-url.railway.app/api/subscription/webhook
   
   Events to listen to:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
   
   # Copy Webhook Secret (whsec_...)
   ```

5. **Update Environment Variables**
   ```bash
   # Update backend environment:
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_PRICE_ID=price_your_price_id
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### Testing Live Payments

```bash
# Test card numbers (use in live mode testing):
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184

# Any future expiry date
# Any 3-digit CVC
# Any billing postal code
```

---

## 5. DNS & Domain Setup

### Purchase Domain
- Namecheap: ~$10/year
- Google Domains: ~$12/year
- Cloudflare: ~$9/year

### Configure DNS (Example with Cloudflare)

1. **Add Domain to Cloudflare**
   - Add site
   - Follow nameserver instructions

2. **Configure DNS Records**
   ```bash
   # For Vercel frontend:
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy: Enabled
   
   # OR use A record:
   Type: A
   Name: @
   IPv4: 76.76.21.21
   
   # For www subdomain:
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   ```

3. **Update Vercel with Custom Domain**
   ```bash
   # In Vercel dashboard:
   Settings → Domains → Add Domain
   Enter: yourdomain.com
   ```

4. **Update Backend CORS**
   ```bash
   # In backend environment:
   FRONTEND_URL=https://yourdomain.com
   ```

---

## 6. Post-Deployment Checklist

### Security
- [ ] All API keys in environment variables (not in code)
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet.js security headers active
- [ ] JWT secret is strong and secure

### Functionality
- [ ] User registration works
- [ ] Login authentication works
- [ ] All tools function correctly
- [ ] Stripe test payment succeeds
- [ ] Stripe live payment succeeds
- [ ] Webhooks receiving events
- [ ] Email notifications (if configured)
- [ ] Analytics tracking

### Performance
- [ ] Frontend loads < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Images compressed
- [ ] CDN configured
- [ ] Caching headers set

### SEO
- [ ] Meta tags on all pages
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt
- [ ] Google Analytics
- [ ] Google Search Console

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Analytics (Google Analytics/Plausible)
- [ ] Database backups configured

---

## Common Issues & Solutions

### Issue: CORS errors
```javascript
// Backend: Check CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: Webhook not receiving events
```bash
# Check webhook URL is publicly accessible
# Verify webhook secret matches Stripe dashboard
# Check server logs for incoming requests
```

### Issue: Database connection timeout
```bash
# Check MongoDB Atlas IP whitelist
# Verify connection string is correct
# Ensure network allows outbound connections
```

### Issue: Environment variables not loading
```bash
# Verify .env files are in correct locations
# Check variable names match exactly
# Restart servers after changes
# For Vite: variables must start with VITE_
```

---

## Cost Breakdown (Monthly)

### Free Tier Setup:
- MongoDB Atlas: $0 (512MB)
- Railway Backend: $0 ($5 credit covers small apps)
- Vercel Frontend: $0
- Domain: ~$1 (annual / 12)
- **Total: ~$1/month**

### Paid Tier (Scaling):
- MongoDB Atlas: $0-57 (shared tier)
- Railway: $5-20
- Vercel: $0
- Domain: ~$1
- **Total: ~$6-78/month**

### Revenue Potential:
- 1,000 users @ 5% conversion = 50 premium
- 50 × $4.99 = **$249.50/month**
- **Net profit: ~$170-240/month**

---

## Next Steps After Deployment

1. **Marketing**
   - Post on Product Hunt
   - Share on Hacker News, Reddit
   - Write blog posts
   - Create social media accounts

2. **Analytics**
   - Set up Google Analytics
   - Monitor user behavior
   - Track conversion rates
   - A/B test pricing

3. **Improvements**
   - Add more tools based on user requests
   - Optimize performance
   - Improve SEO
   - Add blog/content marketing

4. **Growth**
   - Email marketing
   - Referral program
   - API for developers
   - Mobile apps

---

Need help? Create an issue or email support@LiteTools.com
