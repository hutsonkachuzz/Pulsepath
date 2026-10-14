from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import all models before creating tables so Base.metadata is fully populated
    import backend.app.models.user
    import backend.app.models.couple
    import backend.app.models.memory
    import backend.app.models.message
    import backend.app.models.thought
    import backend.app.models.letter
    import backend.app.models.date
    import backend.app.models.mood
    import backend.app.models.daily
    import backend.app.models.reminder

    Base.metadata.create_all(bind=engine)
