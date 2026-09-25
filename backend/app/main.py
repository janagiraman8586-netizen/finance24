import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.api.routes import (
    auth, income, expense, transaction, budget, savings, analytics, reports, admin,
    notifications, categories, payment_methods
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("finance_app")

# Initialize database tables & seed defaults
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    try:
        from init_db import seed_database
        seed_database()
        logger.info("Default roles, categories, and demo users verified.")
    except Exception as seed_err:
        logger.warning(f"Database auto-seeding notice: {seed_err}")
except Exception as err:
    logger.error(f"Failed to initialize database tables: {err}")

app = FastAPI(
    title="Finance Management System API",
    description="Comprehensive Personal & Enterprise Finance Management Backend",
    version="1.0.0"
)

# Configure CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

# Health check route
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(income.router, prefix="/api")
app.include_router(expense.router, prefix="/api")
app.include_router(transaction.router, prefix="/api")
app.include_router(budget.router, prefix="/api")
app.include_router(savings.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(payment_methods.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
