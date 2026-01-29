"""
BloodBank Model for BEOS Python Backend
"""

from database.db import get_db
from typing import Optional, Dict, Any, List


class BloodBank:
    """Blood Bank model with inventory management"""
    
    @staticmethod
    async def get_all(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all blood banks with optional filters"""
        db = await get_db()
        filters = filters or {}
        
        query = "SELECT * FROM blood_banks WHERE 1=1"
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
    async def get_by_id(bank_id: int) -> Optional[Dict[str, Any]]:
        """Get blood bank by ID with inventory"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM blood_banks WHERE id = ?", (bank_id,))
        row = await cursor.fetchone()
        if row:
            bank = dict(row)
            bank["inventory"] = await BloodBank.get_inventory(bank_id)
            return bank
        return None
    
    @staticmethod
    async def get_with_inventory() -> List[Dict[str, Any]]:
        """Get all blood banks with their inventory"""
        banks = await BloodBank.get_all()
        for bank in banks:
            bank["inventory"] = await BloodBank.get_inventory(bank["id"])
        return banks
    
    @staticmethod
    async def get_inventory(bank_id: int) -> List[Dict[str, Any]]:
        """Get inventory for a blood bank"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT blood_type, units, updated_at 
            FROM blood_inventory 
            WHERE blood_bank_id = ?
            ORDER BY blood_type""",
            (bank_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def get_by_user_id(user_id: int) -> Optional[Dict[str, Any]]:
        """Get blood bank by user ID"""
        db = await get_db()
        cursor = await db.execute("SELECT * FROM blood_banks WHERE user_id = ?", (user_id,))
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def create(blood_bank: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new blood bank"""
        db = await get_db()
        
        cursor = await db.execute(
            """INSERT INTO blood_banks (user_id, name, address, city, phone, email, latitude, longitude, operating_hours)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                blood_bank.get("user_id"),
                blood_bank["name"],
                blood_bank["address"],
                blood_bank["city"],
                blood_bank["phone"],
                blood_bank.get("email"),
                blood_bank.get("latitude"),
                blood_bank.get("longitude"),
                blood_bank.get("operating_hours")
            )
        )
        bank_id = cursor.lastrowid
        
        # Initialize inventory for all blood types
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        for blood_type in blood_types:
            await db.execute(
                "INSERT INTO blood_inventory (blood_bank_id, blood_type, units) VALUES (?, ?, 0)",
                (bank_id, blood_type)
            )
        
        await db.commit()
        return {"id": bank_id, **blood_bank}
    
    @staticmethod
    async def update(bank_id: int, blood_bank: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a blood bank"""
        db = await get_db()
        
        fields = []
        params = []
        
        if blood_bank.get("name"):
            fields.append("name = ?")
            params.append(blood_bank["name"])
        if blood_bank.get("address"):
            fields.append("address = ?")
            params.append(blood_bank["address"])
        if blood_bank.get("city"):
            fields.append("city = ?")
            params.append(blood_bank["city"])
        if blood_bank.get("phone"):
            fields.append("phone = ?")
            params.append(blood_bank["phone"])
        if "email" in blood_bank:
            fields.append("email = ?")
            params.append(blood_bank["email"])
        if "latitude" in blood_bank:
            fields.append("latitude = ?")
            params.append(blood_bank["latitude"])
        if "longitude" in blood_bank:
            fields.append("longitude = ?")
            params.append(blood_bank["longitude"])
        if "operating_hours" in blood_bank:
            fields.append("operating_hours = ?")
            params.append(blood_bank["operating_hours"])
        
        if not fields:
            return await BloodBank.get_by_id(bank_id)
        
        params.append(bank_id)
        await db.execute(f"UPDATE blood_banks SET {', '.join(fields)} WHERE id = ?", params)
        await db.commit()
        
        return await BloodBank.get_by_id(bank_id)
    
    @staticmethod
    async def update_inventory(bank_id: int, blood_type: str, units: int) -> List[Dict[str, Any]]:
        """Update inventory for a blood type"""
        db = await get_db()
        await db.execute(
            """UPDATE blood_inventory 
            SET units = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE blood_bank_id = ? AND blood_type = ?""",
            (units, bank_id, blood_type)
        )
        await db.commit()
        return await BloodBank.get_inventory(bank_id)
    
    @staticmethod
    async def delete(bank_id: int) -> bool:
        """Delete a blood bank"""
        db = await get_db()
        await db.execute("DELETE FROM blood_inventory WHERE blood_bank_id = ?", (bank_id,))
        await db.execute("DELETE FROM blood_banks WHERE id = ?", (bank_id,))
        await db.commit()
        return True
    
    @staticmethod
    async def get_total_inventory() -> List[Dict[str, Any]]:
        """Get total blood inventory across all banks"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT blood_type, SUM(units) as total_units
            FROM blood_inventory
            GROUP BY blood_type
            ORDER BY blood_type"""
        )
        rows = await cursor.fetchall()
        return [{"blood_type": row[0], "total_units": row[1]} for row in rows]
    
    @staticmethod
    async def find_by_blood_type(blood_type: str, min_units: int = 1) -> List[Dict[str, Any]]:
        """Find blood banks with specific blood type available"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT bb.*, bi.units
            FROM blood_banks bb
            JOIN blood_inventory bi ON bb.id = bi.blood_bank_id
            WHERE bi.blood_type = ? AND bi.units >= ?
            ORDER BY bi.units DESC""",
            (blood_type, min_units)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    # --- Batch Management System ---
    
    @staticmethod
    async def get_batches(bank_id: int) -> List[Dict[str, Any]]:
        """Get batches for a blood bank"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT * FROM blood_batches 
            WHERE blood_bank_id = ? 
            ORDER BY expiry_date ASC""",
            (bank_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def add_batch(bank_id: int, blood_type: str, units: int, expiry_date: str) -> Dict[str, Any]:
        """Add a new batch"""
        db = await get_db()
        cursor = await db.execute(
            """INSERT INTO blood_batches (blood_bank_id, blood_type, units, expiry_date)
            VALUES (?, ?, ?, ?)""",
            (bank_id, blood_type, units, expiry_date)
        )
        await db.commit()
        
        await BloodBank.sync_inventory(bank_id, blood_type)
        
        return {
            "id": cursor.lastrowid,
            "blood_bank_id": bank_id,
            "blood_type": blood_type,
            "units": units,
            "expiry_date": expiry_date
        }
    
    @staticmethod
    async def update_batch(batch_id: int, units: int = None, expiry_date: str = None) -> Dict[str, Any]:
        """Update a batch"""
        db = await get_db()
        
        cursor = await db.execute("SELECT * FROM blood_batches WHERE id = ?", (batch_id,))
        batch = await cursor.fetchone()
        if not batch:
            raise ValueError("Batch not found")
        
        batch = dict(batch)
        fields = []
        params = []
        
        if units is not None:
            fields.append("units = ?")
            params.append(units)
        if expiry_date is not None:
            fields.append("expiry_date = ?")
            params.append(expiry_date)
        
        if fields:
            params.append(batch_id)
            await db.execute(f"UPDATE blood_batches SET {', '.join(fields)} WHERE id = ?", params)
            await db.commit()
            await BloodBank.sync_inventory(batch["blood_bank_id"], batch["blood_type"])
        
        cursor = await db.execute("SELECT * FROM blood_batches WHERE id = ?", (batch_id,))
        row = await cursor.fetchone()
        return dict(row)
    
    @staticmethod
    async def delete_batch(batch_id: int) -> bool:
        """Delete a batch"""
        db = await get_db()
        
        cursor = await db.execute("SELECT * FROM blood_batches WHERE id = ?", (batch_id,))
        batch = await cursor.fetchone()
        if not batch:
            return False
        
        batch = dict(batch)
        await db.execute("DELETE FROM blood_batches WHERE id = ?", (batch_id,))
        await db.commit()
        await BloodBank.sync_inventory(batch["blood_bank_id"], batch["blood_type"])
        return True
    
    @staticmethod
    async def sync_inventory(bank_id: int, blood_type: str):
        """Sync inventory from batches"""
        db = await get_db()
        
        cursor = await db.execute(
            """SELECT SUM(units) as total 
            FROM blood_batches 
            WHERE blood_bank_id = ? AND blood_type = ?""",
            (bank_id, blood_type)
        )
        result = await cursor.fetchone()
        total_units = result[0] or 0
        
        await db.execute(
            """INSERT INTO blood_inventory (blood_bank_id, blood_type, units, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(blood_bank_id, blood_type) 
            DO UPDATE SET units = excluded.units, updated_at = CURRENT_TIMESTAMP""",
            (bank_id, blood_type, total_units)
        )
        await db.commit()
