import { GoogleGenAI } from "@google/genai";

// Read and trim the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY?.trim();

// Create a configured GoogleGenAI instance.
// If the key is missing/invalid, initialization will still succeed, but runtime calls will fail appropriately.
export const ai = new GoogleGenAI({ apiKey });
