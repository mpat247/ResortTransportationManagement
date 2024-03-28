from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from datetime import datetime, timedelta
from typing import List
from bson import ObjectId
from fastapi.encoders import jsonable_encoder

router = APIRouter()

# Assuming your MongoDB client has been set up previously
# and that you have a 'db' variable representing the database

mongo_connection_string = "mongodb+srv://resort:resort@resorttransportationman.ttyo6zl.mongodb.net/ResortTransportationManagement?retryWrites=true&w=majority"

# Connect to MongoDB
client = MongoClient(mongo_connection_string)

# Get the database
db = client["ResortTransportationManagement"]

# Define the collection
guests_collection = db["guests"]

# Guest models
class GuestBase(BaseModel):
    email: EmailStr
    full_name: str
    room_number: int

class GuestCheckIn(GuestBase):
    check_in: datetime = Field(default_factory=datetime.utcnow)

class GuestCheckOut(BaseModel):
    email: EmailStr

class GuestInfo(BaseModel):
    email: EmailStr
    full_name: str
    room_number: int
    check_in: datetime
    check_out: datetime
    transportation_requests: List[str]

# Transportation request model
class TransportationRequest(BaseModel):
    guest_email: EmailStr
    pickup_location: str
    dropoff_location: str
    number_of_passengers: int
    request_time: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"  # Example status values: "pending", "confirmed", "completed", "cancelled"

# API Endpoints for guest management
@router.post("/check-in", response_description="Guest check-in")
def check_in_guest(guest: GuestCheckIn):
    if guests_collection.find_one({"email": guest.email}):
        raise HTTPException(status_code=400, detail="Guest has already checked in.")
    guest_data = guest.dict()
    guests_collection.insert_one(guest_data)
    return {"message": "Guest checked in successfully"}

@router.post("/check-out", response_description="Guest check-out")
def check_out_guest(guest: GuestCheckOut):
    result = guests_collection.find_one_and_update(
        {"email": guest.email, "check_out": None},
        {"$set": {"check_out": datetime.utcnow()}},
        return_document=True
    )
    if result:
        return {"message": "Guest checked out successfully"}
    else:
        raise HTTPException(status_code=404, detail="Guest not found or already checked out")

# Custom encoder function
def custom_jsonable_encoder(obj, by_alias: bool = False, exclude_none: bool = True):
    if isinstance(obj, ObjectId):
        return str(obj)
    return jsonable_encoder(obj, by_alias=by_alias, exclude_none=exclude_none)

# Use this function within your route
@router.get("/info/{email}", response_description="Get guest information")
def get_guest_info(email: EmailStr):
    guest_info = guests_collection.find_one({"email": email})
    if guest_info:
        # Return the document data
        return guest_info
    else:
        raise HTTPException(status_code=404, detail="Guest not found")

# API Endpoints for transportation requests
@router.post("/transportation-request", response_description="Create transportation request")
def create_transportation_request(request: TransportationRequest):
    request_data = request.dict()
    transportation_requests_collection.insert_one(request_data)
    return {"message": "Transportation request created successfully"}

@router.get("/transportation-request/{guest_email}", response_description="Get transportation requests for a guest")
def get_transportation_requests(guest_email: EmailStr):
    requests = transportation_requests_collection.find({"guest_email": guest_email})
    return list(requests)

@router.put("/transportation-request/{request_id}/update-status", response_description="Update transportation request status")
def update_transportation_request_status(request_id: str, status: str):
    result = transportation_requests_collection.find_one_and_update(
        {"_id": request_id},
        {"$set": {"status": status}},
        return_document=True
    )
    if result:
        return {"message": "Transportation request status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Transportation request not found")

# Add more endpoints as needed for reservations and other functionalities

# Make sure to include this router in your FastAPI app instance in main.py.
