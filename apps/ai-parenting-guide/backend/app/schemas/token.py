from typing import Optional
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict  # Simplified user object

class TokenPayload(BaseModel):
    sub: Optional[str] = None
