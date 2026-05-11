"""Authentication dependencies — Firebase Admin SDK token verification."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
import os
import logging
from app.config import get_settings

logger = logging.getLogger(__name__)

security = HTTPBearer()

# Initialize Firebase Admin SDK
settings = get_settings()
_firebase_app = None

def _get_firebase_app():
    global _firebase_app
    if _firebase_app is None:
        try:
            # Note: GOOGLE_APPLICATION_CREDENTIALS must be set in env or .env pointing to the JSON
            if hasattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS') and settings.GOOGLE_APPLICATION_CREDENTIALS:
                cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS)
                _firebase_app = firebase_admin.initialize_app(cred)
            else:
                # Fallback to default application credentials
                _firebase_app = firebase_admin.initialize_app()
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin: {e}")
            raise
    return _firebase_app

async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verify Firebase ID token from the Authorization header using Firebase Admin SDK.
    Returns the decoded token payload containing user_id, email, etc.
    """
    token = credentials.credentials
    _get_firebase_app()

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(
    token_data: dict = Depends(verify_firebase_token),
) -> str:
    """Extract and return the user_id from the verified Firebase token."""
    user_id = token_data.get("uid")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not extract user ID from token",
        )
    return user_id
