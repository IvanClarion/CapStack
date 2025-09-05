import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API } from '@env';

if (!GEMINI_API) {
  console.warn('GEMINI_API is missing. Check your .env and Babel config, then restart Metro.');
}

export const gemini = new GoogleGenerativeAI(GEMINI_API);
