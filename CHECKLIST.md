# ✅ Pre-Deployment Checklist

Use this checklist before deploying CentsWise to production.

## 📋 Database

- [x] Old database deleted
- [x] Fresh database initialized with `init_db.py`
- [x] Default admin user created (admin / Admin@123)
- [x] No demo/test data in database
- [x] Upload directories created with .gitkeep files

## 🔧 Backend Configuration

- [x] `Procfile` created for Railway
- [x] `railway.toml` configured
- [x] `.env.example` created with template variables
- [x] CORS configured to accept all origins (update after frontend deployment)
- [x] Gunicorn added to requirements.txt
- [x] Health check endpoint available at `/api/health`

## 🎨 Frontend Configuration

- [x] `vercel.json` created with Vite settings
- [x] `.env.example` created for API URL template
- [x] API client using `VITE_API_URL` environment variable
- [x] SPA routing configured in vercel.json
- [x] Malayalam spelling corrected (പുറത്തീൽ)
- [x] Demo credentials removed from login page

## 📦 Files Ready for Deployment

### Backend Files
```
backend/
├── Procfile                ✅
├── railway.toml           ✅
├── requirements.txt       ✅
├── .env.example          ✅
├── app.py                ✅
├── models.py             ✅
├── init_db.py            ✅
├── extensions.py         ✅
├── routes/               ✅
├── utils/                ✅
└── uploads/              ✅
```

### Frontend Files
```
Root/
├── vercel.json           ✅
├── .env.example          ✅
├── package.json          ✅
├── vite.config.ts        ✅
├── tsconfig.json         ✅
└── src/                  ✅
```

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
cd /home/munazil/PMITS/cursor/prd-to-pixel-perfect-main
git init
git add .
git commit -m "Initial commit - CentsWise ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/centswise.git
git push -u origin main
```

### 2. Deploy Backend (Railway)
1. Sign up/login to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository
4. Set root directory to `/backend`
5. Add PostgreSQL database
6. Set environment variables:
   - `SECRET_KEY`
   - `JWT_SECRET_KEY`
7. Generate domain and copy URL

### 3. Deploy Frontend (Vercel)
1. Sign up/login to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Framework preset: Vite
4. Add environment variable:
   - `VITE_API_URL` = Your Railway backend URL
5. Deploy!

### 4. Update CORS
1. Go back to Railway
2. Add environment variable:
   - `CORS_ORIGINS` = Your Vercel frontend URL
3. Redeploy backend

### 5. Test Deployment
- [ ] Visit Vercel URL
- [ ] Login with admin / Admin@123
- [ ] Add a credit
- [ ] Generate and download receipt (PDF)
- [ ] Add an expense
- [ ] Check dashboard metrics
- [ ] Verify all pages load correctly

### 6. Post-Deployment Security
- [ ] Change admin password immediately
- [ ] Generate and update secret keys in Railway
- [ ] Verify CORS is restricted to your frontend URL only

## 🔐 Security Checklist

- [ ] Admin password changed from default
- [ ] Strong SECRET_KEY set (32+ characters)
- [ ] Strong JWT_SECRET_KEY set (32+ characters)
- [ ] CORS limited to specific frontend URL
- [ ] HTTPS enabled (automatic on Railway & Vercel)
- [ ] No sensitive data in code/git
- [ ] `.env` files in `.gitignore`

## 📊 Monitoring Setup

- [ ] Railway logs accessible
- [ ] Vercel logs accessible
- [ ] Health check endpoint responding
- [ ] Database connection working

## 🎯 Ready for Production!

Once all checkboxes are marked:
✅ Your CentsWise app is ready to deploy!

---

**Last Updated:** January 15, 2026  
**Status:** Ready for Deployment 🚀
