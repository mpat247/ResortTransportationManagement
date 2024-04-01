from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from pymongo import MongoClient
from fastapi.encoders import jsonable_encoder
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

# MongoDB connection string (replace <username>, <password>, and <your-cluster-url> with your details)
mongo_connection_string = "mongodb+srv://resort:resort@resorttransportationman.ttyo6zl.mongodb.net/ResortTransportationManagement?retryWrites=true&w=majority"

# Connect to MongoDB
client = AsyncIOMotorClient(mongo_connection_string)
db = client["ResortTransportationManagement"]
carts_collection = db["carts"]

class Cart(BaseModel):
    capacity: str
    status: str = "available"  # Defaulted to "available"
    current_location: Optional[str] = None

class CartInDB(BaseModel):
    cart_id: int
    capacity: str
    status: str
    current_location: Optional[str]

# Helper function to get the next cart_id
async def get_next_cart_id():
    last_cart = await carts_collection.find_one({}, sort=[("cart_id", -1)])
    if last_cart:
        return last_cart["cart_id"] + 1
    else:
        return 1

@router.post("", response_model=CartInDB, response_description="Add a new cart")
async def add_cart(cart: Cart):
    cart_dict = cart.dict()
    cart_dict["cart_id"] = await get_next_cart_id()
    insert_result = await carts_collection.insert_one(cart_dict)
    created_cart = await carts_collection.find_one({"cart_id": cart_dict["cart_id"]})
    return created_cart

@router.put("/{cart_id}", response_model=CartInDB, response_description="Update an existing cart")
async def update_cart(cart_id: int, cart: Cart):
    cart_dict = cart.dict()
    update_result = await carts_collection.update_one({"cart_id": cart_id}, {"$set": cart_dict})
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Cart with ID {cart_id} not found")
    updated_cart = await carts_collection.find_one({"cart_id": cart_id})
    return updated_cart

@router.get("", response_model=List[CartInDB], response_description="View all carts")
async def view_carts():
    carts_cursor = carts_collection.find()
    carts = await carts_cursor.to_list(length=None)
    return carts
