import logging
import socket
import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("finance_app")

def can_resolve(host: str) -> bool:
    if not host or host in ("localhost", "127.0.0.1"):
        return True
    try:
        socket.gethostbyname(host)
        return True
    except Exception:
        return False

def initialize_engine():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    if not db_url.startswith("sqlite"):
        try:
            # Parse host from URL to check resolution without blocking
            parsed = urllib.parse.urlparse(db_url.replace("postgresql+psycopg2://", "http://"))
            host = parsed.hostname
            if host and can_resolve(host):
                eng = create_engine(
                    db_url,
                    connect_args={"connect_timeout": 3},
                    pool_pre_ping=True
                )
                logger.info(f"Connected to primary PostgreSQL database at {host}.")
                return eng
            else:
                logger.warning(f"Database host '{host}' is unresolvable via DNS. Falling back to local SQLite.")
        except Exception as e:
            logger.warning(f"Could not initialize PostgreSQL engine ({e}). Falling back to SQLite.")

    # Instant, zero-delay SQLite fallback
    logger.info("Using local SQLite database: finance.db")
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

