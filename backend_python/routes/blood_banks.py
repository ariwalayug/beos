"""
Blood Bank Routes for BEOS Python Backend
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from models.blood_bank import BloodBank
from middleware.auth import verify_token

router = APIRouter()


class BloodBankCreate(BaseModel):
    name: str
    address: str
    city: str
    phone: str
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None


class BloodBankUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None


class InventoryUpdate(BaseModel):
    blood_type: str
    units: int


class BatchCreate(BaseModel):
    blood_type: str
    units: int
    expiry_date: str


class BatchUpdate(BaseModel):
    units: Optional[int] = None
    expiry_date: Optional[str] = None


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(verify_token)):
    """Get current blood bank profile"""
    try:
        bank = await BloodBank.get_by_user_id(current_user["id"])
        if not bank:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood Bank profile not found"}
            )
        return {"success": True, "data": bank}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/inventory/batches")
async def get_my_batches(current_user: dict = Depends(verify_token)):
    """Get batches for logged-in blood bank"""
    try:
        bank = await BloodBank.get_by_user_id(current_user["id"])
        if not bank:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood Bank profile not found"}
            )
        batches = await BloodBank.get_batches(bank["id"])
        return {"success": True, "data": batches}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.post("/inventory/batches")
async def add_batch(batch: BatchCreate, current_user: dict = Depends(verify_token)):
    """Add new batch"""
    try:
        bank = await BloodBank.get_by_user_id(current_user["id"])
        if not bank:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood Bank profile not found"}
            )
        
        if not batch.blood_type or not batch.units or not batch.expiry_date:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Missing required fields"}
            )
        
        new_batch = await BloodBank.add_batch(bank["id"], batch.blood_type, batch.units, batch.expiry_date)
        return {"success": True, "data": new_batch}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/inventory/batches/{batch_id}")
async def update_batch(batch_id: int, batch: BatchUpdate, _: dict = Depends(verify_token)):
    """Update batch"""
    try:
        updated = await BloodBank.update_batch(batch_id, batch.units, batch.expiry_date)
        return {"success": True, "data": updated}
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"success": False, "error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.delete("/inventory/batches/{batch_id}")
async def delete_batch(batch_id: int, _: dict = Depends(verify_token)):
    """Delete batch"""
    try:
        await BloodBank.delete_batch(batch_id)
        return {"success": True, "message": "Batch deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/")
async def get_blood_banks(
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    inventory: Optional[str] = Query(None)
):
    """Get all blood banks with optional filters"""
    try:
        with_inventory = inventory == "true"
        if with_inventory:
            banks = await BloodBank.get_with_inventory()
        else:
            filters = {}
            if city:
                filters["city"] = city
            if search:
                filters["search"] = search
            banks = await BloodBank.get_all(filters)
        
        return {"success": True, "data": banks}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/inventory/total")
async def get_total_inventory():
    """Get total blood inventory across all banks"""
    try:
        inventory = await BloodBank.get_total_inventory()
        return {"success": True, "data": inventory}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/search/{blood_type}")
async def find_by_blood_type(blood_type: str, minUnits: int = Query(1)):
    """Find blood banks with specific blood type available"""
    try:
        banks = await BloodBank.find_by_blood_type(blood_type, minUnits)
        return {"success": True, "data": banks}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{bank_id}")
async def get_blood_bank(bank_id: int):
    """Get single blood bank with inventory"""
    try:
        bank = await BloodBank.get_by_id(bank_id)
        if not bank:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood bank not found"}
            )
        return {"success": True, "data": bank}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.post("/")
async def create_blood_bank(bank: BloodBankCreate):
    """Create blood bank"""
    try:
        if not bank.name or not bank.address or not bank.city or not bank.phone:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Name, address, city, and phone are required"}
            )
        
        new_bank = await BloodBank.create(bank.model_dump())
        return {"success": True, "data": new_bank}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{bank_id}")
async def update_blood_bank(bank_id: int, bank: BloodBankUpdate):
    """Update blood bank"""
    try:
        existing = await BloodBank.get_by_id(bank_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood bank not found"}
            )
        
        updated = await BloodBank.update(bank_id, bank.model_dump(exclude_unset=True))
        return {"success": True, "data": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{bank_id}/inventory")
async def update_inventory(bank_id: int, data: InventoryUpdate):
    """Update inventory for a blood bank"""
    try:
        if not data.blood_type or data.units is None:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Blood type and units are required"}
            )
        
        bank = await BloodBank.get_by_id(bank_id)
        if not bank:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood bank not found"}
            )
        
        inventory = await BloodBank.update_inventory(bank_id, data.blood_type, data.units)
        return {"success": True, "data": inventory}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.delete("/{bank_id}")
async def delete_blood_bank(bank_id: int):
    """Delete blood bank"""
    try:
        existing = await BloodBank.get_by_id(bank_id)
        if not existing:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Blood bank not found"}
            )
        
        await BloodBank.delete(bank_id)
        return {"success": True, "message": "Blood bank deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
