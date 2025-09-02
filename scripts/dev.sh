#!/bin/bash
echo "🚀 Starting budget-2025 development servers..."

# Function to kill background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT

# Start backend
echo "🐍 Starting FastAPI backend on http://localhost:8000"
cd backend && source venv/bin/activate && python main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend  
echo "⚛️ Starting React frontend on http://localhost:5173"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔌 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
