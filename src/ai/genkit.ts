import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey:
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENAI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        'dummy_key_for_mocking',
    }),
  ],
  model: 'googleai/gemini-2.0-flash', // Upgraded to 2.0 Flash for superior reasoning & vision speed',
});
