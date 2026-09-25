# Finance Management System

A comprehensive personal finance management application built with FastAPI backend and Next.js frontend.

## Features

- **User Authentication**: Secure JWT-based authentication with Bcrypt password hashing & role-based access (User & Admin).
- **Income & Expense Tracking**: Categorized financial transactions with search, filtering, and pagination.
- **Budget Management**: Monthly budget allocation by category with progress tracking and alert states.
- **Savings Goals**: Target tracking with deposit and withdrawal management.
- **Financial Analytics**: Comprehensive dashboards with Recharts visualizations, monthly trends, spending distribution, and health scoring.
- **Reports & Export**: Customizable report generation with CSV export capabilities.
- **Admin Dashboard**: User management, system-wide transaction auditing, category customization, and audit logging.

## Tech Stack

### Frontend
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios & React Hook Form
- Recharts & Lucide React

### Backend
- FastAPI
- Python 3.10+
- SQLAlchemy ORM
- SQLite (Local Dev) / PostgreSQL (Production)
- PyJWT & Passlib (Bcrypt)

## Local Setup

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Documentation
- [API Documentation](backend/docs/API.md)
- [Database Schema](backend/docs/DATABASE.md)
- [Setup Guide](backend/docs/SETUP.md)
- [Manual Deployment Guide](DEPLOYMENT.md)

## License
MIT License
