"""
Donor Model for BEOS Python Backend
"""

from database.db import get_db
from typing import Optional, Dict, Any, List


class Donor:
    """Donor model for blood donors"""
    
    @staticmethod
    async def get_all(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all donors with optional filters"""
        db = await get_db()
        filters = filters or {}
        
        query = "SELECT * FROM donors WHERE 1=1"
        params = []
        
        if filters.get("blood_type"):
            query += " AND blood_type = ?"
            params.append(filters["blood_type"])
        
        if filters.get("city"):
            query += " AND city LIKE ?"
            params.append(f"%{filters['city']}%")
        
        if filters.get("available") is not None:
            query += " AND available = ?"
            params.append(1 if filters["available"] else 0)
        
        query += " ORDER BY created_at DESC"
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def get_by_id(donor_id: int) -> Optional[Dict[str, Any]]:
        """Get donor by ID"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM donors WHERE id = ?", (donor_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def get_by_user_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get donor by user ID"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM donors WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def create(donor: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new donor"""
        db = await get_db()
        
        cursor = await db.execute(
            """INSERT INTO donors (user_id, name, blood_type, phone, email, city, address, available, last_donation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                donor.get("user_id"),
                donor["name"],
                donor["blood_type"],
                donor["phone"],
                donor.get("email"),
                donor["city"],
                donor.get("address"),
                1 if donor.get("available", True) else 0,
                donor.get("last_donation")
            )
        )
        await db.commit()
        
        return {"id": cursor.lastrowid, **donor}
    
    @staticmethod
    async def update(donor_id: int, donor: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a donor"""
        db = await get_db()
        
        fields = []
        params = []
        
        if donor.get("name"):
            fields.append("name = ?")
            params.append(donor["name"])
        if donor.get("blood_type"):
            fields.append("blood_type = ?")
            params.append(donor["blood_type"])
        if donor.get("phone"):
            fields.append("phone = ?")
            params.append(donor["phone"])
        if "email" in donor:
            fields.append("email = ?")
            params.append(donor["email"])
        if donor.get("city"):
            fields.append("city = ?")
            params.append(donor["city"])
        if "address" in donor:
            fields.append("address = ?")
            params.append(donor["address"])
        if "available" in donor:
            fields.append("available = ?")
            params.append(1 if donor["available"] else 0)
        if "last_donation" in donor:
            fields.append("last_donation = ?")
            params.append(donor["last_donation"])
        
        if not fields:
            return await Donor.get_by_id(donor_id)
        
        params.append(donor_id)
        await db.execute(f"UPDATE donors SET {', '.join(fields)} WHERE id = ?", params)
        await db.commit()
        
        return await Donor.get_by_id(donor_id)
    
    @staticmethod
    async def delete(donor_id: int) -> bool:
        """Delete a donor"""
        db = await get_db()
        await db.execute("DELETE FROM donors WHERE id = ?", (donor_id,))
        await db.commit()
        return True
    
    @staticmethod
    async def get_by_blood_type(blood_type: str) -> List[Dict[str, Any]]:
        """Get available donors by blood type"""
        db = await get_db()
        cursor = await db.execute(
            "SELECT * FROM donors WHERE blood_type = ? AND available = 1",
            (blood_type,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def get_stats() -> Dict[str, Any]:
        """Get donor statistics"""
        db = await get_db()
        
        cursor = await db.execute("SELECT COUNT(*) as count FROM donors")
        total = (await cursor.fetchone())[0]
        
        cursor = await db.execute("SELECT COUNT(*) as count FROM donors WHERE available = 1")
        available = (await cursor.fetchone())[0]
        
        cursor = await db.execute(
            """SELECT blood_type, COUNT(*) as count 
            FROM donors 
            WHERE available = 1 
            GROUP BY blood_type"""
        )
        by_type_rows = await cursor.fetchall()
        by_type = {row[0]: row[1] for row in by_type_rows}
        
        return {
            "total": total,
            "available": available,
            "byType": by_type
        }
