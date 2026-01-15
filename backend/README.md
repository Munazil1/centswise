# CentsWise Backend API

Flask REST API for SYS PURATHEEL - CentsWise Money & Property Management System.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
python init_db.py
```

**Default credentials:**
- Username: `admin`
- Password: `Admin@123`

### 3. Run Server

```bash
python app.py
```

API runs at: `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Authentication
- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user

### Money Management
- `POST /api/money/credits` - Add donation
- `GET /api/money/credits` - List donations
- `POST /api/money/expenses` - Add expense  
- `GET /api/money/expenses` - List expenses
- `GET /api/money/balance` - Get balance

### Receipts
- `POST /api/receipts/generate/<credit_id>` - Generate receipt PDF
- `GET /api/receipts/download/<id>` - Download receipt

### Property
- `POST /api/property/items` - Add item
- `GET /api/property/items` - List items
- `POST /api/property/distributions` - Distribute item
- `POST /api/property/distributions/<id>/return` - Mark returned

### Dashboard
- `GET /api/dashboard/metrics` - Dashboard stats
- `GET /api/dashboard/financial-summary` - Financial summary
- `GET /api/dashboard/monthly-trend` - Monthly trends

## Test API

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

## Environment Variables

Create `.env` file:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///centswise.db
```

## Deploy

See full documentation for deployment to Vercel, Heroku, or other platforms.

## Features

✅ JWT Authentication  
✅ Money Management (Credits & Expenses)  
✅ Receipt Generation (Malayalam/English)  
✅ Property Inventory Tracking  
✅ Dashboard & Reports  
✅ Complete Audit Trail
