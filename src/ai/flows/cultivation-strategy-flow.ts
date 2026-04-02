// Cultivation Strategy AI Flow - 2-Stage Process
// 1. RECOMMEND: Generate 3 candidate crops with basic stats.
// 2. DETAIL: Generate a full precision strategy for a specific chosen crop.

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Stage 1: Recommendation Schema
 */
export const RecommendationOutputSchema = z.object({
  metrics: z.object({
    projectedYieldIncreasePercent: z.string().describe("Overall potential e.g. +15.5%"),
    estimatedProfitMargin: z.string().describe("Overall potential e.g. 20-25%"),
    wasteReductionPercent: z.string().describe("Overall potential e.g. -12%"),
  }),
  agronomist_summary: z.string().describe("2-4 sentences summarizing recommendation"),
  crop_recommendations: z.array(z.object({
    cropName: z.string(),
    whyThisCrop: z.string(),
    seedCostPerAcre: z.number(),
    fertilizerCostPerAcre: z.number(),
    expectedYieldPerAcre: z.number(),
    marketPriceRange: z.string(),
    expectedGrossIncomePerAcre: z.number(),
    expectedNetProfitPerAcre: z.number(),
    riskLevel: z.enum(['Low', 'Medium', 'High']),
    historicalMarketData: z.array(z.object({
      year: z.string(),
      min_rate: z.string(),
      max_rate: z.string(),
      avg_rate: z.string(),
      min_profit: z.string().describe("Use approx symbol e.g. ≈₹12000"),
      max_profit: z.string().describe("Use approx symbol e.g. ≈₹25000"),
      avg_profit: z.string().describe("Use approx symbol e.g. ≈₹18000"),
    })).length(3).describe("3 previous years data"),
  })).length(3),
});

/**
 * Stage 2: Detailed Strategy Schema (Single Crop)
 */
export const DetailedStrategyOutputSchema = z.object({
  cultivation_calendar: z.array(z.object({
    stage: z.string().describe("e.g. Stage 1 - Land Prep"),
    timing: z.string().describe("Days and GDD timeframe"),
    actions: z.array(z.string()).describe("List of actions"),
  })),
  input_plan: z.object({
    irrigation: z.object({
      method: z.string(),
      frequency: z.string(),
      duration: z.string(),
      criticalStages: z.string(),
      waterSavingTip: z.string(),
    }),
    fertilizerSchedule: z.array(z.object({
      stage: z.string(),
      fertilizer: z.string(),
      quantityPerAcre: z.string(),
      method: z.string(),
      timing: z.string(),
    })),
    manurePlan: z.object({
      fym: z.string(),
      vermicompost: z.string(),
      biofertilizers: z.string(),
    })
  }),
  pest_management: z.array(z.object({
    threatName: z.string(),
    symptoms: z.string(),
    economicThreshold: z.string(),
    chemicalControl: z.string(),
    organicAlternative: z.string(),
    bestSprayTiming: z.string(),
  })),
  economics: z.object({
    itemizedCosts: z.array(z.object({
      item: z.string().describe("e.g. Seeds, Labour"),
      costPerAcre: z.number(),
    })),
    totalInputCost: z.number(),
    expectedRevenue: z.number(),
    netProfit: z.number(),
    roi: z.string().describe("e.g. 150%"),
    notes: z.array(z.string()).describe("MSP, Govt schemes, etc."),
  }),
  action_checklist: z.array(z.object({
    timing: z.string().describe("e.g. This week, Before sowing"),
    action: z.string(),
  })),
});

export type RecommendationOutput = z.infer<typeof RecommendationOutputSchema>;
export type DetailedStrategyOutput = z.infer<typeof DetailedStrategyOutputSchema>;

/**
 * Flow 1: Recommend 3 Crops
 */
export const recommendCropsFlow = ai.defineFlow(
  {
    name: 'recommendCropsFlow',
    inputSchema: z.any(),
    outputSchema: RecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are YieldIQ's Recommendation AI. Rank 3 crops for this farmer based on:
      Location: lat ${input.farm?.location?.lat}, lng ${input.farm?.location?.lng} (${input.farm?.locationName})
      Soil: ${input.farm?.soilType}
      Budget: ₹${input.farm?.workingCapital}
      Irrigation: ${input.farm?.irrigationMethod}
      Size: ${input.farm?.farmSize} acres
      Weather: ETo ${input.weather?.eto} mm/day

      Rank 3 crops by profit × risk × soil suitability. Include 3-year historical market trends for each.
      All currency in ₹.
      `,
      output: { schema: RecommendationOutputSchema },
    });
    if (!output) throw new Error("Recommendation failed.");
    return output;
  }
);

/**
 * Flow 2: Generate Detailed Strategy for Chosen Crop
 */
export const detailedStrategyFlow = ai.defineFlow(
  {
    name: 'detailedStrategyFlow',
    inputSchema: z.object({
       cropName: z.string(),
       farm: z.any(),
       weather: z.any(),
       computed: z.any(),
       waterReport: z.any().optional(),
    }),
    outputSchema: DetailedStrategyOutputSchema,
  },
  async (input) => {
    let promptParts: any[] = [
      { text: `You are YieldIQ's Expert Agronomist. Generate a precise 8-part cultivation strategy specifically for ${input.cropName}.
      
      ## CONTEXT
      - Location: ${input.farm?.locationName}
      - Soil: ${input.farm?.soilType} (Score: ${input.computed?.soilHealthScore}/10)
      - Irrigation: ${input.farm?.irrigationMethod}
      - Weather: ETo ${input.weather?.eto} mm/day, Upcoming Rain ${input.weather?.forecast7dayRain}mm
      
      ## REQUIREMENTS
      1. GDD-based thermal timeline.
      2. Precision input plan (irrigation + fertilizer + manure).
      3. Integrated Pest Management (top 4 threats).
      4. Single-acre P&L economics.
      5. Action checklist for immediate start.
      ` }
    ];

    if (input.waterReport) {
      promptParts.push({ text: 'Incorporate recommendations from this lab report:' });
      promptParts.push({ media: { url: input.waterReport } });
    }

    const { output } = await ai.generate({
      prompt: promptParts,
      output: { schema: DetailedStrategyOutputSchema },
    });
    if (!output) throw new Error("Detailed strategy failed.");
    return output;
  }
);
