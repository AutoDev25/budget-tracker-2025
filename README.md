# Budget Tracker 2025

A modern budget tracking application built with React + Vite frontend and FastAPI backend.

## 🚀 Live Demo

- **Frontend**: [Coming Soon - Deploy to get URL]
- **API**: [Coming Soon - Deploy to get URL]

## 📋 Features

- Track income and expenses
- Categorize transactions
- View spending summaries
- Set budget limits
- Date range filtering

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: FastAPI, SQLAlchemy
- **Database**: PostgreSQL (Production), SQLite (Development)
- **Hosting**: Render.com

## 🏃‍♂️ Local Development

### Prerequisites
- Node.js 16+
- Python 3.9+

### Setup

1. **Clone and Navigate**
   ```bash
   cd /Users/Tarel/mac-dev-environment/projects/budget-2025
   ```

2. **Install Dependencies**
   ```bash
   # Frontend
   cd frontend && npm install
   
   # Backend
   cd ../backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend && source venv/bin/activate && python main_simple.py
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

4. **Access the App**
   - Frontend: http://localhost:5173
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🚀 Deployment to Render.com

### 1. Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/budget-tracker-2025.git
git push -u origin main
```

### 2. Deploy on Render

1. **Go to [render.com](https://render.com)** and sign up
2. **Click "New +"** → **"Blueprint"**
3. **Connect your GitHub repo**
4. **Render will automatically**:
   - Create PostgreSQL database
   - Deploy FastAPI backend
   - Deploy React frontend
   - Set up environment variables

### 3. Access Your Live App

After deployment (5-10 minutes):
- Your app will be live at: `https://budget-tracker-frontend.onrender.com`
- API will be at: `https://budget-tracker-api.onrender.com`

## 📁 Project Structure

```
budget-2025/
├── backend/                 # FastAPI backend
│   ├── main_simple.py      # Production-ready API
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/               # Source code
│   └── package.json       # Node dependencies
├── render.yaml            # Render deployment config
└── README.md             # This file
```

## 🔧 Environment Variables

### Local Development
- Automatically uses SQLite database
- No environment variables needed

### Production (Render)
- `DATABASE_URL`: Automatically provided by Render
- `PORT`: Automatically provided by Render

## 🤝 Sharing Your App

After deployment, you can share:
- **Live App URL**: Send to anyone to use your budget tracker
- **GitHub Repo**: Share the code with developers
- **API Endpoints**: Integrate with other applications

## 💰 Costs

- **Render Free Tier**: 
  - 750 hours/month web services
  - PostgreSQL database
  - Custom domains
  - Automatic SSL

Perfect for personal apps and small projects!

## 🛠️ Development Commands

```bash
# Local development
npm run dev                    # Start frontend
python main_simple.py         # Start backend

# Production build
npm run build                 # Build frontend for production
```

## 📝 API Endpoints

- `GET /` - Health check
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/summary` - Get budget summary

Full API documentation available at `/docs` when running.