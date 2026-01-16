# 🚀 CentsWise Deployment Guide

## Overview
This guide will help you deploy CentsWise to free hosting platforms:
- **Backend**: Railway (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: PostgreSQL on Railway (included free)

---

## ✅ Prerequisites

1. **GitHub Account** - To push your code
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
4. **Git installed** on your local machine

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)
```bash
cd /home/munazil/PMITS/cursor/prd-to-pixel-perfect-main
git init
git add .
git commit -m "Initial commit - CentsWise ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `centswise`
3. **Do not** initialize with README (we already have code)

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/centswise.git
git branch -M main
git push -u origin main
```

---

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Create New Project on Railway
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `centswise` repository
5. Railway will detect it as a Python project

### 2.2 Configure Backend Service
1. Click on your service
2. Go to **"Settings"**
3. Change **Root Directory** to `/backend`
4. Click **"Save"**

### 2.3 Add PostgreSQL Database
1. Click **"+ New"** in your project
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create and link the database

### 2.4 Set Environment Variables
1. Go to your backend service
2. Click **"Variables"** tab
3. Add the following:

```env
SECRET_KEY=your-super-secret-key-change-this-123456789
JWT_SECRET_KEY=your-jwt-secret-key-change-this-987654321
```

**Note**: Railway automatically provides `DATABASE_URL` - don't add it manually!

### 2.5 Get Your Backend URL
1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy your Railway URL (e.g., `https://centswise-production.up.railway.app`)
4. **Save this URL** - you'll need it for frontend!

### 2.6 Initialize Database
After first deployment, run this once:
1. Go to your service
2. Click **"Deploy"** tab
3. Wait for deployment to complete
4. The database tables will be created automatically on first run

---

## ⚡ Step 3: Deploy Frontend to Vercel

### 3.1 Create `.env.production` File
Create this file in your project root:

```bash
# In /home/munazil/PMITS/cursor/prd-to-pixel-perfect-main/
echo "VITE_API_URL=https://your-railway-url.up.railway.app/api" > .env.production
```

Replace `your-railway-url.up.railway.app` with your actual Railway URL from Step 2.5

### 3.2 Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Vite configuration

### 3.3 Configure Build Settings
Vercel should auto-detect, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.4 Add Environment Variable
1. Go to **"Settings"** → **"Environment Variables"**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.up.railway.app/api`
3. Click **"Save"**
4. **Redeploy** to apply changes

### 3.5 Get Your Frontend URL
1. After deployment, Vercel will give you a URL (e.g., `centswise.vercel.app`)
2. Copy this URL

---

## 🔗 Step 4: Update CORS Settings

### 4.1 Update Backend CORS
1. Go back to **Railway**
2. Open your backend service
3. Go to **"Variables"**
4. Add new variable:
   - **Key**: `CORS_ORIGINS`
   - **Value**: `https://your-vercel-app.vercel.app`
5. **Redeploy** the backend

---

## ✅ Step 5: Test Your Deployment

### 5.1 Access Your App
1. Visit your Vercel URL (e.g., `https://centswise.vercel.app`)
2. You should see the login page

### 5.2 Login
- **Username**: `admin`
- **Password**: `Admin@123`

### 5.3 Test Features
1. ✅ Dashboard loads
2. ✅ Add a credit/donation
3. ✅ Generate and download receipt
4. ✅ Add an expense
5. ✅ View transactions

---

## 🔐 Step 6: Security (IMPORTANT!)

### 6.1 Change Admin Password
1. Login to your app
2. Go to **Settings**
3. Change password immediately!

### 6.2 Update Secret Keys
Generate strong random keys:
```bash
# On Linux/Mac
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"
```

Update these in Railway Variables:
- `SECRET_KEY`
- `JWT_SECRET_KEY`

---

## 📊 Monitoring & Logs

### Railway Logs
1. Go to Railway project
2. Click on backend service
3. View **"Deployments"** tab for logs

### Vercel Logs
1. Go to Vercel dashboard
2. Click your project
3. View **"Deployments"** → Click latest → **"Logs"**

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Database connection error
```
Solution:
1. Check if PostgreSQL is added to Railway project
2. Verify DATABASE_URL is automatically set
3. Check Railway logs for specific errors
```

**Problem**: 500 Internal Server Error
```
Solution:
1. Check Railway logs
2. Verify all environment variables are set
3. Ensure fonts are properly installed (handled by Railway)
```

### Frontend Issues

**Problem**: API calls failing
```
Solution:
1. Check VITE_API_URL in Vercel environment variables
2. Ensure Railway backend is running
3. Check browser console for CORS errors
```

**Problem**: 404 on refresh
```
Solution:
- Vercel should handle this automatically with vercel.json
- If not, check that vercel.json rewrites are configured
```

### CORS Errors

**Problem**: CORS policy blocking requests
```
Solution:
1. Update CORS_ORIGINS in Railway with exact Vercel URL
2. Include https:// in the URL
3. No trailing slash
4. Redeploy backend after changing
```

---

## 💰 Free Tier Limits

### Railway
- ✅ 500 hours/month execution time
- ✅ 512 MB RAM
- ✅ 1 GB Disk
- ✅ PostgreSQL database included
- **Perfect for small-medium apps**

### Vercel
- ✅ 100 GB bandwidth/month
- ✅ Unlimited websites
- ✅ Automatic SSL
- ✅ Global CDN
- **Perfect for frontends**

---

## 🔄 Updating Your App

### Backend Updates
```bash
git add backend/
git commit -m "Update backend"
git push
# Railway auto-deploys from GitHub
```

### Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys from GitHub
```

---

## 📝 Default Credentials

**After First Deployment:**
- Username: `admin`
- Password: `Admin@123`

**⚠️ CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!**

---

## 🎉 Success!

Your CentsWise app is now live on:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`

Share the Vercel URL with users to access the system!

---

## 📞 Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors  
3. Verify all environment variables are set correctly
4. Ensure DATABASE_URL is automatically provided by Railway

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/latest/deploying/)

---

**Deployment prepared on:** January 15, 2026  
**Status:** ✅ Ready for Production
