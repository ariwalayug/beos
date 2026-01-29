"""
Organ Routes for BEOS Enterprise
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from models.organ import Organ
from middleware.auth import verify_token, authorize_roles

router = APIRouter()


class OrganCreate(BaseModel):
    organ_type: str
    donor_id: Optional[int] = None
    donor_age: Optional[int] = None
    blood_type: str
    hla_a: Optional[str] = None
    hla_b: Optional[str] = None
    hla_c: Optional[str] = None
    hla_dr: Optional[str] = None
    hla_dq: Optional[str] = None
    hla_dp: Optional[str] = None
    harvest_time: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    hospital_id: Optional[int] = None
    notes: Optional[str] = None


class OrganUpdate(BaseModel):
    status: str
    recipient_id: Optional[int] = None


@router.get("/")
async def get_organs(
    organ_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    blood_type: Optional[str] = Query(None),
    viable_only: bool = Query(True)
):
    """Get all organs with filters"""
    try:
        filters = {}
        if organ_type:
            filters["organ_type"] = organ_type
        if status:
            filters["status"] = status
        if blood_type:
            filters["blood_type"] = blood_type
        filters["viable_only"] = viable_only
        
        organs = await Organ.get_all(filters)
        return {"success": True, "data": organs}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/stats")
async def get_organ_stats():
    """Get organ statistics"""
    try:
        stats = await Organ.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/urgent")
async def get_urgent_organs():
    """Get organs nearing expiration"""
    try:
        organs = await Organ.get_all({"status": "available", "viable_only": True})
        # Filter for those with < 4 hours remaining
        urgent = [
            o for o in organs 
            if o.get("viability_remaining") is not None and o["viability_remaining"] < 4
        ]
        return {"success": True, "data": urgent}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{organ_id}")
async def get_organ(organ_id: int):
    """Get organ by ID"""
    try:
        organ = await Organ.get_by_id(organ_id)
        if not organ:
            raise HTTPException(status_code=404, detail={"success": False, "error": "Organ not found"})
        return {"success": True, "data": organ}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{organ_id}/matches")
async def get_organ_matches(organ_id: int):
    """Find matches for an organ"""
    try:
        matches = await Organ.find_matches(organ_id)
        return {"success": True, "data": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.post("/", status_code=201)
async def log_organ(organ: OrganCreate, current_user: dict = Depends(authorize_roles("hospital", "admin"))):
    """Log a new available organ"""
    try:
        data = organ.model_dump()
        
        # Auto-assign hospital if applicable
        if not data.get("hospital_id") and current_user["role"] == "hospital":
            # Need to fetch hospital profile ID, but for now assuming it's passed or handled
            pass 
        
        new_organ = await Organ.create(data)
        return {"success": True, "data": new_organ}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{organ_id}/status")
async def update_organ_status(
    organ_id: int, 
    update: OrganUpdate,
    current_user: dict = Depends(authorize_roles("hospital", "admin"))
):
    """Update organ status (e.g. transplanted, in_transit)"""
    try:
        updated = await Organ.update_status(organ_id, update.status, update.recipient_id)
        return {"success": True, "data": updated}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"success": False, "error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
