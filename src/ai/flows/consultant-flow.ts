import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * Output schema for the Consultant.
 * Includes natural language response for the chat UI,
 * plus structured actions if the AI decides to schedule a spray or irrigation.
 */
export const ConsultantOutputSchema = z.object({
  message: z.string().describe("Natural language response to the user's query"),
  diagnosis: z.object({
    isDiseaseFound: z.boolean(),
    diseaseName: z.string().optional(),
    confidenceScore: z.number().optional().describe("0-100"),
    severity: z.enum(['Low', 'Medium', 'High']).optional(),
  }).optional(),
  actionPlan: z.array(z.object({
    type: z.enum(['SPRAY', 'IRRIGATION', 'FERTILIZER', 'HARVEST', 'OTHER']),
    title: z.string(),
    description: z.string(),
    date: z.string().describe("ISO date or descriptive, e.g. 'Tomorrow', 'In 3 days'"),
    productName: z.string().optional().describe("If recommending a specific product from marketplace"),
  })).optional(),
});

export const consultantFlow = ai.defineFlow(
  {
    name: 'consultantFlow',
    inputSchema: z.object({
       chatHistory: z.array(z.object({
          role: z.enum(['user', 'model']),
          content: z.string(),
       })).optional(),
       userMessage: z.string(),
       imageUrls: z.array(z.string()).optional(), // Base64 data URLs for multimodal
       
       // Context
       plotContext: z.object({
         cropType: z.string(),
         soilType: z.string(),
         currentStage: z.string(),
         daysElapsed: z.number(),
         location: z.string(),
       }).optional(),
       weatherContext: z.object({
         temp: z.string(),
         condition: z.string(),
       }).optional(),
    }),
    outputSchema: ConsultantOutputSchema,
  },
  async (input) => {
    let promptParts: any[] = [];
    
    // 1. System Persona
    promptParts.push({ text: `You are the YieldIQ AI Agronomist Consultant for a specific farm plot. 
Your job is to provide conversational, precise, and actionable advice.

## PLOT CONTEXT
- Crop: ${input.plotContext?.cropType || 'Unknown'} (Day ${input.plotContext?.daysElapsed || 0}, ${input.plotContext?.currentStage || 'Unknown Stage'})
- Soil: ${input.plotContext?.soilType || 'Unknown'}
- Location: ${input.plotContext?.location || 'Unknown'}
- Expected Weather: ${input.weatherContext?.temp || 'Typical'}, ${input.weatherContext?.condition || 'Clear'}

## INSTRUCTIONS
1. If the user uploads an image, analyze it for diseases, nutrient deficiencies, or pests.
2. If a problem is identified, include a 'diagnosis' block.
3. If an action is required (e.g., spraying fungicide), include an 'actionPlan' array. Recommend specific products (e.g., 'Mancozeb 75% WP') so the user can be directed to the marketplace.
4. Keep the 'message' friendly, professional, and concise. Do NOT format the message as JSON.`});

    // 2. Chat History (Flattened for now, as genkit prompt structure prefers explicit history blocks, but injecting as context here is reliable)
    if (input.chatHistory && input.chatHistory.length > 0) {
       promptParts.push({ text: `\n## RECENT CHAT HISTORY:`});
       input.chatHistory.forEach(msg => {
          promptParts.push({ text: `[${msg.role === 'user' ? 'Farmer' : 'You'}]: ${msg.content}`});
       });
    }

    // 3. Current Inputs (Images & Text)
    promptParts.push({ text: `\n## NEW MESSAGE FROM FARMER:`});
    promptParts.push({ text: input.userMessage });
    
    if (input.imageUrls && input.imageUrls.length > 0) {
      promptParts.push({ text: `\n[FARMER HAS ATTACHED IMAGES FOR ANALYSIS]` });
      input.imageUrls.forEach(url => {
         promptParts.push({ media: { url } });
      });
    }

    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.0-flash', // Upgraded for state-of-the-art vision & response speed
        prompt: promptParts,
        output: { schema: ConsultantOutputSchema },
      });
      
      if (!output) throw new Error("Consultant failed to generate response.");
      return output;
    } catch (e: any) {
      console.error("consultantFlow Error:", e);
      throw new Error("AI Processing Failed: " + e.message);
    }
  }
);
