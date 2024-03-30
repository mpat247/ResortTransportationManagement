from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pymongo import MongoClient
from datetime import datetime
from typing import List, Optional

router = APIRouter()

# MongoDB connection setup
mongo_connection_string = "mongodb+srv://resort:resort@resorttransportationman.ttyo6zl.mongodb.net/ResortTransportationManagement?retryWrites=true&w=majority"
client = MongoClient(mongo_connection_string)
db = client["ResortTransportationManagement"]
guests_collection = db["guests"]

# Models
class GuestBase(BaseModel):
    email: EmailStr
    full_name: str
    room_number: int

class GuestCheckIn(GuestBase):
    check_in: datetime = Field(default_factory=datetime.utcnow)

class GuestCheckOut(BaseModel):
    email: EmailStr

class Reservation(BaseModel):
    email: EmailStr
    room_number: int
    start_date: datetime
    end_date: datetime

class GuestInfo(BaseModel):
    email: EmailStr
    full_name: str
    room_number: int
    check_in: datetime
    check_out: Optional[datetime] = None
    reservations: List[Reservation]

# Guest check-in
@router.post("/check-in", response_description="Guest check-in")
async def check_in_guest(guest: GuestCheckIn):
    existing_guest = guests_collection.find_one({"email": guest.email})
    if existing_guest:
        raise HTTPException(status_code=400, detail="Guest has already checked in.")
    guest_data = guest.dict()
    guests_collection.insert_one(guest_data)
    return {"message": "Guest checked in successfully"}

# Guest check-out
@router.post("/check-out", response_description="Guest check-out")
async def check_out_guest(guest: GuestCheckOut):
    result = guests_collection.find_one_and_update(
        {"email": guest.email},
        {"$set": {"check_out": datetime.utcnow()}},
        return_document=True
    )
    if result:
        return {"message": "Guest checked out successfully"}
    else:
        raise HTTPException(status_code=404, detail="Guest not found")

# Make a new reservation
@router.post("/reservations", response_description="Make a new reservation")
def make_reservation(reservation: Reservation):
    guests_collection.update_one(
        {"email": reservation.email},
        {"$push": {"reservations": reservation.dict()}},
        upsert=True
    )
    return {"message": "Reservation made successfully"}

# Get guest reservation info
@router.get("/reservations/{email}", response_description="Get guest reservation info")
async def get_reservation_info(email: EmailStr):
    guest_info = guests_collection.find_one({"email": email}, {"_id": 0, "reservations": 1})
    if guest_info and "reservations" in guest_info:
        return guest_info["reservations"]
    else:
        raise HTTPException(status_code=404, detail="No reservations found for this guest")
