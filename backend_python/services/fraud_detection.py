from datetime import datetime, timedelta
import math

class FraudDetectionService:
    @staticmethod
    def calculate_distance(lat1, lon1, lat2, lon2):
        # Haversine formula
        R = 6371  # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat/2) * math.sin(dLat/2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dLon/2) * math.sin(dLon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c

    @staticmethod
    async def check_fraud_risk(donor_id, current_lat, current_lon, db_connection):
        """
        Analyzes donor activity for risk signals.
        Returns: (is_risky: bool, reason: str)
        """
        # 1. Frequency Check: Max 3 activities in 90 days
        # In a real scenario, we'd query the donation history
        # For now, we simulate a check or query a mock table
        
        # 2. Impossible Travel Check
        # Get last known location/time
        # last_activity = await db.fetch_last_activity(donor_id)
        
        # MOCK IMPLEMENTATION for Demo
        # If lat/lon is significantly different from "home" without time gap
        
        return False, "No risk detected"

    @staticmethod
    def is_impossible_travel(last_lat, last_lon, last_time, curr_lat, curr_lon, curr_time):
        distance = FraudDetectionService.calculate_distance(last_lat, last_lon, curr_lat, curr_lon)
        time_diff_hours = (curr_time - last_time).total_seconds() / 3600
        
        if time_diff_hours == 0:
            return distance > 10 # Cannot move 10km in 0 time
            
        speed = distance / time_diff_hours
        return speed > 800  # Commercial flight speed approx limit
