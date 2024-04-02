from dotenv import load_dotenv
import os
# main.py
from fastapi import FastAPI
from routes.users import router as user_router
from routes.reservations import router as reservation_router
from routes.carts import router as cart_router
#from routes.routing import router as routing_router

from fastapi.middleware.cors import CORSMiddleware


# Load environment variables from .env file
load_dotenv()



app = FastAPI()

# List of origins allowed to make requests to this API
origins = [
    "http://localhost:3000",  # Allow frontend origin
    "http://127.0.0.1:3000",  # Allow frontend origin (alternative)
    "http://localhost",
    "http://localhost:8000",

]

# Add CORSMiddleware to the application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows specified origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(reservation_router, prefix="/reservations", tags=["reservations"])
app.include_router(cart_router, prefix="/carts", tags=["carts"])
#app.include_router(routing_router, prefix="/routing", tags=["routing"])

