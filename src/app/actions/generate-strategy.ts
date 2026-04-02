'use server';

import { recommendCropsFlow, detailedStrategyFlow } from '@/ai/flows/cultivation-strategy-flow';
import { getWeatherData } from '@/lib/weather';

/**
 * Stage 1: Get 3 crop recommendations
 */
export async function generateCultivationRecommendations(formData: any) {
  const locName = formData.locationName || 'Nagpur, Maharashtra';
  let lat = 21.1458;
  let lng = 79.0882;
  
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locName)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    if (geoData.results && geoData.results.length > 0) {
      lat = geoData.results[0].latitude;
      lng = geoData.results[0].longitude;
    }
  } catch(e) {
    console.warn("Geocoding failed", e);
  }

  const farm = {
    name: `${locName} Farm`,
    location: { lat, lng }, 
    locationName: locName,
    soilType: formData.soilType || 'Loam',
    irrigationMethod: formData.irrigationMethod || 'Rainfed',
    landTenure: formData.landTenure || 'Owned',
    farmSize: parseFloat(formData.farmSize) || 5.0,
    previousCrop: formData.previousCrop || 'Unknown',
    workingCapital: parseFloat(formData.workingCapital) || 50000,
    creditAccess: formData.creditAccess || 'No',
  };

  const weather = await getWeatherData(lat, lng);

  const recommendations = await recommendCropsFlow({
    farm,
    weather,
  });

  return { recommendations, farm, weather };
}

/**
 * Stage 2: Get detailed strategy for a specific crop
 */
export async function generateDetailedCropStrategy(cropName: string, farm: any, weather: any, labReport?: string) {
  const strategy = await detailedStrategyFlow({
    cropName,
    farm,
    weather,
    computed: { soilHealthScore: 8.5 },
    waterReport: labReport || null,
  });

  return { strategy };
}
