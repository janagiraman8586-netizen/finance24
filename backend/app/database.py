import os
import re
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

logger = logging.getLogger("finance_app")

def get_candidate_urls(raw_url: str):
    db_url = raw_url
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    candidates = [db_url]

    # If it is a Render internal host like 'dpg-xxxxxxxx-a' without a regional domain
    # Render internal DNS fails when Web Service and PostgreSQL are in different regions.
    # Automatically test external Render regional hostnames with sslmode=require.
    match = re.search(r'@(dpg-[a-z0-9]+-a)(:[0-9]+)?(/[^?]*)?(\?.*)?$', db_url)
    if match:
        host = match.group(1)
        for reg in ["oregon", "singapore", "frankfurt", "ohio", "virginia"]:
            ext_host = f"{host}.{reg}-postgres.render.com"
            ext_url = db_url.replace(f"@{host}", f"@{ext_host}")
            if "sslmode=" not in ext_url:
                sep = "&" if "?" in ext_url else "?"
                ext_url = f"{ext_url}{sep}sslmode=require"
            candidates.append(ext_url)

    candidates.append("sqlite:///./finance.db")
    return candidates

def initialize_engine():
    candidate_urls = get_candidate_urls(settings.DATABASE_URL)
    
    for url in candidate_urls:
        is_sqlite = url.startswith("sqlite")
        curr_args = {"check_same_thread": False} if is_sqlite else {"connect_timeout": 4}
        try:
            eng = create_engine(
                url,
                connect_args=curr_args,
                pool_pre_ping=True
            )
            # Validate connection
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            
            masked = url.split("@")[-1] if "@" in url else url
            logger.info(f"Database connected successfully via: {masked}")
            return eng
        except Exception as e:
            masked = url.split("@")[-1] if "@" in url else url
            logger.warning(f"Database connection attempt failed for {masked}: {e}")

    # Fallback guarantees non-crashing server
    logger.warning("Falling back to local SQLite database: finance.db")
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

