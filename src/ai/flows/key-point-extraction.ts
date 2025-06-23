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
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  prompt: `You are an expert AI assistant specialized in extracting key information from PDF documents.

You will analyze the PDF document provided and identify the most important sections, facts, and takeaways.

Based on your analysis, you will generate a concise summary of the document and a list of key points.

PDF Document: {{media url=pdfDataUri}}

Summary:
Key Points:`, // Handlebars syntax for data URI
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
