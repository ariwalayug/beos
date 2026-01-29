"""
Donor Routes for BEOS Python Backend
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from models.donor import Donor
from middleware.auth import verify_token

router = APIRouter()


class DonorCreate(BaseModel):
    name: str
    blood_type: str
    phone: str
    city: str
    email: Optional[str] = None
    address: Optional[str] = None
    available: Optional[bool] = True


class DonorUpdate(BaseModel):
    name: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    available: Optional[bool] = None
    last_donation: Optional[str] = None


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(verify_token)):
    """Get current donor profile"""
    try:
        donor = await Donor.get_by_user_id(current_user["id"])
        if not donor:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Donor profile not found"}
            )
        return {"success": True, "data": donor}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/")
async def get_donors(
    blood_type: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    available: Optional[str] = Query(None)
):
    """Get all donors with optional filters"""
    try:
        filters = {}
        if blood_type:
            filters["blood_type"] = blood_type
        if city:
            filters["city"] = city
        if available is not None:
            filters["available"] = available == "true"
        
        donors = await Donor.get_all(filters)
        return {"success": True, "data": donors}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/stats")
async def get_donor_stats():
    """Get donor statistics"""
    try:
        stats = await Donor.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/blood-type/{blood_type}")
async def get_donors_by_blood_type(blood_type: str):
    """Get donors by blood type"""
    try:
        donors = await Donor.get_by_blood_type(blood_type)
        return {"success": True, "data": donors}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{donor_id}")
async def get_donor(donor_id: int):
    """Get single donor"""
    try:
        donor = await Donor.get_by_id(donor_id)
        if not donor:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Donor not found"}
            )
        return {"success": True, "data": donor}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.post("/")
async def create_donor(donor: DonorCreate):
    """Create donor"""
    try:
        if not donor.name or not donor.blood_type or not donor.phone or not donor.city:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Name, blood type, phone, and city are required"}
            )
        
        new_donor = await Donor.create(donor.model_dump())
        return {"success": True, "data": new_donor}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{donor_id}")
async def update_donor(donor_id: int, donor: DonorUpdate):
    """Update donor"""
    try:
        existing = await Donor.get_by_id(donor_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Donor not found"}
            )
        
        updated = await Donor.update(donor_id, donor.model_dump(exclude_unset=True))
        return {"success": True, "data": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.delete("/{donor_id}")
async def delete_donor(donor_id: int):
    """Delete donor"""
    try:
        existing = await Donor.get_by_id(donor_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Donor not found"}
            )
        
        await Donor.delete(donor_id)
        return {"success": True, "message": "Donor deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
