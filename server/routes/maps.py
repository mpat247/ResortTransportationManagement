from typing import List, Dict
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

# Replace with your actual Google Maps API key
GOOGLE_MAPS_API_KEY = "AIzaSyBrfEu3XvsCtzycAJTA-CW46nwVDO6fgXs"

async def google_maps_request(url: str, params: dict):
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch data from Google Maps API.")
    return response.json()

@router.get("/route-optimization/")
async def get_optimal_route(origin: str, destination: str) -> Dict:
    """Fetch the optimal route using Google Maps Directions API."""
    url = "https://maps.googleapis.com/maps/api/directions/json"
    params = {"origin": origin, "destination": destination, "key": GOOGLE_MAPS_API_KEY}
    return await google_maps_request(url, params)

@router.get("/distance-time-estimation/")
async def get_distance_and_time(
    origins: List[str] = Query(...), destinations: List[str] = Query(...)
) -> dict:
    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": "|".join(origins),
        "destinations": "|".join(destinations),
        "key": GOOGLE_MAPS_API_KEY
    }
    return await google_maps_request(url, params)

@router.get("/place-details/")
async def get_place_details(place_id: str) -> Dict:
    """Fetch detailed information about a place using Google Maps Places API."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {"place_id": place_id, "key": GOOGLE_MAPS_API_KEY}
    return await google_maps_request(url, params)

@router.get("/geocode/")
async def geocode(address: str) -> Dict:
    """Convert an address into geographic coordinates using Google Maps Geocoding API."""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": address, "key": GOOGLE_MAPS_API_KEY}
    return await google_maps_request(url, params)

@router.get("/reverse-geocode/")
async def reverse_geocode(lat: float, lng: float) -> Dict:
    """Convert geographic coordinates into a readable address using Google Maps Reverse Geocoding API."""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"latlng": f"{lat},{lng}", "key": GOOGLE_MAPS_API_KEY}
    return await google_maps_request(url, params)
