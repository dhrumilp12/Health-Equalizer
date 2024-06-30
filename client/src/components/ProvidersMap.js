import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { FormControl, Select, MenuItem ,TextField, Button, Container, Box, Typography, Alert, Card, CardContent, CardMedia , Chip, Stack, Divider } from '@mui/material';
import { Rating } from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DriveEtaIcon from '@mui/icons-material/DriveEta';  // Icon for Driving
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';  // Icon for Walking
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';  // Icon for Bicycling
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';  // Icon for Transit

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
  const [travelMode, setTravelMode] = useState('DRIVING');
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
          travelMode: window.google.maps.TravelMode[travelMode]
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
            
  <FormControl variant="outlined" sx={{ width: 230, marginRight:1.5 }}>
    <Select
      value={travelMode}
      onChange={(e) => setTravelMode(e.target.value)}
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
      renderValue={(selected) => {
        if (selected === 'DRIVING') {
          return <Box sx={{ display: 'flex', alignItems: 'center' }}><DriveEtaIcon sx={{ mr: 1 }} /> Driving</Box>;
        } else if (selected === 'WALKING') {
          return <Box sx={{ display: 'flex', alignItems: 'center' }}><DirectionsWalkIcon sx={{ mr: 1 }} /> Walking</Box>;
        } else if (selected === 'BICYCLING') {
          return <Box sx={{ display: 'flex', alignItems: 'center' }}><DirectionsBikeIcon sx={{ mr: 1 }} /> Bicycling</Box>;
        } else if (selected === 'TRANSIT') {
          return <Box sx={{ display: 'flex', alignItems: 'center' }}><DirectionsTransitIcon sx={{ mr: 1 }} /> Transit</Box>;
        }
        return <Box sx={{ display: 'flex', alignItems: 'center' }}><DriveEtaIcon sx={{ mr: 1 }} /> Select Mode</Box>;
      }}
    >
      <MenuItem value="DRIVING"><DriveEtaIcon sx={{ mr: 1 }} />Driving</MenuItem>
      <MenuItem value="WALKING"><DirectionsWalkIcon sx={{ mr: 1 }} />Walking</MenuItem>
      <MenuItem value="BICYCLING"><DirectionsBikeIcon sx={{ mr: 1 }} />Bicycling</MenuItem>
      <MenuItem value="TRANSIT"><DirectionsTransitIcon sx={{ mr: 1 }} />Transit</MenuItem>
    </Select>
  </FormControl>

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
                  <Typography gutterBottom variant="h5" component="div" style={{ color: '#1976d2' }}>
                  {selectedProvider.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p" style={{ fontSize: '0.875rem', margin: '5px 0' }}>
                  Address: {selectedProvider.vicinity}
                </Typography>
                {selectedProvider.phone_number && (
                  <Typography variant="body2" color="textSecondary" component="p" style={{ fontWeight: 'bold' }}>
                    Phone: <span style={{ fontWeight: 'normal' }}>{selectedProvider.phone_number}</span>
                  </Typography>
                )}
                <Divider style={{ margin: '10px 0' }} />
                <Typography variant="body2" color="textSecondary" component="p" style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                Rating:<Rating value={selectedProvider.rating} precision={0.5} readOnly size="small" />
                <span style={{ marginLeft: 8 }}>{selectedProvider.rating}</span>
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p" style={{ fontWeight: 'bold' }}>
                Reviews: <span style={{ fontWeight: 'normal' }}>{selectedProvider.user_ratings_total} <RateReviewIcon style={{ color: '#1976d2' }} /></span> 
              </Typography>

                    {selectedProvider.opening_hours && (
                      <Chip
                        label={selectedProvider.opening_hours.open_now ? 'Open Now' : 'Closed'}
                        color={selectedProvider.opening_hours.open_now ? 'success' : 'error'}
                        style={{ marginTop: '5px' }}
                      />
                    )}
                    <Stack direction="row" spacing={1} style={{ marginTop: '10px' }}>
                      {selectedProvider.types.map((type, index) => (
                        <Chip key={index} label={type} variant="outlined" />
                      ))}
                    </Stack>
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