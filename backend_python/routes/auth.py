"""
Authentication Routes for BEOS Python Backend
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from models.user import User
from models.donor import Donor
from models.hospital import Hospital
from models.blood_bank import BloodBank
from middleware.auth import verify_token, create_access_token

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str
    name: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    emergency_contact: Optional[str] = None
    operating_hours: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
async def register(request: RegisterRequest):
    """Register a new user"""
    try:
        if request.role not in ["user", "hospital", "blood_bank"]:
            raise HTTPException(status_code=400, detail={"success": False, "error": "Invalid role"})
        
        # Create User
        user = await User.create(
            email=request.email,
            password=request.password,
            role=request.role
        )
        
        # Create Profile based on role
        profile = None
        profile_data = {
            "user_id": user["id"],
            "email": request.email,
            "name": request.name,
            "phone": request.phone,
            "city": request.city,
            "address": request.address,
        }
        
        if request.role == "user":
            # User role maps to Donor profile
            profile_data["blood_type"] = request.blood_type
            profile = await Donor.create(profile_data)
        elif request.role == "hospital":
            profile_data["latitude"] = request.latitude
            profile_data["longitude"] = request.longitude
            profile_data["emergency_contact"] = request.emergency_contact
            profile = await Hospital.create(profile_data)
        elif request.role == "blood_bank":
            profile_data["latitude"] = request.latitude
            profile_data["longitude"] = request.longitude
            profile_data["operating_hours"] = request.operating_hours
            profile = await BloodBank.create(profile_data)
        
        # Create token
        token = create_access_token({
            "id": user["id"],
            "email": user["email"],
            "role": user["role"]
        })
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "profileId": profile["id"] if profile else None
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"success": False, "error": str(e)})
    except Exception as e:
        raise HTTPException(status_code=400, detail={"success": False, "error": str(e)})


@router.post("/login")
async def login(request: LoginRequest):
    """Login user"""
    try:
        user = await User.find_by_email(request.email)
        
        if not user or not User.verify_password(request.password, user["password_hash"]):
            raise HTTPException(
                status_code=401,
                detail={"success": False, "error": "Invalid credentials"}
            )
        
        token = create_access_token({
            "id": user["id"],
            "email": user["email"],
            "role": user["role"]
        })
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "role": user["role"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail={"success": False, "error": str(e)})


@router.get("/me")
async def get_current_user(current_user: dict = Depends(verify_token)):
    """Get current user"""
    user = await User.find_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail={"success": False, "error": "User not found"})
    
    return {"success": True, "user": user}
