import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import axios from 'axios';
import './RouteOptimization.css';

const libraries = ["places"];
const center = { lat: 43.657683, lng: -79.377551 }; // Example center, George Vari Engineering Building, Toronto

const mapContainerStyle = {
  height: '100%', // Adjusted for full height within its container
  width: '100%' // Adjusted for full width within its container
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const RouteOptimization = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBrfEu3XvsCtzycAJTA-CW46nwVDO6fgXs", // Replace with your actual Google Maps API key
    libraries,
  });

  const [destinations, setDestinations] = useState([{ address: '', ref: React.createRef() }]);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [savedTrips, setSavedTrips] = useState([]);

  useEffect(() => {
    if (isLoaded && destinations.some(dest => dest.address)) {
      calculateRoute();
    }
  }, [destinations, isLoaded]);

  const calculateRoute = useCallback(async () => {
    if (destinations.length < 2) return;

    const origin = destinations[0].address;
    const destination = destinations[destinations.length - 1].address;
    const waypoints = destinations.slice(1, -1).map(dest => ({ location: dest.address, stopover: true }));

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin,
      destination,
      waypoints,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirectionsResponse(result);
      } else {
        console.error(`error fetching directions ${result}`);
      }
    });
  }, [destinations]);

  const addDestination = () => {
    setDestinations([...destinations, { address: '', ref: React.createRef() }]);
  };

  const updateDestination = (index, value) => {
    const updatedDestinations = destinations.map((dest, i) => i === index ? { ...dest, address: value } : dest);
    setDestinations(updatedDestinations);
  };

  const removeDestination = (index) => {
    const updatedDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(updatedDestinations);
  };

  // A function to deep clone objects while avoiding circular references
  function deepCloneAndClean(obj, cache = new WeakSet()) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (cache.has(obj)) {
      return; // Circular reference found, stop cloning
    }
    const result = Array.isArray(obj) ? [] : {};
    cache.add(obj);
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      // Omit problematic keys or clone others
      if (typeof value !== 'function' && key !== '__e3_') {
        result[key] = deepCloneAndClean(value, cache);
      }
    }
    return result;
  }

  const saveTripToDatabase = async () => {
    const cleanDirectionsResponse = deepCloneAndClean(directionsResponse);
    try {
      const response = await axios.post('http://localhost:8000/save-trip', {
        destinations,
        directionsResponse: cleanDirectionsResponse,
      });
      console.log('Trip saved:', response.data);
    } catch (error) {
      console.error('Failed to save trip:', error);
    }
  };

  const startTrip = () => {
    saveTripToDatabase(); // Save the trip data to the database
    setSavedTrips([...savedTrips, { destinations, directionsResponse }]);
    setDestinations([{ address: '', ref: React.createRef() }]);
    setDirectionsResponse(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-md-3 passenger-selection-panel">
          <h2>Saved Trips</h2>
          <ul className="saved-trips-list">
            {savedTrips.map((trip, index) => (
              <li key={index}>
                Trip {index + 1}: {trip.destinations.map(dest => dest.address).join(', ')}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-6 map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
            options={options}
          >
            {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
          </GoogleMap>
        </div>
        <div className="col-md-3 route-details-panel">
          <h2>Trip Details</h2>
          {destinations.map((destination, index) => (
            <div key={index} className="destination-input-container">
              <Autocomplete
                onLoad={autocomplete => destination.ref.current = autocomplete}
                onPlaceChanged={() => updateDestination(index, destination.ref.current.getPlace().formatted_address)}
              >
                <input
                  type="text"
                  placeholder={`Enter ${index === 0 ? 'origin' : index === destinations.length - 1 ? 'destination' : 'waypoint'}`}
                  value={destination.address}
                  onChange={(event) => updateDestination(index, event.target.value)}
                  className="form-control"
                />
              </Autocomplete>
              {index > 0 && (
                <button onClick={() => removeDestination(index)} className="btn btn-danger mt-2">Remove</button>
              )}
            </div>
          ))}
          <button onClick={addDestination} className="btn btn-primary">Add Destination</button>
          <button onClick={calculateRoute} className="btn btn-success">Calculate Route</button>
          <button onClick={startTrip} disabled={!directionsResponse} className="btn btn-info">Start Trip</button>
          {directionsResponse && (
            <div className="route-info mt-3">
              <p>Distance: {directionsResponse.routes[0].legs.map(leg => leg.distance.text).join(' + ')}</p>
              <p>Duration: {directionsResponse.routes[0].legs.map(leg => leg.duration.text).join(' + ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteOptimization;
