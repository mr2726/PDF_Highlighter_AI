"use server";

import { keyPointExtraction, KeyPointExtractionInput, KeyPointExtractionOutput } from '@/ai/flows/key-point-extraction';

export async function analyzePdf(input: KeyPointExtractionInput): Promise<KeyPointExtractionOutput> {
  try {
    const result = await keyPointExtraction(input);
    return result;
  } catch (error) {
    console.error("AI analysis failed:", error);
    // Re-throw the original error message for better debugging on the client.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    // Fallback for non-Error objects
    throw new Error("An unknown error occurred during AI analysis.");
  }
}
