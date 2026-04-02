/**
 * @fileOverview Orchestration action for the full YieldIQ scientific pipeline.
 */
'use server';

import { parseWaterReport } from '@/ai/flows/parse-water-report-flow';
import { computeAgronomyScores } from '@/lib/agronomy/compute-scores';
import { personalizedFarmingAdvisory } from '@/ai/flows/personalized-farming-advisory-flow';
import { getWeatherData } from '@/lib/weather';

export async function generateInsights(userId: string, plotData?: any, photoDataUri?: string) {
  // Use passed plot profile or fallback
  let farm: any = {
    name: plotData?.name || 'YieldIQ Default Profile',
    location: { lat: 30.2110, lng: 74.9455 }, // Default coordinates
    soilType: plotData?.soilType || 'black cotton',
    cropType: plotData?.cropType || 'wheat',
    growthStage: plotData?.growthStage || 'mid',
    irrigationMethod: plotData?.irrigationMethod || 'drip',
    waterReport: null
  };

  // 2. Parse Report if provided
  let waterReport = null;
  if (photoDataUri) {
    waterReport = await parseWaterReport({ photoDataUri });
    farm.waterReport = waterReport;
  }

  // 3. Fetch weather using real farm coordinates
  const lat = farm.location.lat; 
  const lng = farm.location.lng;
  const weather = await getWeatherData(lat, lng);

  // 4. Compute agronomy scores (deterministic)
  const computed = computeAgronomyScores({
    ...waterReport,
    soilType: farm.soilType,
    cropType: farm.cropType,
    growthStage: farm.growthStage,
    irrigationMethod: farm.irrigationMethod,
    previousSeasonYield: farm.previousSeasonYield,
    eto_mmPerDay: weather?.eto,
    dailyRainfall_mm: weather?.currentRainfall,
    forecast7dayRain_mm: weather?.forecast7dayRain,
    currentTempC: weather?.currentTemp,
    forecastMaxTemp7day: weather?.forecastMaxTemp,
  });

  // 5. Generate AI advisory
  const advisory = await personalizedFarmingAdvisory({
    farm,
    computed,
    weather,
    waterReport,
    preferredLanguage: farm.preferredLanguage || 'en'
  });

  return { computed, advisory };
}
