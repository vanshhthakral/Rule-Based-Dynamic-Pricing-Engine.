#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$ROOT_DIR/mongodb_data"

echo "================================================"
echo " Stopping all existing services..."
echo "================================================"
pkill -f "mongod" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "python3 app.py" 2>/dev/null
sleep 2

echo "================================================"
echo " Starting MongoDB..."
echo "================================================"
mkdir -p "$DATA_DIR"
mongod --dbpath "$DATA_DIR" --fork --logpath "$ROOT_DIR/mongodb.log"
sleep 2

echo "================================================"
echo " Installing Node dependencies..."
echo "================================================"
cd "$ROOT_DIR/backend"
npm install --save dotenv@16.4.5 2>/dev/null || npm install

echo "================================================"
echo " Starting Node Backend (Port 5002)..."
echo "================================================"
node server.js > "$ROOT_DIR/backend/node_server.log" 2>&1 &
sleep 1

echo "================================================"
echo " Starting Flask Backend (Port 5001)..."
echo "================================================"
python3 "$ROOT_DIR/backend/app.py" > "$ROOT_DIR/backend/flask_server.log" 2>&1 &
sleep 1

echo ""
echo "================================================"
echo " All services launched!"
echo " MongoDB     → port 27017"
echo " Node/Auth   → port 5002"
echo " Flask/Price → port 5001"
echo "================================================"
echo ""
echo " Now run: cd frontend && npm run dev"
echo " Then open: http://localhost:5173"
echo ""
echo " To stop: pkill -f mongod && pkill -f 'node server.js' && pkill -f 'python3 app.py'"
echo "================================================"
