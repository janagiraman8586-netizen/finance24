import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("finance_app")

def initialize_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    # If it is PostgreSQL, test connection with a short timeout
    if not db_url.startswith("sqlite"):
        try:
            eng = create_engine(
                db_url,
                connect_args={"connect_timeout": 3},
                pool_pre_ping=True
            )
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to primary PostgreSQL database.")
            return eng
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL ({e}). Falling back to SQLite.")

    # Instant, reliable fallback to SQLite so server starts immediately without delays
    logger.info("Starting with local SQLite database (finance.db).")
    return create_engine(
        "sqlite:///./finance.db",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )

engine = initialize_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

