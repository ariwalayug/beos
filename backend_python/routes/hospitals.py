"""
Hospital Routes for BEOS Python Backend
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from models.hospital import Hospital
from middleware.auth import verify_token

router = APIRouter()


class HospitalCreate(BaseModel):
    name: str
    address: str
    city: str
    phone: str
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    emergency_contact: Optional[str] = None


class HospitalUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    emergency_contact: Optional[str] = None


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(verify_token)):
    """Get current hospital profile"""
    try:
        hospital = await Hospital.get_by_user_id(current_user["id"])
        if not hospital:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Hospital profile not found"}
            )
        return {"success": True, "data": hospital}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/")
async def get_hospitals(
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Get all hospitals"""
    try:
        filters = {}
        if city:
            filters["city"] = city
        if search:
            filters["search"] = search
        
        hospitals = await Hospital.get_all(filters)
        return {"success": True, "data": hospitals}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/stats")
async def get_hospital_stats():
    """Get hospital statistics"""
    try:
        stats = await Hospital.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{hospital_id}")
async def get_hospital(hospital_id: int):
    """Get single hospital"""
    try:
        hospital = await Hospital.get_by_id(hospital_id)
        if not hospital:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Hospital not found"}
            )
        return {"success": True, "data": hospital}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.post("/")
async def create_hospital(hospital: HospitalCreate):
    """Create hospital"""
    try:
        if not hospital.name or not hospital.address or not hospital.city or not hospital.phone:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Name, address, city, and phone are required"}
            )
        
        new_hospital = await Hospital.create(hospital.model_dump())
        return {"success": True, "data": new_hospital}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{hospital_id}")
async def update_hospital(hospital_id: int, hospital: HospitalUpdate):
    """Update hospital"""
    try:
        existing = await Hospital.get_by_id(hospital_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Hospital not found"}
            )
        
        updated = await Hospital.update(hospital_id, hospital.model_dump(exclude_unset=True))
        return {"success": True, "data": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.delete("/{hospital_id}")
async def delete_hospital(hospital_id: int):
    """Delete hospital"""
    try:
        existing = await Hospital.get_by_id(hospital_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Hospital not found"}
            )
        
        await Hospital.delete(hospital_id)
        return {"success": True, "message": "Hospital deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
