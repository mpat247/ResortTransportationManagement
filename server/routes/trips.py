from typing import List, Optional
from fastapi import APIRouter, HTTPException, Body
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
import os

router = APIRouter()

# MongoDB connection details
MONGO_DETAILS = "mongodb+srv://resort:resort@resorttransportationman.ttyo6zl.mongodb.net/ResortTransportationManagement?retryWrites=true&w=majority"

# Database client setup
client = AsyncIOMotorClient(MONGO_DETAILS)
db = client.trip_database
trips_collection = db.trips

# Trip model
class Trip(BaseModel):
    destinations: List[dict] = Field(...)
    directions_response: Optional[dict] = None

# Async function to save trip to database
@router.post("/save-trip")
async def save_trip(trip: Trip):
    trip_data = trip.dict()
    new_trip = await trips_collection.insert_one(trip_data)
    created_trip = await trips_collection.find_one({"_id": new_trip.inserted_id})
    return created_trip

# Assuming your existing router and API setup below...
