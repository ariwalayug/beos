"""
AI Service for BEOS Enterprise
Provides predictive analytics for blood/organ demand and smart matching
"""

from database.db import get_db
from typing import Dict, Any, List, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import math


class AIService:
    """AI-powered analytics and prediction service"""
    
    # ==========================================
    # DEMAND FORECASTING
    # ==========================================
    
    @staticmethod
    async def predict_demand(days_ahead: int = 7) -> Dict[str, Any]:
        """
        Predict blood demand for the next N days
        Uses historical data patterns and moving averages
        """
        db = await get_db()
        
        # Get historical demand (last 90 days of requests)
        cursor = await db.execute(
            """SELECT blood_type, 
                      strftime('%w', created_at) as day_of_week,
                      SUM(units) as total_units,
                      COUNT(*) as request_count
               FROM blood_requests
               WHERE created_at > datetime('now', '-90 days')
               GROUP BY blood_type, strftime('%w', created_at)"""
        )
        historical = await cursor.fetchall()
        
        # Build demand patterns by blood type and day of week
        patterns = defaultdict(lambda: defaultdict(list))
        for row in historical:
            blood_type, day_of_week, units, count = row
            patterns[blood_type][int(day_of_week)].append(units or 0)
        
        # Calculate average demand per blood type per day
        predictions = []
        today = datetime.utcnow()
        
        for day_offset in range(days_ahead):
            future_date = today + timedelta(days=day_offset)
            day_of_week = future_date.weekday()  # 0 = Monday
            
            day_predictions = {
                "date": future_date.strftime("%Y-%m-%d"),
                "day_name": future_date.strftime("%A"),
                "blood_types": {}
            }
            
            for blood_type in ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']:
                historical_data = patterns[blood_type][day_of_week]
                if historical_data:
                    avg = sum(historical_data) / len(historical_data)
                    # Add seasonal variation factor
                    seasonal_factor = 1.0 + 0.1 * math.sin(2 * math.pi * future_date.timetuple().tm_yday / 365)
                    predicted = round(avg * seasonal_factor, 1)
                else:
                    # Fallback to overall average if no data for this day
                    predicted = 5.0  # Default prediction
                
                day_predictions["blood_types"][blood_type] = {
                    "predicted_units": predicted,
                    "confidence": "high" if len(historical_data) > 10 else "medium" if historical_data else "low"
                }
            
            predictions.append(day_predictions)
        
        return {
            "forecast_period": f"{days_ahead} days",
            "generated_at": datetime.utcnow().isoformat(),
            "predictions": predictions
        }
    
    # ==========================================
    # WASTAGE PREVENTION
    # ==========================================
    
    @staticmethod
    async def get_expiring_blood(days_until_expiry: int = 7) -> List[Dict[str, Any]]:
        """Find blood batches that will expire soon"""
        db = await get_db()
        
        cursor = await db.execute(
            """SELECT bb.id as batch_id, bb.blood_type, bb.units, bb.expiry_date,
                      bank.id as bank_id, bank.name as bank_name, bank.city,
                      bank.latitude, bank.longitude
               FROM blood_batches bb
               JOIN blood_banks bank ON bb.blood_bank_id = bank.id
               WHERE bb.expiry_date BETWEEN date('now') AND date('now', ?)
               AND bb.units > 0
               ORDER BY bb.expiry_date ASC""",
            (f"+{days_until_expiry} days",)
        )
        rows = await cursor.fetchall()
        
        results = []
        for row in rows:
            batch = dict(row)
            
            # Calculate days until expiry
            expiry = datetime.strptime(batch["expiry_date"], "%Y-%m-%d")
            days_left = (expiry - datetime.utcnow()).days
            batch["days_until_expiry"] = max(0, days_left)
            batch["urgency"] = "critical" if days_left <= 2 else "high" if days_left <= 5 else "medium"
            
            results.append(batch)
        
        return results
    
    @staticmethod
    async def suggest_transfers() -> List[Dict[str, Any]]:
        """
        AI-powered transfer suggestions to prevent wastage
        Matches surplus locations with deficit locations
        """
        db = await get_db()
        
        # Find banks with expiring blood (surplus)
        expiring = await AIService.get_expiring_blood(7)
        
        if not expiring:
            return []
        
        # Find banks that need blood (deficit) based on recent requests
        cursor = await db.execute(
            """SELECT br.blood_type, h.id as hospital_id, h.name as hospital_name,
                      h.city, h.latitude, h.longitude,
                      SUM(br.units) as units_needed
               FROM blood_requests br
               JOIN hospitals h ON br.hospital_id = h.id
               WHERE br.status = 'pending'
               GROUP BY br.blood_type, h.id"""
        )
        deficit_locations = await cursor.fetchall()
        
        suggestions = []
        
        for expiring_batch in expiring:
            for deficit in deficit_locations:
                deficit_dict = dict(deficit)
                
                if deficit_dict["blood_type"] != expiring_batch["blood_type"]:
                    continue
                
                # Calculate distance
                if expiring_batch.get("latitude") and deficit_dict.get("latitude"):
                    distance = AIService._calculate_distance(
                        expiring_batch["latitude"], expiring_batch["longitude"],
                        deficit_dict["latitude"], deficit_dict["longitude"]
                    )
                else:
                    distance = 100  # Assume 100km if no coordinates
                
                # Only suggest if within reasonable distance (200km)
                if distance <= 200:
                    transfer_units = min(expiring_batch["units"], deficit_dict["units_needed"])
                    
                    suggestions.append({
                        "priority": expiring_batch["urgency"],
                        "days_until_expiry": expiring_batch["days_until_expiry"],
                        "blood_type": expiring_batch["blood_type"],
                        "units": transfer_units,
                        "from": {
                            "bank_id": expiring_batch["bank_id"],
                            "name": expiring_batch["bank_name"],
                            "city": expiring_batch["city"]
                        },
                        "to": {
                            "hospital_id": deficit_dict["hospital_id"],
                            "name": deficit_dict["hospital_name"],
                            "city": deficit_dict["city"]
                        },
                        "distance_km": round(distance, 2),
                        "estimated_value_saved": transfer_units * 2500,  # ~₹2500 per unit
                        "action": "TRANSFER_RECOMMENDED"
                    })
        
        # Sort by priority and distance
        suggestions.sort(key=lambda x: (
            {"critical": 0, "high": 1, "medium": 2}.get(x["priority"], 3),
            x["distance_km"]
        ))
        
        return suggestions[:10]  # Return top 10 suggestions
    
    # ==========================================
    # SMART MATCHING
    # ==========================================
    
    @staticmethod
    async def smart_match_donors(request_id: int) -> List[Dict[str, Any]]:
        """
        AI-powered donor matching considering:
        - Blood type compatibility
        - Geographic proximity
        - Donation history (last donation date)
        - Availability status
        """
        db = await get_db()
        
        # Get the request details
        cursor = await db.execute(
            """SELECT br.*, h.latitude, h.longitude, h.city
               FROM blood_requests br
               LEFT JOIN hospitals h ON br.hospital_id = h.id
               WHERE br.id = ?""",
            (request_id,)
        )
        request = await cursor.fetchone()
        if not request:
            return []
        
        request_dict = dict(request)
        compatible_types = AIService._get_compatible_donors(request_dict["blood_type"])
        
        # Find matching donors
        placeholders = ','.join(['?' for _ in compatible_types])
        cursor = await db.execute(
            f"""SELECT * FROM donors
                WHERE blood_type IN ({placeholders})
                AND available = 1
                ORDER BY last_donation ASC NULLS FIRST""",
            compatible_types
        )
        donors = await cursor.fetchall()
        
        matches = []
        for donor in donors:
            donor_dict = dict(donor)
            score = 100  # Start with perfect score
            
            # Factor 1: Blood type match (exact match preferred)
            if donor_dict["blood_type"] == request_dict["blood_type"]:
                score += 20  # Bonus for exact match
            
            # Factor 2: Geographic proximity
            if request_dict.get("latitude") and donor_dict.get("latitude"):
                distance = AIService._calculate_distance(
                    request_dict["latitude"], request_dict["longitude"],
                    donor_dict["latitude"], donor_dict["longitude"]
                )
                donor_dict["distance_km"] = round(distance, 2)
                # Reduce score for distance (10 points per 50km)
                score -= min(50, distance / 5)
            else:
                donor_dict["distance_km"] = None
                # Check if same city
                if donor_dict.get("city") == request_dict.get("city"):
                    score += 10
            
            # Factor 3: Last donation (more points if not donated recently)
            if donor_dict.get("last_donation"):
                last_donation = datetime.strptime(donor_dict["last_donation"], "%Y-%m-%d")
                days_since = (datetime.utcnow() - last_donation).days
                if days_since >= 90:  # Safe to donate again
                    score += min(20, days_since / 10)
                else:
                    score -= 50  # Recently donated, less preferred
                donor_dict["days_since_donation"] = days_since
            else:
                score += 15  # First-time donor gets bonus
                donor_dict["days_since_donation"] = None
            
            donor_dict["match_score"] = round(max(0, score), 1)
            donor_dict["is_recommended"] = score >= 80
            
            matches.append(donor_dict)
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        return matches[:20]  # Return top 20 matches
    
    # ==========================================
    # ANALYTICS & INSIGHTS
    # ==========================================
    
    @staticmethod
    async def get_insights() -> Dict[str, Any]:
        """Generate AI-powered insights for the dashboard"""
        db = await get_db()
        
        insights = []
        
        # Insight 1: Wastage risk
        expiring = await AIService.get_expiring_blood(3)
        if expiring:
            total_units = sum(b["units"] for b in expiring)
            insights.append({
                "type": "warning",
                "icon": "⚠️",
                "title": "Wastage Risk",
                "message": f"{total_units} units of blood expiring in next 3 days across {len(expiring)} batches",
                "action": "View transfer suggestions",
                "action_link": "/api/ai/suggest-transfers"
            })
        
        # Insight 2: Critical shortages
        cursor = await db.execute(
            """SELECT blood_type, SUM(units) as total
               FROM blood_inventory
               GROUP BY blood_type
               HAVING total < 20"""
        )
        low_stock = await cursor.fetchall()
        if low_stock:
            types = [row[0] for row in low_stock]
            insights.append({
                "type": "critical",
                "icon": "🔴",
                "title": "Critical Shortage",
                "message": f"Low stock alert for blood types: {', '.join(types)}",
                "action": "Send donor alerts",
                "action_link": "/api/ai/donor-blast"
            })
        
        # Insight 3: Pending critical requests
        cursor = await db.execute(
            """SELECT COUNT(*) FROM blood_requests
               WHERE status = 'pending' AND urgency = 'critical'"""
        )
        critical_pending = (await cursor.fetchone())[0]
        if critical_pending > 0:
            insights.append({
                "type": "urgent",
                "icon": "🚨",
                "title": "Critical Requests Pending",
                "message": f"{critical_pending} critical blood requests awaiting fulfillment",
                "action": "View requests",
                "action_link": "/api/requests/critical"
            })
        
        # Insight 4: Organ viability alerts
        try:
            cursor = await db.execute(
                """SELECT COUNT(*) FROM organs
                   WHERE status = 'available' 
                   AND ischemia_deadline < datetime('now', '+4 hours')"""
            )
            critical_organs = (await cursor.fetchone())[0]
            if critical_organs > 0:
                insights.append({
                    "type": "critical",
                    "icon": "💔",
                    "title": "Organ Viability Alert",
                    "message": f"{critical_organs} organs need transplant within 4 hours",
                    "action": "Find recipients",
                    "action_link": "/api/organs/urgent"
                })
        except:
            pass  # Organ table may not exist yet
        
        # Insight 5: Success metrics
        cursor = await db.execute(
            """SELECT 
                (SELECT COUNT(*) FROM blood_requests WHERE status = 'fulfilled') as fulfilled,
                (SELECT COUNT(*) FROM blood_requests) as total"""
        )
        metrics = await cursor.fetchone()
        if metrics[1] > 0:
            success_rate = round((metrics[0] / metrics[1]) * 100, 1)
            insights.append({
                "type": "success",
                "icon": "✅",
                "title": "Fulfillment Rate",
                "message": f"{success_rate}% of blood requests fulfilled ({metrics[0]}/{metrics[1]})",
                "action": None,
                "action_link": None
            })
        
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "insights": insights,
            "total_insights": len(insights)
        }
    
    # ==========================================
    # HELPER METHODS
    # ==========================================
    
    @staticmethod
    def _get_compatible_donors(blood_type: str) -> List[str]:
        """Get blood types that can donate to the given type"""
        compatibility = {
            "A+": ["A+", "A-", "O+", "O-"],
            "A-": ["A-", "O-"],
            "B+": ["B+", "B-", "O+", "O-"],
            "B-": ["B-", "O-"],
            "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            "AB-": ["A-", "B-", "AB-", "O-"],
            "O+": ["O+", "O-"],
            "O-": ["O-"],
        }
        return compatibility.get(blood_type, [blood_type])
    
    @staticmethod
    def _calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine formula for distance calculation"""
        R = 6371  # Earth's radius in km
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
