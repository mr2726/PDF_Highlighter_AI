"use server";

import { keyPointExtraction, KeyPointExtractionInput, KeyPointExtractionOutput } from '@/ai/flows/key-point-extraction';

export async function analyzePdf(input: KeyPointExtractionInput): Promise<KeyPointExtractionOutput> {
  try {
    const result = await keyPointExtraction(input);
    return result;
  } catch (error) {
    console.error("AI analysis failed:", error);
    // It's better to throw a generic error message to the client.
    throw new Error("Failed to analyze the PDF with AI. Please try again.");
  }
}
