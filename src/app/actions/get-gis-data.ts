'use server';
/**
 * @fileOverview GIS data server action for YieldIQ.
 * Geocodes farm location text → coordinates, and fetches live weather.
 */

import { getWeatherData, WeatherData } from '@/lib/weather';

export interface GisCoordinates {
  lat: number;
  lng: number;
  displayName?: string;
}

export interface GisData {
  coordinates: GisCoordinates;
  weather: WeatherData | null;
}

// Default coordinates: Bathinda, Punjab (matches generate-insights.ts default)
const DEFAULT_COORDS: GisCoordinates = {
  lat: 30.2110,
  lng: 74.9455,
  displayName: 'Bathinda, Punjab',
};

/**
 * Geocodes a location text string to lat/lng using Nominatim (OpenStreetMap).
 * Falls back to Bathinda, Punjab if geocoding fails.
 */
export async function geocodeLocation(locationText: string): Promise<GisCoordinates> {
  if (!locationText?.trim()) return DEFAULT_COORDS;

  try {
    const query = encodeURIComponent(`${locationText.trim()}, India`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=in`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'YieldIQ-AgriPlatform/1.0 (farming advisory app)',
        'Accept-Language': 'en',
      },
      next: { revalidate: 86400 }, // Cache geocoding result for 24h
    });

    if (!res.ok) return DEFAULT_COORDS;

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name?.split(',').slice(0, 3).join(',') || locationText,
      };
    }
  } catch (err) {
    console.error('[YieldIQ GIS] Geocoding failed:', err);
  }

  return { ...DEFAULT_COORDS, displayName: locationText };
}

/**
 * Main GIS data fetcher: geocodes location + fetches live weather.
 * Used by the GIS map page.
 */
export async function getGisData(locationText: string): Promise<GisData> {
  const coordinates = await geocodeLocation(locationText);
  const weather = await getWeatherData(coordinates.lat, coordinates.lng);
  return { coordinates, weather };
}
