from pwdlib import PasswordHash
from jose import jwt
from datetime import datetime, timedelta
from jose import JWTError

from app.config import *

password_hash = PasswordHash.recommended()


def hash_password(password: str):

    return password_hash.hash(password)


def verify_password(
        plain_password: str,
        hashed_password: str
):

    return password_hash.verify(
        plain_password,
        hashed_password
    )


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update(
        {"exp": expire}
    )

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def verify_token(token:str):
    try:
        payload=jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        email=payload.get("sub")
        return email
    except JWTError:
        return None
