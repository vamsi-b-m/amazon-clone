from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import *

from app.auth.security import *


router=APIRouter()


@router.post(
    "/register",
    response_model=UserResponse
)

def register(
    user:UserCreate,
    db:Session=Depends(get_db)
):

    existing_user=db.query(
        User
    ).filter(
        User.email==user.email
    ).first()


    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )


    db_user=User(

        username=user.username,

        email=user.email,

        password=hash_password(
            user.password
        )

    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user


@router.post("/login")

def login(user:UserLogin, db:Session=Depends(get_db)):

    db_user=db.query(
        User
    ).filter(
        User.email==user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )
    token=create_access_token(
        {"sub":db_user.email}
    )

    return {
        "access_token":token,
        "token_type":"bearer"
    }