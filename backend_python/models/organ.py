"""
Organ Model for BEOS Enterprise - Organ Transplant Logistics
Handles organ donations, viability tracking, and matching
"""

from database.db import get_db
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta


# Organ viability times in hours (max ischemia time)
ORGAN_VIABILITY = {
    "heart": 4,
    "lung": 6,
    "liver": 12,
    "pancreas": 18,
    "kidney": 36,
    "cornea": 168,  # 7 days
    "skin": 336,    # 14 days
    "bone": 720,    # 30 days
}

# HLA markers for matching
HLA_MARKERS = ["HLA-A", "HLA-B", "HLA-C", "HLA-DR", "HLA-DQ", "HLA-DP"]


class Organ:
    """Organ model for transplant logistics"""
    
    @staticmethod
    async def get_all(filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get all organs with optional filters"""
        db = await get_db()
        filters = filters or {}
        
        query = """
            SELECT o.*, d.name as donor_name, d.blood_type as donor_blood_type,
                   h.name as hospital_name, h.city as hospital_city
            FROM organs o
            LEFT JOIN donors d ON o.donor_id = d.id
            LEFT JOIN hospitals h ON o.hospital_id = h.id
            WHERE 1=1
        """
        params = []
        
        if filters.get("organ_type"):
            query += " AND o.organ_type = ?"
            params.append(filters["organ_type"])
        
        if filters.get("status"):
            query += " AND o.status = ?"
            params.append(filters["status"])
        
        if filters.get("blood_type"):
            query += " AND o.blood_type = ?"
            params.append(filters["blood_type"])
        
        # Only show viable organs by default
        if filters.get("viable_only", True):
            query += " AND o.status = 'available' AND o.ischemia_deadline > datetime('now')"
        
        query += " ORDER BY o.ischemia_deadline ASC"  # Most urgent first
        
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        
        results = []
        for row in rows:
            organ = dict(row)
            organ["viability_remaining"] = Organ._calculate_viability_remaining(organ)
            organ["viability_percentage"] = Organ._calculate_viability_percentage(organ)
            results.append(organ)
        
        return results
    
    @staticmethod
    async def get_by_id(organ_id: int) -> Optional[Dict[str, Any]]:
        """Get organ by ID with full details"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT o.*, d.name as donor_name, d.blood_type as donor_blood_type,
                      h.name as hospital_name, h.city as hospital_city
               FROM organs o
               LEFT JOIN donors d ON o.donor_id = d.id
               LEFT JOIN hospitals h ON o.hospital_id = h.id
               WHERE o.id = ?""",
            (organ_id,)
        )
        row = await cursor.fetchone()
        if row:
            organ = dict(row)
            organ["viability_remaining"] = Organ._calculate_viability_remaining(organ)
            organ["viability_percentage"] = Organ._calculate_viability_percentage(organ)
            return organ
        return None
    
    @staticmethod
    async def create(organ: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new organ entry (when organ becomes available)"""
        db = await get_db()
        
        organ_type = organ["organ_type"].lower()
        harvest_time = organ.get("harvest_time") or datetime.utcnow().isoformat()
        
        # Calculate ischemia deadline based on organ type
        viability_hours = ORGAN_VIABILITY.get(organ_type, 24)
        if isinstance(harvest_time, str):
            harvest_dt = datetime.fromisoformat(harvest_time.replace("Z", "+00:00"))
        else:
            harvest_dt = harvest_time
        ischemia_deadline = (harvest_dt + timedelta(hours=viability_hours)).isoformat()
        
        cursor = await db.execute(
            """INSERT INTO organs (
                organ_type, donor_id, donor_age, blood_type, 
                hla_a, hla_b, hla_c, hla_dr, hla_dq, hla_dp,
                harvest_time, ischemia_deadline, status,
                hospital_id, latitude, longitude, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                organ_type,
                organ.get("donor_id"),
                organ.get("donor_age"),
                organ["blood_type"],
                organ.get("hla_a"),
                organ.get("hla_b"),
                organ.get("hla_c"),
                organ.get("hla_dr"),
                organ.get("hla_dq"),
                organ.get("hla_dp"),
                harvest_time,
                ischemia_deadline,
                "available",
                organ.get("hospital_id"),
                organ.get("latitude"),
                organ.get("longitude"),
                organ.get("notes")
            )
        )
        await db.commit()
        
        return await Organ.get_by_id(cursor.lastrowid)
    
    @staticmethod
    async def update_status(organ_id: int, status: str, recipient_id: int = None) -> Optional[Dict[str, Any]]:
        """Update organ status (available -> in_transit -> transplanted/expired)"""
        db = await get_db()
        
        valid_statuses = ["available", "matched", "in_transit", "transplanted", "expired", "discarded"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
        
        fields = ["status = ?"]
        params = [status]
        
        if recipient_id:
            fields.append("recipient_id = ?")
            params.append(recipient_id)
        
        if status == "transplanted":
            fields.append("transplant_time = datetime('now')")
        
        params.append(organ_id)
        await db.execute(
            f"UPDATE organs SET {', '.join(fields)} WHERE id = ?",
            params
        )
        await db.commit()
        
        return await Organ.get_by_id(organ_id)
    
    @staticmethod
    async def find_matches(organ_id: int, max_distance_km: float = 500) -> List[Dict[str, Any]]:
        """Find matching recipients for an organ based on compatibility"""
        db = await get_db()
        
        # Get the organ
        organ = await Organ.get_by_id(organ_id)
        if not organ:
            return []
        
        # Find compatible blood types
        compatible_blood = Organ._get_compatible_blood_types(organ["blood_type"])
        
        # Find waiting patients (from a recipients table or blood_requests with organ needs)
        # For now, using blood_requests as proxy for recipients
        placeholders = ','.join(['?' for _ in compatible_blood])
        cursor = await db.execute(
            f"""SELECT br.*, h.name as hospital_name, h.latitude, h.longitude
                FROM blood_requests br
                LEFT JOIN hospitals h ON br.hospital_id = h.id
                WHERE br.status = 'pending' 
                AND br.blood_type IN ({placeholders})
                ORDER BY br.urgency DESC, br.created_at ASC""",
            compatible_blood
        )
        matches = await cursor.fetchall()
        
        results = []
        for match in matches:
            match_dict = dict(match)
            
            # Calculate distance if coordinates available
            if organ.get("latitude") and match_dict.get("latitude"):
                distance = Organ._calculate_distance(
                    organ["latitude"], organ["longitude"],
                    match_dict["latitude"], match_dict["longitude"]
                )
                match_dict["distance_km"] = round(distance, 2)
                
                # Estimate travel time (assuming 60 km/h average)
                match_dict["estimated_travel_hours"] = round(distance / 60, 2)
                
                # Check if organ can reach in time
                viability_hours = Organ._calculate_viability_remaining(organ)
                match_dict["reachable"] = (match_dict["estimated_travel_hours"] < viability_hours) if viability_hours else False
            else:
                match_dict["distance_km"] = None
                match_dict["reachable"] = True  # Assume reachable if no coords
            
            results.append(match_dict)
        
        # Sort by priority: reachable first, then by urgency and distance
        results.sort(key=lambda x: (
            not x.get("reachable", True),  # Reachable first
            {"critical": 0, "urgent": 1, "normal": 2}.get(x.get("urgency", "normal"), 2),
            x.get("distance_km") or 9999
        ))
        
        return results
    
    @staticmethod
    async def get_available_by_type() -> Dict[str, int]:
        """Get count of available organs by type"""
        db = await get_db()
        cursor = await db.execute(
            """SELECT organ_type, COUNT(*) as count
               FROM organs
               WHERE status = 'available' AND ischemia_deadline > datetime('now')
               GROUP BY organ_type"""
        )
        rows = await cursor.fetchall()
        return {row[0]: row[1] for row in rows}
    
    @staticmethod
    async def get_stats() -> Dict[str, Any]:
        """Get organ transplant statistics"""
        db = await get_db()
        
        cursor = await db.execute("SELECT COUNT(*) FROM organs")
        total = (await cursor.fetchone())[0]
        
        cursor = await db.execute(
            "SELECT COUNT(*) FROM organs WHERE status = 'available' AND ischemia_deadline > datetime('now')"
        )
        available = (await cursor.fetchone())[0]
        
        cursor = await db.execute("SELECT COUNT(*) FROM organs WHERE status = 'transplanted'")
        transplanted = (await cursor.fetchone())[0]
        
        cursor = await db.execute("SELECT COUNT(*) FROM organs WHERE status = 'expired'")
        expired = (await cursor.fetchone())[0]
        
        cursor = await db.execute(
            """SELECT COUNT(*) FROM organs 
               WHERE status = 'available' 
               AND ischemia_deadline < datetime('now', '+4 hours')"""
        )
        critical_urgency = (await cursor.fetchone())[0]
        
        by_type = await Organ.get_available_by_type()
        
        return {
            "total": total,
            "available": available,
            "transplanted": transplanted,
            "expired": expired,
            "critical_urgency": critical_urgency,
            "by_type": by_type,
            "success_rate": round((transplanted / total * 100), 2) if total > 0 else 0
        }
    
    # Helper methods
    
    @staticmethod
    def _calculate_viability_remaining(organ: Dict[str, Any]) -> Optional[float]:
        """Calculate remaining viability hours"""
        if not organ.get("ischemia_deadline"):
            return None
        
        try:
            deadline = datetime.fromisoformat(organ["ischemia_deadline"].replace("Z", "+00:00"))
            remaining = (deadline - datetime.utcnow()).total_seconds() / 3600
            return max(0, round(remaining, 2))
        except:
            return None
    
    @staticmethod
    def _calculate_viability_percentage(organ: Dict[str, Any]) -> Optional[float]:
        """Calculate viability as percentage of max"""
        remaining = Organ._calculate_viability_remaining(organ)
        if remaining is None:
            return None
        
        max_hours = ORGAN_VIABILITY.get(organ.get("organ_type", "").lower(), 24)
        return round(min(100, (remaining / max_hours) * 100), 1)
    
    @staticmethod
    def _get_compatible_blood_types(blood_type: str) -> List[str]:
        """Get compatible blood types for organ matching"""
        # For organs, ABO compatibility is different than blood transfusion
        # Generally, exact match is preferred
        compatibility = {
            "O-": ["O-"],
            "O+": ["O-", "O+"],
            "A-": ["O-", "A-"],
            "A+": ["O-", "O+", "A-", "A+"],
            "B-": ["O-", "B-"],
            "B+": ["O-", "O+", "B-", "B+"],
            "AB-": ["O-", "A-", "B-", "AB-"],
            "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
        }
        return compatibility.get(blood_type, [blood_type])
    
    @staticmethod
    def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        import math
        
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
