'use server';
/**
 * @fileOverview Advanced Genkit flow for generating scientifically-backed farming advisory.
 * 
 * - personalizedFarmingAdvisory - Server action to generate the advisory report.
 * - AdvisoryOutput - The output type for the advisory.
 * - AdvisoryInput - The input type for the advisory flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdvisoryOutputSchema = z.object({
  predictedYieldSummary: z.object({
    display: z.string(),
    changeText: z.string().optional(),
    subtitle: z.string(),
  }),
  waterNeedsSummary: z.object({
    level: z.enum(['Low', 'Medium', 'High']),
    nextIrrigationText: z.string(),
    subtitle: z.string(),
  }),
  soilHealthSummary: z.object({
    score: z.number(),
    label: z.string(),
    subtitle: z.string(),
  }),
  riskSummary: z.object({
    level: z.enum(['Low', 'Moderate', 'High', 'Critical']),
    primaryRisk: z.string(),
    subtitle: z.string(),
  }),
  waterQualityScore: z.object({
    score: z.number(),
    label: z.string(),
    subtitle: z.string(),
  }),
  smartTasks: z.array(z.object({
    title: z.string(),
    priority: z.enum(['High', 'Medium', 'Low', 'Observation']),
    category: z.enum(['Fertilizer', 'Irrigation', 'Pest', 'Harvest', 'Soil', 'Water Quality']),
    dueInDays: z.number(),
    rationale: z.string(),
  })),
  detailedReport: z.object({
    waterQualityAnalysis: z.string(),
    irrigationRecommendations: z.string(),
    fertilizerRecommendations: z.string(),
    soilManagementTips: z.string(),
    yieldOptimizationTips: z.array(z.string()),
    seasonalAlerts: z.string().optional(),
  }),
  language: z.string(),
  disclaimer: z.string().default('YieldIQ provides data-driven suggestions based on IS-10500 standards. Always consult a local agricultural extension officer for critical decisions.'),
});

export type AdvisoryOutput = z.infer<typeof AdvisoryOutputSchema>;
export type PersonalizedFarmingAdvisoryOutput = AdvisoryOutput;

const AdvisoryInputSchema = z.object({
  farm: z.any(),
  computed: z.any(),
  weather: z.any(),
  waterReport: z.any().optional(),
  preferredLanguage: z.string().default('en'),
});

export type AdvisoryInput = z.infer<typeof AdvisoryInputSchema>;

const farmingAdvisoryFlow = ai.defineFlow(
  {
    name: 'farmingAdvisoryFlow',
    inputSchema: AdvisoryInputSchema,
    outputSchema: AdvisoryOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Role: Senior Agronomist AI. You are providing a comprehensive, personalized precision agriculture advisory report.
      
      Inputs:
      - Farm Profile: ${JSON.stringify(input.farm)}
      - Computed Agronomy Parameters: ${JSON.stringify(input.computed)}
      - Current Weather & Forecast: ${JSON.stringify(input.weather)}
      - Lab Report (Water/Soil): ${input.waterReport ? JSON.stringify(input.waterReport) : 'Not Provided'}

      Task: Based strictly on IS-10500 standards and localized agricultural science for the declared region, generate a precision farming advisory report.
      Ensure your "smartTasks" are highly actionable and prioritize critical risks (e.g., incoming storms or skewed pH levels).
      Write the response in the preferred language: ${input.preferredLanguage}
      `,
      output: { schema: AdvisoryOutputSchema },
    });

    if (!output) {
      throw new Error("Failed to generate personalized advisory report.");
    }
    
    return output;
  }
);

/**
 * Server action wrapper for the farming advisory flow.
 */
export async function personalizedFarmingAdvisory(input: AdvisoryInput): Promise<AdvisoryOutput> {
  return farmingAdvisoryFlow(input);
}
