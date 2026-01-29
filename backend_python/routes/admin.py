"""
Admin Routes for BEOS Python Backend
"""

from fastapi import APIRouter, HTTPException, Depends
from database.db import get_db
from middleware.auth import authorize_roles

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(_: dict = Depends(authorize_roles("admin"))):
    """Get system-wide statistics"""
    try:
        db = await get_db()
        
        # User stats
        cursor = await db.execute("SELECT role, COUNT(*) as count FROM users GROUP BY role")
        user_rows = await cursor.fetchall()
        
        cursor = await db.execute("SELECT COUNT(*) FROM users")
        total_users = (await cursor.fetchone())[0]
        
        user_stats = {
            "total": total_users,
            "donors": 0,
            "hospitals": 0,
            "bloodBanks": 0,
            "admins": 0
        }
        
        for row in user_rows:
            role = row[0]
            count = row[1]
            if role == "donor" or role == "user":
                user_stats["donors"] += count
            elif role == "hospital":
                user_stats["hospitals"] = count
            elif role == "blood_bank":
                user_stats["bloodBanks"] = count
            elif role == "admin":
                user_stats["admins"] = count
        
        # Request stats
        cursor = await db.execute("SELECT urgency, COUNT(*) as count FROM blood_requests GROUP BY urgency")
        request_rows = await cursor.fetchall()
        
        request_stats = {"total": 0, "critical": 0, "normal": 0}
        for row in request_rows:
            urgency = row[0]
            count = row[1]
            request_stats["total"] += count
            if urgency == "critical":
                request_stats["critical"] = count
            elif urgency == "normal":
                request_stats["normal"] = count
        
        # Donation count
        cursor = await db.execute("SELECT COUNT(*) FROM donations")
        total_donations = (await cursor.fetchone())[0]
        
        return {
            "success": True,
            "data": {
                "users": user_stats,
                "requests": request_stats,
                "donations": total_donations
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/users")
async def get_all_users(_: dict = Depends(authorize_roles("admin"))):
    """List all users with details"""
    try:
        db = await get_db()
        
        query = """
            SELECT 
                u.id, 
                u.email, 
                u.role, 
                u.created_at,
                COALESCE(d.name, h.name, b.name, 'Admin') as name
            FROM users u
            LEFT JOIN donors d ON u.id = d.user_id
            LEFT JOIN hospitals h ON u.id = h.user_id
            LEFT JOIN blood_banks b ON u.id = b.user_id
            ORDER BY u.created_at DESC
        """
        
        cursor = await db.execute(query)
        rows = await cursor.fetchall()
        users = [dict(row) for row in rows]
        
        return {"success": True, "data": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, current_user: dict = Depends(authorize_roles("admin"))):
    """Delete a user"""
    try:
        # Prevent deleting self
        if user_id == current_user["id"]:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Cannot delete your own admin account."}
            )
        
        db = await get_db()
        await db.execute("DELETE FROM users WHERE id = ?", (user_id,))
        await db.commit()
        
        return {"success": True, "message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
