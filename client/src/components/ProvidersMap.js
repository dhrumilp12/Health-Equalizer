import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { TextField, Button, Container, Box, Typography, Alert, Card, CardContent, CardMedia } from '@mui/material';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: -34.397,
  lng: 150.644
};

const ProvidersMap = () => {
  const [location, setLocation] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.error('Google Maps API key is not set in environment variables');
      setError('Google Maps API key is not set in environment variables');
    }if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          position => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          error => {
            console.error('Error getting user location', error);
            setError('Error getting user location. Please ensure location services are enabled.');
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    }, [apiKey]);
  

  const fetchProviders = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(`/providers?location=${lat},${lng}`);
      console.log('Providers:', response.data);
      if (response.data && Array.isArray(response.data)) {
        setProviders(response.data);
        if (response.data.length > 0) {
          setMapCenter({
            lat: response.data[0].geometry.location.lat,
            lng: response.data[0].geometry.location.lng
          });
        } else {
          console.error("No results found.");
        }
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const geocodeLocation = async (locationName) => {
    if (!apiKey) return;
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: locationName,
          key: apiKey
        }
      });
      console.log('Geocode response:', response.data);
      if (response.data && response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return result.geometry.location;
      } else {
        console.error("No geocode results found. Please check the location name and try again.");
        setError("No geocode results found. Please check the location name and try again.");
      }
    } catch (error) {
      console.error('Failed to geocode location:', error.response ? error.response.data : error.message);
      setError('Failed to geocode location. Please try again.');
    }
  };

  const handleLocationChange = (event) => {
    setLocation(event.target.value);
    setError('');
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    if (!location) {
      setError('Please enter a location.');
      return;
    }
    const locationCoords = await geocodeLocation(location);
    if (locationCoords) {
      fetchProviders(locationCoords.lat, locationCoords.lng);
    } else {
      console.error("Failed to get coordinates for the location.");
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    if (userLocation) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: {
            lat: provider.geometry.location.lat,
            lng: provider.geometry.location.lng
          },
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  };
  return (
    <Container maxWidth="md">
      <Box my={4} textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Healthcare Providers Map
        </Typography>
        <form onSubmit={handleLocationSubmit} noValidate autoComplete="off">
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <TextField
              label="Enter location"
              variant="outlined"
              value={location}
              onChange={handleLocationChange}
              style={{ marginRight: '10px', flexGrow: 1 }}
            />
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? 'Loading...' : 'Search'}
            </Button>
          </Box>
        </form>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>
      {apiKey && (
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={10}
          >
            {providers.map(provider => (
              provider.geometry && provider.geometry.location &&
              <Marker
                key={provider.place_id}
                position={{ lat: provider.geometry.location.lat, lng: provider.geometry.location.lng }}
                onClick={() => handleProviderSelect(provider)}
              />
            ))}
            {selectedProvider && (
              <InfoWindow
                position={{
                  lat: selectedProvider.geometry.location.lat,
                  lng: selectedProvider.geometry.location.lng
                }}
                onCloseClick={() => setSelectedProvider(null)}
              >
                <Card style={{ maxWidth: 400 }}>
                  {selectedProvider.photos && selectedProvider.photos.length > 0 && (
                    <CardMedia
                      component="img"
                      alt={selectedProvider.name}
                      height="200"
                      image={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${selectedProvider.photos[0].photo_reference}&key=${apiKey}`}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {selectedProvider.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Address: {selectedProvider.vicinity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Rating: {selectedProvider.rating}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      User Ratings Total: {selectedProvider.user_ratings_total}
                    </Typography>
                    {selectedProvider.opening_hours && selectedProvider.opening_hours.open_now !== undefined && (
                      <Typography variant="body2" color="textSecondary">
                        Open Now: {selectedProvider.opening_hours.open_now ? 'Yes' : 'No'}
                      </Typography>
                    )}
                    {selectedProvider.types && (
                      <Typography variant="body2" color="textSecondary">
                        Types: {selectedProvider.types.join(', ')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </InfoWindow>
            )}
            {directions && (
              <DirectionsRenderer
                directions={directions}
              />
            )}
          </GoogleMap>
        </LoadScript>
      )}
    </Container>
  );
};

export default ProvidersMap;