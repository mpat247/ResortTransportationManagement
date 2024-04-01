from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from pymongo import MongoClient
from datetime import datetime, timedelta
import jwt
import hashlib
from typing import List, Optional
from bson import ObjectId

router = APIRouter()

# MongoDB connection string (replace <username>, <password>, and <your-cluster-url> with your details)
mongo_connection_string = "mongodb+srv://resort:resort@resorttransportationman.ttyo6zl.mongodb.net/ResortTransportationManagement?retryWrites=true&w=majority"

# Connect to MongoDB
client = MongoClient(mongo_connection_string)
db = client["ResortTransportationManagement"]
users_collection = db["users"]

# JWT Secret and Algorithm
SECRET_KEY = "A_VERY_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2PasswordBearer token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    email: str = Field(..., example="user@example.com")
    password: str = Field(..., example="password")
    role: str = Field(default="guest", example="guest")
    name: Optional[str] = Field(None, example="John Doe")
    ride_history: Optional[List[str]] = Field(default=None, example=[])

class UserInDB(User):
    hashed_password: str

def hash_password(password: str) -> str:
    """Simple hashing function using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = users_collection.find_one({"email": email})
    if not user or hash_password(password) != user.get("hashed_password"):
        return None
    user["_id"] = str(user["_id"])  # Convert ObjectId to string for JSON serializable response
    return user

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_description="User registration")
def register_user(user: User):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    user_dict = user.dict(exclude={"password"})
    user_dict["hashed_password"] = hash_password(user.password)
    user_dict["ride_history"] = []  # Initialize ride_history as an empty list
    users_collection.insert_one(user_dict)
    return {"message": "User registered successfully"}

@router.post("/login", response_description="User login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)  # Use email in form_data.username
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    user_data = dict(user)
    user_data.pop("hashed_password")  # Remove sensitive data
    
    access_token = create_access_token(data={"sub": user_data["email"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user_data": user_data
    }


@router.get("/user/{email}/role", response_description="Get user role")
def get_user_role(email: str):
    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"email": email, "role": user["role"]}
