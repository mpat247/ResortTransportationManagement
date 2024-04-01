from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId


router = APIRouter()

# MongoDB connection string (replace <username>, <password>, and <your-cluster-url> with your details)
mongo_connection_string = "mongodb+srv://resort:resort@resorttransportationman.ttyo6zl.mongodb.net/ResortTransportationManagement?retryWrites=true&w=majority"

# Connect to MongoDB
client = AsyncIOMotorClient(mongo_connection_string)
db = client["ResortTransportationManagement"]
reservations_collection = db["reservations"]

# Models
class Reservation(BaseModel):
    email: EmailStr
    full_name: str
    room_number: int
    check_in_date: datetime
    check_out_date: datetime

class UpdateReservation(BaseModel):
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None

# Models
class Reservation(BaseModel):
    email: EmailStr
    full_name: str
    room_number: int
    check_in_date: datetime
    check_out_date: datetime

class UpdateReservation(BaseModel):
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None

# Helper function to convert ObjectId to string, if needed
def object_id_to_str(item):
    if isinstance(item, ObjectId):
        return str(item)
    return item

# Helper function to generate the next reservation_id
async def generate_next_reservation_id():
    last_reservation = await reservations_collection.find_one(sort=[("reservation_id", -1)])
    if last_reservation is not None and "reservation_id" in last_reservation:
        return last_reservation["reservation_id"] + 1
    else:
        return 1


@router.post("/", response_description="Book a room")
async def book_reservation(reservation: Reservation):
    next_reservation_id = await generate_next_reservation_id()
    reservation_dict = reservation.dict()
    reservation_dict["reservation_id"] = next_reservation_id
    await reservations_collection.insert_one(reservation_dict)
    created_reservation = await reservations_collection.find_one({"reservation_id": next_reservation_id})
    return {k: object_id_to_str(v) for k, v in created_reservation.items()}

@router.get("/{email}", response_description="View all reservations for a guest")
async def view_reservations(email: EmailStr):
    reservations_cursor = reservations_collection.find({"email": email})
    reservations = await reservations_cursor.to_list(length=100)
    return [{k: object_id_to_str(v) for k, v in reservation.items()} for reservation in reservations]

@router.put("/{reservation_id}", response_description="Update an existing reservation")
async def update_reservation(reservation_id: int, update: UpdateReservation):
    update_result = await reservations_collection.update_one({"reservation_id": int(reservation_id)}, {"$set": update.dict(exclude_unset=True)})
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Reservation with reservation_id {reservation_id} not found")
    updated_reservation = await reservations_collection.find_one({"reservation_id": int(reservation_id)})
    return {k: object_id_to_str(v) for k, v in updated_reservation.items()}

@router.delete("/{reservation_id}", response_description="Cancel a reservation")
async def cancel_reservation(reservation_id: int):
    delete_result = await reservations_collection.delete_one({"reservation_id": reservation_id})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Reservation with reservation_id {reservation_id} not found")
    return {"message": "Reservation cancelled successfully"}