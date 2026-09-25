# Complete Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

## Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On Linux/macOS
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize Database with Seed Data:
   ```bash
   python init_db.py
   ```

5. Run FastAPI Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run Next.js Development Server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.
