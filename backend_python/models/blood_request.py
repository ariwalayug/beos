"""
BloodRequest Model for BEOS Python Backend
"""

from database.db import get_db
from typing import Optional, Dict, Any, List


class BloodRequest:
    """Blood Request model for emergency requests"""
    
    @staticmethod
    async def get_all(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all blood requests with optional filters"""
        db = await get_db()
        filters = filters or {}
        
        query = """
            SELECT br.*, h.name as hospital_name, h.city as hospital_city
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE 1=1
        """
        params = []
        
        if filters.get("status"):
            query += " AND br.status = ?"
            params.append(filters["status"])
        
        if filters.get("urgency"):
            query += " AND br.urgency = ?"
            params.append(filters["urgency"])
        
        if filters.get("blood_type"):
            query += " AND br.blood_type = ?"
            params.append(filters["blood_type"])
        
        if filters.get("hospital_id"):
            query += " AND br.hospital_id = ?"
            params.append(filters["hospital_id"])
        
        query += """
            ORDER BY 
                CASE br.urgency 
                    WHEN 'critical' THEN 1 
                    WHEN 'urgent' THEN 2 
                    ELSE 3 
                END,
                br.created_at DESC
        """
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def get_by_id(request_id: int) -> Optional[Dict[str, Any]]:
        """Get blood request by ID"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT br.*, h.name as hospital_name, h.city as hospital_city, h.phone as hospital_phone
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.id = ?""",
            (request_id,)
        )
        row = await cursor.fetchone()
        if row:
            return dict(row)
        return None
    
    @staticmethod
    async def get_pending() -> List[Dict[str, Any]]:
        """Get pending requests"""
        return await BloodRequest.get_all({"status": "pending"})
    
    @staticmethod
    async def get_critical() -> List[Dict[str, Any]]:
        """Get critical pending requests"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT br.*, h.name as hospital_name, h.city as hospital_city
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.status = 'pending' AND br.urgency = 'critical'
            ORDER BY br.created_at ASC"""
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def get_history(donor_id: int) -> List[Dict[str, Any]]:
        """Get donation history for a donor"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT br.*, h.name as hospital_name, h.city as hospital_city
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.donor_id = ? AND br.status = 'fulfilled'
            ORDER BY br.fulfilled_at DESC""",
            (donor_id,)
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
    
    @staticmethod
    async def create(request: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new blood request"""
        db = await get_db()
        
        cursor = await db.execute(
            """INSERT INTO blood_requests (
                hospital_id, patient_name, age, gender, hemoglobin, platelets, 
                blood_type, units, component_type, urgency, is_critical, 
                diagnosis, past_reaction, allergies, doctor_name, 
                status, contact_phone, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                request.get("hospital_id"),
                request.get("patient_name"),
                request.get("age"),
                request.get("gender"),
                request.get("hemoglobin"),
                request.get("platelets"),
                request["blood_type"],
                request.get("units", 1),
                request.get("component_type", "Whole Blood"),
                request.get("urgency", "normal"),
                1 if request.get("is_critical") else 0,
                request.get("diagnosis"),
                request.get("past_reaction"),
                request.get("allergies"),
                request.get("doctor_name"),
                request.get("status", "pending"),
                request.get("contact_phone"),
                request.get("notes")
            )
        )
        await db.commit()
        
        return await BloodRequest.get_by_id(cursor.lastrowid)
    
    @staticmethod
    async def update(request_id: int, request: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a blood request"""
        db = await get_db()
        
        fields = []
        params = []
        
        field_map = {
            "hospital_id": "hospital_id",
            "patient_name": "patient_name",
            "age": "age",
            "hemoglobin": "hemoglobin",
            "platelets": "platelets",
            "blood_type": "blood_type",
            "units": "units",
            "urgency": "urgency",
            "past_reaction": "past_reaction",
            "contact_phone": "contact_phone",
            "notes": "notes",
            "gender": "gender",
            "doctor_name": "doctor_name",
            "component_type": "component_type",
            "diagnosis": "diagnosis",
            "allergies": "allergies",
            "donor_id": "donor_id"
        }
        
        for key, field in field_map.items():
            if key in request:
                fields.append(f"{field} = ?")
                params.append(request[key])
        
        if "is_critical" in request:
            fields.append("is_critical = ?")
            params.append(1 if request["is_critical"] else 0)
        
        if "status" in request:
            fields.append("status = ?")
            params.append(request["status"])
            if request["status"] == "fulfilled":
                fields.append("fulfilled_at = CURRENT_TIMESTAMP")
        
        if not fields:
            return await BloodRequest.get_by_id(request_id)
        
        params.append(request_id)
        await db.execute(f"UPDATE blood_requests SET {', '.join(fields)} WHERE id = ?", params)
        await db.commit()
        
        return await BloodRequest.get_by_id(request_id)
    
    @staticmethod
    async def fulfill(request_id: int, donor_id: int = None) -> Optional[Dict[str, Any]]:
        """Fulfill a blood request"""
        update_data = {"status": "fulfilled"}
        if donor_id:
            update_data["donor_id"] = donor_id
        return await BloodRequest.update(request_id, update_data)
    
    @staticmethod
    async def cancel(request_id: int) -> Optional[Dict[str, Any]]:
        """Cancel a blood request"""
        return await BloodRequest.update(request_id, {"status": "cancelled"})
    
    @staticmethod
    async def delete(request_id: int) -> bool:
        """Delete a blood request"""
        db = await get_db()
        await db.execute("DELETE FROM blood_requests WHERE id = ?", (request_id,))
        await db.commit()
        return True
    
    @staticmethod
    async def get_stats() -> Dict[str, Any]:
        """Get blood request statistics"""
        db = await get_db()
        
        cursor = await db.execute("SELECT COUNT(*) FROM blood_requests")
        total = (await cursor.fetchone())[0]
        
        cursor = await db.execute("SELECT COUNT(*) FROM blood_requests WHERE status = 'pending'")
        pending = (await cursor.fetchone())[0]
        
        cursor = await db.execute("SELECT COUNT(*) FROM blood_requests WHERE status = 'fulfilled'")
        fulfilled = (await cursor.fetchone())[0]
        
        cursor = await db.execute(
            "SELECT COUNT(*) FROM blood_requests WHERE status = 'pending' AND urgency = 'critical'"
        )
        critical = (await cursor.fetchone())[0]
        
        cursor = await db.execute(
            """SELECT blood_type, COUNT(*) as count
            FROM blood_requests
            WHERE status = 'pending'
            GROUP BY blood_type"""
        )
        by_type_rows = await cursor.fetchall()
        by_blood_type = {row[0]: row[1] for row in by_type_rows}
        
        return {
            "total": total,
            "pending": pending,
            "fulfilled": fulfilled,
            "critical": critical,
            "byBloodType": by_blood_type
        }
