import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_ROUTES_API_URL = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const GEOCODE_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// For Traffic Api, remember to enable "Routes API" in Google Cloud Console as well as set api restrictions to server IP
const API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

/**
 * Calls the Google Routes API to get the duration and staticDuration between origin and destination
 * @param origin [latitude, longitude]
 * @param destination [latitude, longitude]
 * @returns { duration: number; staticDuration: number } in seconds
 * @throws Error if the API call fails or returns invalid data
 */
export async function getRouteDuration(
  origin: [number, number],
  destination: [number, number],
): Promise<{ duration: number; staticDuration: number }> {
  const routeRequest = {
    origin: {
      location: {
        latLng: {
          latitude: origin[0],
          longitude: origin[1],
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination[0],
          longitude: destination[1],
        },
      },
    },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE',
    // departureTime: new Date().toISOString(),
    departureTime: new Date(Date.now() + 60_000).toISOString(),
  };

  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': API_KEY,
    'X-Goog-FieldMask': 'routes.duration,routes.staticDuration',
  };

  console.log('-------------------------------');
  console.log('Calculating route duration from', origin, 'to', destination);
  console.log('-------------------------------');

  const response = await fetch(GOOGLE_ROUTES_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(routeRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Routes API failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    routes?: Array<{
      duration?: string;
      staticDuration?: string;
    }>;
  };
  const route = data.routes?.[0];

  if (!route || !route.duration || !route.staticDuration) {
    throw new Error('No valid route or duration returned');
  }

  return {
    duration: parseInt(route.duration),
    staticDuration: parseInt(route.staticDuration),
  };
}

/**
 * Calls the Google Geocoding API to get a human-readable address for given latitude and longitude
 * @param [lat, lng] [latitude, longitude]
 * @returns string address
 * @throws Error if the API call fails or returns invalid data
 */
export async function getLocationName([lat, lng]: [number, number]): Promise<string> {
  const response = await fetch(`${GEOCODE_API_URL}?latlng=${lat},${lng}&key=${API_KEY}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Geocoding API failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as { results?: Array<{ formatted_address?: string }> };
  const name = data.results?.[0]?.formatted_address;
  if (!name) throw new Error('No place name found');

  return name;
}
