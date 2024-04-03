import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl';

function Mapping() {
    // Initial viewport settings for Canada
    const [viewport, setViewport] = useState({
        longitude: -106.3468,
        latitude: 56.1304,
        zoom: 3,
        width: "600px",
        height: "400px",
        transitionDuration: 1000 // Smooth transition for 1000 milliseconds
    });

    useEffect(() => {
        // Sequence of viewport updates to zoom into Ontario and then Toronto
        const timeoutId1 = setTimeout(() => {
            setViewport(prevState => ({
                ...prevState,
                longitude: -85.3232, // Ontario's Longitude
                latitude: 51.2538, // Ontario's Latitude
                zoom: 6, // Closer zoom for a province view
                transitionDuration: 2000 // Smooth transition for 2000 milliseconds
            }));
        }, 3000); // Delay this transition by 3 seconds

        const timeoutId2 = setTimeout(() => {
            setViewport(prevState => ({
                ...prevState,
                longitude: -79.3832, // Toronto's Longitude
                latitude: 43.6532, // Toronto's Latitude
                zoom: 10, // Detailed zoom for a city view
                transitionDuration: 2000 // Smooth transition for 2000 milliseconds
            }));
        }, 6000); // Delay this transition by 6 seconds, following the first transition

        // Clean up timeouts if the component unmounts before the timeouts trigger
        return () => {
            clearTimeout(timeoutId1);
            clearTimeout(timeoutId2);
        };
    }, []); // Empty dependency array ensures this effect runs only once after initial render

    return (
        <Map
            {...viewport}
            mapLib={import('mapbox-gl')}
            mapStyle="mapbox://styles/mapbox/streets-v9"
            onViewportChange={nextViewport => setViewport(nextViewport)}
        />
    );
}

export default Mapping;
