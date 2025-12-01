# 🚀 Quick Start Guide - TinyTools Platform

Get your platform running in 10 minutes!

## Prerequisites Checklist
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB installed or Atlas account
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

---

## 🏃 Fast Setup (Development)

### Step 1: Database Setup (2 minutes)

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Download from mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Save for Step 3

### Step 2: Install Dependencies (3 minutes)

```bash
# Navigate to project
cd tinytools-platform

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Configure Environment (2 minutes)

**Backend Configuration:**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
```env
# Minimum required for development:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tinytools  # Or your Atlas URI
JWT_SECRET=dev-secret-change-in-production-123456
FRONTEND_URL=http://localhost:3000

# Stripe (optional for payment testing):
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PRICE_ID=price_your_price_id_here
```

**Frontend Configuration:**
```bash
cd ../frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 4: Start Development Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# You should see:
# 🚀 Server running on port 5000
# ✅ MongoDB Connected
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# You should see:
# ➜  Local:   http://localhost:3000/
```

### Step 5: Access the App (1 minute)

Open browser: http://localhost:3000

**Test the platform:**
1. Click any tool card
2. Try JSON Formatter, UUID Generator, Word Counter
3. Create account (optional)
4. All tools work immediately!

---

## 🎯 What You Can Do Right Now

### Without Backend Running:
✅ View homepage
✅ Search tools
✅ Use all client-side tools:
   - JSON Formatter
   - UUID Generator
   - Word Counter
   - Case Converter
   - Password Generator
   - And 20+ more!

### With Backend Running:
✅ Everything above, plus:
✅ User registration
✅ User login
✅ Dashboard
✅ Usage tracking

### With Stripe Configured:
✅ Everything above, plus:
✅ Premium subscriptions
✅ Payment processing
✅ Premium features

---

## 🧪 Test the Platform

### Test User Registration
```bash
# POST http://localhost:5000/api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Test Tool Functionality
1. Open http://localhost:3000
2. Click "JSON Formatter"
3. Paste this JSON:
```json
{"name":"TinyTools","tools":28,"awesome":true}
```
4. Click "Process" → See formatted output!

### Test Premium Features
1. Set `isPremium: true` in MongoDB for your user
2. Access premium tools (PDF tools, Invoice generator)

---

## 📁 Project Structure

```
tinytools-platform/
├── frontend/                 # React app
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Route pages
│   │   ├── context/         # React context
│   │   ├── data/            # Tool configurations
│   │   ├── utils/           # Tool processors
│   │   └── App.jsx          # Main app
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Node.js API
│   ├── config/              # Database config
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   ├── server.js            # Main server
│   └── package.json
│
├── README.md                 # Main documentation
├── DEPLOYMENT.md             # Deployment guide
└── ARCHITECTURE.md           # Technical details
```

---

## 🔧 Common Development Tasks

### Add a New Tool
1. Add tool to `frontend/src/data/tools.js`
2. Add processor to `frontend/src/utils/toolProcessors.js`
3. Tool appears automatically in UI!

### Change Styling
- Main styles: `frontend/src/App.css`
- Component styles: `frontend/src/components/[Component].css`

### Add API Endpoint
1. Create route in `backend/routes/`
2. Import in `backend/server.js`
3. Use in frontend with axios

### Database Operations
```bash
# Connect to MongoDB
mongosh

# Use database
use tinytools

# View users
db.users.find().pretty()

# Make user premium
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { isPremium: true } }
)
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: MongoDB connection failed**
```bash
# Check MongoDB is running:
# macOS/Linux:
mongod --version

# If not running:
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**Error: Port 5000 already in use**
```bash
# Find and kill process:
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env:
PORT=5001
```

### Frontend won't start

**Error: Cannot connect to backend**
```bash
# Check VITE_API_URL in frontend/.env:
VITE_API_URL=http://localhost:5000/api

# Verify backend is running on port 5000
```

**Error: Module not found**
```bash
# Reinstall dependencies:
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Tool not working

**Check browser console** (F12):
- Look for errors
- Check API calls
- Verify processor exists

**Check tool processor:**
```javascript
// In frontend/src/utils/toolProcessors.js
export const toolProcessors = {
  'your-tool-id': (input) => {
    // Your logic here
    return output;
  }
};
```

---

## 📚 Next Steps

1. **Customize the Design**
   - Change colors in `App.css`
   - Update fonts
   - Add your branding

2. **Add More Tools**
   - Check tool ideas in README
   - Implement processors
   - Test functionality

3. **Setup Stripe (Optional)**
   - Get Stripe account
   - Add API keys to backend/.env
   - Test payments with test cards

4. **Deploy to Production**
   - Follow DEPLOYMENT.md
   - Use Railway + Vercel
   - Configure custom domain

5. **Marketing**
   - Share on Product Hunt
   - Post to Reddit, Hacker News
   - Write blog posts

---

## 💡 Tips

- **Restart servers** after changing .env files
- **Clear browser cache** if seeing old data
- **Check both terminal outputs** for errors
- **Use MongoDB Compass** for visual database access
- **Install React DevTools** for debugging

---

## 🆘 Need Help?

- 📖 Read README.md for full documentation
- 🏗️ Check ARCHITECTURE.md for technical details
- 🚀 See DEPLOYMENT.md for production setup
- 💬 Create issue on GitHub
- 📧 Email: support@tinytools.com

---

## ✅ Success Checklist

After following this guide, you should have:
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can open http://localhost:3000
- [ ] Can use tools
- [ ] Can register/login
- [ ] Understand project structure

**Congratulations! You're ready to build! 🎉**

---

**Time to first working app: ~10 minutes**
**Time to add new tool: ~5 minutes**
**Time to deploy: ~30 minutes**

Happy coding! 🚀
