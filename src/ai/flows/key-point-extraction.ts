'use server';

/**
 * @fileOverview An AI agent that identifies and extracts key points from a PDF document.
 *
 * - keyPointExtraction - A function that handles the key point extraction process.
 * - KeyPointExtractionInput - The input type for the keyPointExtraction function.
 * - KeyPointExtractionOutput - The return type for the keyPointExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const KeyPointExtractionInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document to analyze.'),
});
export type KeyPointExtractionInput = z.infer<typeof KeyPointExtractionInputSchema>;

const KeyPointExtractionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF document.'),
  keyPoints: z
    .array(z.string())
    .describe('An array of key points extracted from the PDF document.'),
});
export type KeyPointExtractionOutput = z.infer<typeof KeyPointExtractionOutputSchema>;

export async function keyPointExtraction(input: KeyPointExtractionInput): Promise<KeyPointExtractionOutput> {
  return keyPointExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'keyPointExtractionPrompt',
  input: {schema: KeyPointExtractionInputSchema},
  output: {schema: KeyPointExtractionOutputSchema},
  prompt: `You are an expert AI assistant specialized in extracting key information from documents.

You will analyze the document text provided and identify the most important sections, facts, and takeaways.

Based on your analysis, you will generate a concise summary of the document and a list of key points.

Document Text:
---
{{{documentText}}}
---

Your response should include a summary and a list of key points.`,
});

const keyPointExtractionFlow = ai.defineFlow(
  {
    name: 'keyPointExtractionFlow',
    inputSchema: KeyPointExtractionInputSchema,
    outputSchema: KeyPointExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
