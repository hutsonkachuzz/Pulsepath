from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.core.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.couple import Couple
from backend.app.schemas.auth import UserRegister, UserLogin, DemoLogin, UserProfileUpdate, UserOut, Token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    new_user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        name=payload.name,
        dob=payload.dob,
        avatar=f"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(new_user))

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/demo", response_model=Token)
def login_as_demo(payload: DemoLogin, db: Session = Depends(get_db)):
    # Demo couple accounts: Eren & Mikasa (with backwards compatible fallback)
    role = payload.role.lower()
    is_eren = role in ["eren", "leo"]
    email = "eren@pulsepath.love" if is_eren else "mikasa@pulsepath.love"
    legacy_email = "leo@pulsepath.love" if is_eren else "mia@pulsepath.love"
    name = "Eren" if is_eren else "Mikasa"
    avatar = (
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"
        if is_eren
        else "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
    )

    user = db.query(User).filter((User.email == email) | (User.email == legacy_email) | (User.email == ("leo@pulsepath.love" if is_eren else "mia@pulsepath.love"))).first()
    if user:
        if user.name != name or user.email != email:
            user.name = name
            user.email = email
            user.nickname = f"{name} ❤️"
            db.commit()
            db.refresh(user)
    else:
        # Create user if demo seed was not run yet
        user = User(
            email=email,
            hashed_password=get_password_hash("demo1234"),
            name=name,
            nickname=f"{name} ❤️",
            avatar=avatar,
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.nickname is not None:
        current_user.nickname = payload.nickname
    if payload.avatar is not None:
        current_user.avatar = payload.avatar
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user
