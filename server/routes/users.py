from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from pymongo import MongoClient
from datetime import datetime, timedelta
import jwt
import hashlib
from typing import Optional

router = APIRouter()

# MongoDB connection string
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
    username: str = Field(..., example="user1")
    email: str = Field(..., example="user@example.com")
    password: str = Field(..., example="password")
    role: str = Field(default="guest", example="user")
    full_name: Optional[str] = Field(None, example="John Doe")
    contact_number: Optional[str] = Field(None, example="1234567890")

class UserInDB(User):
    hashed_password: str

def hash_password(password: str):
    """Simple hashing function using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()

def authenticate_user(username: str, password: str):
    user = users_collection.find_one({"username": username})
    if not user or hash_password(password) != user["hashed_password"]:
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_description="User registration")
def register_user(user: User):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    user_dict = user.dict(exclude={"password"})
    user_dict["hashed_password"] = hash_password(user.password)
    users_collection.insert_one(user_dict)
    return {"message": "User registered successfully"}

@router.post("/login", response_description="User login")
async def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout", response_description="User logout")
async def logout_user():
    # Implement logout functionality as needed
    return {"message": "User logged out successfully"}

@router.get("/user/{username}/role", response_description="Get user role")
def get_user_role(username: str):
    user = users_collection.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"username": username, "role": user["role"]}
