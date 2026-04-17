import 'dotenv/config';
import { localLanguageAssistant } from './src/ai/flows/local-language-assistant';

async function run() {
  try {
    console.log("Testing with GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ Found" : "❌ Missing");
    const res = await localLanguageAssistant({ query: "How much water does wheat need?" });
    console.log("SUCCESS:", res);
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
}

run();
