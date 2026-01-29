"""
AI Routes for BEOS Enterprise
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from services.ai_service import AIService
from middleware.auth import authorize_roles

router = APIRouter()


@router.get("/predict-demand")
async def predict_demand(days: int = Query(7, ge=1, le=30), _: dict = Depends(authorize_roles("admin", "blood_bank"))):
    """Predict blood demand for coming days"""
    try:
        prediction = await AIService.predict_demand(days)
        return {"success": True, "data": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/expiring")
async def get_expiring(days: int = Query(7, ge=1, le=30), _: dict = Depends(authorize_roles("admin", "blood_bank"))):
    """Get blood batches expiring soon"""
    try:
        expiring = await AIService.get_expiring_blood(days)
        return {"success": True, "data": expiring}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/suggest-transfers")
async def suggest_transfers(_: dict = Depends(authorize_roles("admin"))):
    """Get AI-suggested inventory transfers"""
    try:
        suggestions = await AIService.suggest_transfers()
        return {"success": True, "data": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/smart-match/{request_id}")
async def smart_match(request_id: int, _: dict = Depends(authorize_roles("hospital", "admin"))):
    """Smart match donors for a request"""
    try:
        matches = await AIService.smart_match_donors(request_id)
        return {"success": True, "data": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/insights")
async def get_insights(_: dict = Depends(authorize_roles("admin"))):
    """Get AI-powered dashboard insights"""
    try:
        insights = await AIService.get_insights()
        return {"success": True, "data": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})
