# PatientVoice - Complete Setup Guide

This is a full-stack medical report generation application using React, Supabase, and AI integration.

## 📁 Project Structure

```
src/
 ├── components/
 │    ├── Navbar.jsx
 │    ├── ProtectedRoute.jsx
 │    └── AdminRoute.jsx
 │
 ├── context/
 │    └── AuthContext.jsx
 │
 ├── hooks/
 │    └── useRole.js
 │
 ├── pages/
 │    ├── Login.jsx
 │    ├── Register.jsx
 │    ├── Dashboard.jsx
 │    ├── CreateReport.jsx
 │    └── Admin.jsx
 │
 ├── services/
 │    ├── supabaseClient.js
 │    └── aiService.js
 │
 ├── App.jsx
 ├── main.jsx
 └── index.css

api/
 └── ai.js (Vercel serverless function)
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

The required packages are already in package.json:
- `@supabase/supabase-js` - Database and authentication
- `react-router-dom` - Routing
- `recharts` - Charts and visualization (optional)

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_URL=https://cqtatexdaatvcyhhvfao.supabase.co
```

### 3. Set Up Supabase Database

1. Go to [Supabase](https://supabase.com)
2. Create a new project or use existing
3. In the SQL Editor, run the SQL from `DATABASE_SCHEMA.sql`
4. Get your `ANON_KEY` from Project Settings → API Keys

### 4. Run Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173`

## 📋 Features Implemented

### ✅ Authentication (AuthContext.jsx)
- User registration with email/password
- User login
- Session persistence
- Auto logout on session expire

### ✅ Role-Based Access Control
- User role stored in user metadata
- `useRole()` hook to check user role
- `AdminRoute` component for admin-only pages
- `ProtectedRoute` component for authenticated users

### ✅ Dashboard (Dashboard.jsx)
- View all user's medical reports
- Reports pulled from Supabase with RLS
- Display input text and AI output
- Timestamp for each report

### ✅ Create Reports (CreateReport.jsx)
- Input patient symptoms/information
- Generate AI medical report via `/api/ai` endpoint
- Automatically save to database
- Display generated report

### ✅ Admin Panel (Admin.jsx)
- View all reports from all users
- Delete reports
- Total report count

### ✅ Navigation (Navbar.jsx)
- Links based on authentication status
- Show admin link only for admins
- Logout button
- Display current user email

### ✅ API Integration (ai.js)
- Serverless function (deploy to Vercel)
- Accepts patient information
- Returns formatted medical report
- Can be replaced with real AI API (OpenAI, etc.)

## 🔐 Security Features

- **Row-Level Security (RLS)** on reports table
- Users can only see their own reports
- Admin can see all reports
- Protected routes require authentication
- Admin routes check user role

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend API (Vercel)
- The `/api/ai.js` file is ready for Vercel
- Just push to GitHub and connect to Vercel
- Environment variables handled in Vercel dashboard

### Database (Supabase Cloud)
- Already hosted and managed
- No additional deployment needed

## 🔧 Customization

### Change AI Provider
Edit `src/services/aiService.js`:
```javascript
// Replace with your AI API (OpenAI, Claude, etc.)
const response = await fetch('https://your-ai-api.com/generate', {
  method: "POST",
  headers: { "Authorization": "Bearer YOUR_KEY" },
  body: JSON.stringify({ input })
})
```

### Add More User Roles
1. Update registration to accept role parameter
2. Modify `useRole()` hook to return correct role
3. Create new route guards as needed

### Customize Styling
Edit `src/index.css` to change:
- Purple theme color: `#6A0DAD` → your color
- Dark background: `#0F0720` → your color
- Accent pink: `#FF006E` → your color

## 📱 Pages Overview

| Page | Path | Auth Required | Role Required |
|------|------|---------------|---------------|
| Login | `/login` | No | - |
| Register | `/register` | No | - |
| Dashboard | `/` | Yes | User |
| Create Report | `/create` | Yes | User |
| Admin Panel | `/admin` | Yes | Admin |

## 🛠️ Environment Variables Reference

```env
# Required for Supabase
VITE_SUPABASE_ANON_KEY=pk_anon_xxxxx
VITE_SUPABASE_URL=https://your-project.supabase.co

# Optional for custom AI
VITE_OPENAI_KEY=sk_xxxxx
```

## 📚 Database Tables

### reports
- `id` - UUID primary key
- `user_id` - FK to auth.users
- `input_text` - Patient information input
- `ai_output` - Generated medical report
- `created_at` - Timestamp

## ✨ Next Steps

1. ✅ Verify all components render correctly
2. ✅ Test authentication flow
3. ✅ Test report creation and viewing
4. ✅ Test admin functionality
5. 🔄 Connect real AI API instead of mock
6. 🔄 Add more features (edit, export, notifications)
7. 🔄 Deploy to production

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
npm run dev
```

### Supabase connection fails
- Check `.env.local` has correct keys
- Verify Supabase URL and ANON_KEY
- Check network connection

### Routes not working
- Ensure `react-router-dom` is installed
- Check that App.jsx has BrowserRouter wrapper

### Reports not saving
- Verify database schema is created
- Check RLS policies allow inserts
- Check user_id is being passed correctly

## 📞 Support

For issues, check:
1. Browser console for errors
2. Supabase dashboard for database issues
3. Network tab for API failures
4. Vercel logs for backend errors
