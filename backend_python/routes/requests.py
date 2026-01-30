"""
Blood Request Routes for BEOS Python Backend
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Request
from pydantic import BaseModel
from typing import Optional
from models.blood_request import BloodRequest
from models.donor import Donor
from services.fraud_detection import FraudDetectionService
from middleware.auth import verify_token, optional_verify_token

router = APIRouter()


class RequestCreate(BaseModel):
    blood_type: str
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    hemoglobin: Optional[float] = None
    platelets: Optional[int] = None
    units: Optional[int] = 1
    component_type: Optional[str] = "Whole Blood"
    urgency: Optional[str] = "normal"
    is_critical: Optional[bool] = False
    diagnosis: Optional[str] = None
    past_reaction: Optional[str] = None
    allergies: Optional[str] = None
    doctor_name: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class RequestUpdate(BaseModel):
    hospital_id: Optional[int] = None
    patient_name: Optional[str] = None
    age: Optional[int] = None
    hemoglobin: Optional[float] = None
    platelets: Optional[int] = None
    blood_type: Optional[str] = None
    units: Optional[int] = None
    urgency: Optional[str] = None
    past_reaction: Optional[str] = None
    status: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None
    gender: Optional[str] = None
    doctor_name: Optional[str] = None
    component_type: Optional[str] = None
    diagnosis: Optional[str] = None
    allergies: Optional[str] = None
    is_critical: Optional[bool] = None
    donor_id: Optional[int] = None


@router.get("/my-history")
async def get_my_history(current_user: dict = Depends(verify_token)):
    """Get donation history for current user"""
    try:
        donor = await Donor.get_by_user_id(current_user["id"])
        if not donor:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Donor profile not found"}
            )
        
        history = await BloodRequest.get_history(donor["id"])
        return {"success": True, "data": history}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/")
async def get_requests(
    status: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    blood_type: Optional[str] = Query(None),
    hospital_id: Optional[int] = Query(None)
):
    """Get all blood requests"""
    try:
        filters = {}
        if status:
            filters["status"] = status
        if urgency:
            filters["urgency"] = urgency
        if blood_type:
            filters["blood_type"] = blood_type
        if hospital_id:
            filters["hospital_id"] = hospital_id
        
        requests = await BloodRequest.get_all(filters)
        return {"success": True, "data": requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/stats")
async def get_stats():
    """Get request statistics"""
    try:
        stats = await BloodRequest.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/pending")
async def get_pending():
    """Get pending requests"""
    try:
        requests = await BloodRequest.get_pending()
        return {"success": True, "data": requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/critical")
async def get_critical():
    """Get critical requests"""
    try:
        requests = await BloodRequest.get_critical()
        return {"success": True, "data": requests}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{request_id}")
async def get_request(request_id: int):
    """Get single request"""
    try:
        request = await BloodRequest.get_by_id(request_id)
        if not request:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Request not found"}
            )
        return {"success": True, "data": request}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/{request_id}/matches")
async def get_matches(request_id: int):
    """Get matching donors for a request"""
    try:
        request = await BloodRequest.get_by_id(request_id)
        if not request:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "error": "Request not found"}
            )
        
        matches = await Donor.get_by_blood_type(request["blood_type"])
        return {"success": True, "data": matches}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.post("/")
async def create_request(
    request_data: RequestCreate,
    http_request: Request,
    current_user: Optional[dict] = Depends(optional_verify_token)
):
    """Create blood request"""
    try:
        if not request_data.blood_type:
            raise HTTPException(
                status_code=400,
                detail={"success": False, "error": "Blood type is required"}
            )
        
        data = request_data.model_dump()
        
        # Set hospital_id if user is a hospital
        if current_user and current_user.get("role") == "hospital":
            data["hospital_id"] = current_user.get("hospital_id")
        
        new_request = await BloodRequest.create(data)
        
        # Emit socket events if available
        sio = getattr(http_request.app.state, 'sio', None)
        if sio:
            await sio.emit('new-request', new_request)
            if new_request.get("urgency") == "critical":
                await sio.emit('critical-alert', new_request)
        
        return {"success": True, "data": new_request}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{request_id}")
async def update_request(
    request_id: int,
    request_data: RequestUpdate,
    http_request: Request,
    _: dict = Depends(verify_token)
):
    """Update blood request"""
    try:
        updated = await BloodRequest.update(request_id, request_data.model_dump(exclude_unset=True))
        
        # Emit socket event
        sio = getattr(http_request.app.state, 'sio', None)
        if sio:
            await sio.emit('request-updated', updated)
        
        return {"success": True, "data": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{request_id}/fulfill")
async def fulfill_request(
    request_id: int,
    http_request: Request,
    current_user: dict = Depends(verify_token)
):
    """Fulfill blood request"""
    try:
        donor_id = None
        if current_user.get("role") in ["donor", "user"]:
            donor = await Donor.get_by_user_id(current_user["id"])
            if donor:
                donor_id = donor["id"]
                
                # Bio-Safety AI Check
                # In production, we would get real-time coordinates from the mobile app
                # For demo, we simulate a check with static coordinates
                is_risky, reason = await FraudDetectionService.check_fraud_risk(
                    donor_id, 
                    28.6139, 77.2090, # Mock Delhi coordinates
                    None
                )
                
                if is_risky:
                    raise HTTPException(
                        status_code=403, 
                        detail={"success": False, "error": f"Security Block: {reason}"}
                    )
        
        updated = await BloodRequest.fulfill(request_id, donor_id)
        
        # Emit socket events
        sio = getattr(http_request.app.state, 'sio', None)
        if sio:
            await sio.emit('request-fulfilled', updated)
            await sio.emit('request-updated', updated)
        
        return {"success": True, "data": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.put("/{request_id}/cancel")
async def cancel_request(
    request_id: int,
    http_request: Request,
    _: dict = Depends(verify_token)
):
    """Cancel blood request"""
    try:
        updated = await BloodRequest.cancel(request_id)
        
        # Emit socket event
        sio = getattr(http_request.app.state, 'sio', None)
        if sio:
            await sio.emit('request-updated', updated)
        
        return {"success": True, "data": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.delete("/{request_id}")
async def delete_request(request_id: int, _: dict = Depends(verify_token)):
    """Delete blood request"""
    try:
        await BloodRequest.delete(request_id)
        return {"success": True, "message": "Request deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
