import { localLanguageAssistant } from './src/ai/flows/local-language-assistant';

async function run() {
  try {
    const res = await localLanguageAssistant({ query: "Hello" });
    console.log("SUCCESS:", res);
  } catch (err: any) {
    console.error("ERROR:");
    console.error(err);
    console.error(err.message);
  }
}

run();
