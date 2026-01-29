"""
User Model for BEOS Python Backend
"""

from database.db import get_db, pwd_context
from typing import Optional, Dict, Any


class User:
    """User model for authentication"""
    
    @staticmethod
    async def create(email: str, password: str, role: str) -> Dict[str, Any]:
        """Create a new user"""
        db = await get_db()
        password_hash = pwd_context.hash(password)
        
        try:
            cursor = await db.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (email, password_hash, role)
            )
            await db.commit()
            return {"id": cursor.lastrowid, "email": email, "role": role}
        except Exception as e:
            if "UNIQUE constraint failed" in str(e):
                raise ValueError("Email already registered")
            raise e
    
    @staticmethod
    async def find_by_email(email: str) -> Optional[Dict[str, Any]]:
        """Find user by email"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def find_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Find user by ID (without password hash)"""
        db = await get_db()
        cursor = await db.execute(
            "SELECT id, email, role, created_at FROM users WHERE id = ?",
            (user_id,)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
