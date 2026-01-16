# CentsWise - Quick Start Guide

## 🚀 Running the Full Stack Application

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- npm or yarn

---

## Backend Setup (Flask API)

### 1. Start Backend Server

```bash
# Terminal 1 - Backend
cd backend
python app.py
```

The backend will run on: **http://localhost:5000**

**Default Login:**
- Username: `admin`
- Password: `Admin@123`

---

## Frontend Setup (React + Vite)

### 1. Install Dependencies (First Time Only)

```bash
# Terminal 2 - Frontend
cd /home/munazil/PMITS/cursor/prd-to-pixel-perfect-main
npm install
```

### 2. Start Frontend Dev Server

```bash
npm run dev
```

The frontend will run on: **http://localhost:5173** (or similar)

---

## Testing the Connection

### Option 1: Use the API Test Page

1. Open your browser to the frontend URL (e.g., `http://localhost:5173`)
2. Navigate to `/api-test` route (or update your App.tsx to show the ApiTest component)
3. You should see:
   - ✅ **Green dot** = API connected
   - Click **"Test Login"** button
   - Should show login success and dashboard data

### Option 2: Manual cURL Tests

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Get balance (requires token from login)
curl http://localhost:5000/api/money/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Quick Integration Steps

### To use the API in your existing components:

```typescript
// Import the API client
import api from './lib/api';

// Login
const response = await api.login('admin', 'Admin@123');
if (response.data) {
  console.log('Logged in!', response.data);
}

// Get dashboard metrics
const metrics = await api.getDashboardMetrics();
console.log(metrics.data);

// Add a donation
await api.addCredit({
  donor_name: 'John Doe',
  amount: 5000,
  date: '2026-01-12',
  purpose: 'General donation',
  payment_method: 'Cash'
});
```

---

## File Structure

```
project/
├── backend/              # Flask API
│   ├── app.py           # Main app
│   ├── models.py        # Database models
│   ├── extensions.py    # Flask extensions
│   ├── routes/          # API endpoints
│   └── requirements.txt
│
└── src/                 # React Frontend
    ├── lib/
    │   └── api.ts       # API client (ready to use!)
    ├── pages/
    │   └── ApiTest.tsx  # Test page
    └── App.tsx
```

---

## Common Issues

### CORS Error?
- Make sure backend is running on port 5000
- Backend already configured to accept requests from any origin

### Connection Refused?
```bash
# Check if backend is running
curl http://localhost:5000/api/health
```

### Token Expired?
- Tokens expire after 30 minutes
- Just login again to get a new token

---

## Next Steps

1. **Test the connection** using the ApiTest page
2. **Build your UI components** using the existing design
3. **Connect components** to the API using `src/lib/api.ts`
4. **Add routing** for different pages (Login, Dashboard, Credits, etc.)

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/login` | POST | Login |
| `/api/dashboard/metrics` | GET | Dashboard stats |
| `/api/money/credits` | GET/POST | Donations |
| `/api/money/expenses` | GET/POST | Expenses |
| `/api/money/balance` | GET | Financial balance |
| `/api/property/items` | GET/POST | Inventory items |
| `/api/receipts/generate/:id` | POST | Generate receipt |

Full API documentation: `backend/README.md`

---

**Backend is connected and ready to use!** ✅
