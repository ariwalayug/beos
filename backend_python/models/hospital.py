"""
Hospital Model for BEOS Python Backend
"""

from database.db import get_db
from typing import Optional, Dict, Any, List


class Hospital:
    """Hospital model"""
    
    @staticmethod
    async def get_all(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all hospitals with optional filters"""
        db = await get_db()
        filters = filters or {}
        
        query = "SELECT * FROM hospitals WHERE 1=1"
        params = []
        
        if filters.get("city"):
            query += " AND city LIKE ?"
            params.append(f"%{filters['city']}%")
        
        if filters.get("search"):
            query += " AND (name LIKE ? OR address LIKE ?)"
            params.append(f"%{filters['search']}%")
            params.append(f"%{filters['search']}%")
        
        query += " ORDER BY name ASC"
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def get_by_id(hospital_id: int) -> Optional[Dict[str, Any]]:
        """Get hospital by ID"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM hospitals WHERE id = ?", (hospital_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def get_by_user_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get hospital by user ID"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM hospitals WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def create(hospital: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new hospital"""
        db = await get_db()
        
        cursor = await db.execute(
            """INSERT INTO hospitals (user_id, name, address, city, phone, email, latitude, longitude, emergency_contact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                hospital.get("user_id"),
                hospital["name"],
                hospital["address"],
                hospital["city"],
                hospital["phone"],
                hospital.get("email"),
                hospital.get("latitude"),
                hospital.get("longitude"),
                hospital.get("emergency_contact")
            )
        )
        await db.commit()
        
        return {"id": cursor.lastrowid, **hospital}
    
    @staticmethod
    async def update(hospital_id: int, hospital: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a hospital"""
        db = await get_db()
        
        fields = []
        params = []
        
        if hospital.get("name"):
            fields.append("name = ?")
            params.append(hospital["name"])
        if hospital.get("address"):
            fields.append("address = ?")
            params.append(hospital["address"])
        if hospital.get("city"):
            fields.append("city = ?")
            params.append(hospital["city"])
        if hospital.get("phone"):
            fields.append("phone = ?")
            params.append(hospital["phone"])
        if "email" in hospital:
            fields.append("email = ?")
            params.append(hospital["email"])
        if "latitude" in hospital:
            fields.append("latitude = ?")
            params.append(hospital["latitude"])
        if "longitude" in hospital:
            fields.append("longitude = ?")
            params.append(hospital["longitude"])
        if "emergency_contact" in hospital:
            fields.append("emergency_contact = ?")
            params.append(hospital["emergency_contact"])
        
        if not fields:
            return await Hospital.get_by_id(hospital_id)
        
        params.append(hospital_id)
        await db.execute(f"UPDATE hospitals SET {', '.join(fields)} WHERE id = ?", params)
        await db.commit()
        
        return await Hospital.get_by_id(hospital_id)
    
    @staticmethod
    async def delete(hospital_id: int) -> bool:
        """Delete a hospital"""
        db = await get_db()
        await db.execute("DELETE FROM hospitals WHERE id = ?", (hospital_id,))
        await db.commit()
        return True
    
    @staticmethod
    async def get_stats() -> Dict[str, Any]:
        """Get hospital statistics"""
        db = await get_db()
        
        cursor = await db.execute("SELECT COUNT(*) as count FROM hospitals")
        total = (await cursor.fetchone())[0]
        
        cursor = await db.execute(
            """SELECT city, COUNT(*) as count 
            FROM hospitals 
            GROUP BY city
            ORDER BY count DESC"""
        )
        by_city_rows = await cursor.fetchall()
        by_city = [{"city": row[0], "count": row[1]} for row in by_city_rows]
        
        return {
            "total": total,
            "byCity": by_city
        }
