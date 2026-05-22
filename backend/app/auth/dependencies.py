from fastapi import Depends
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials

from app.auth.security import verify_token

security=HTTPBearer()

def get_current_user(credentials:HTTPAuthorizationCredentials=Depends(security)):
    token=credentials.credentials
    email=verify_token(token)
    if not email:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    return email