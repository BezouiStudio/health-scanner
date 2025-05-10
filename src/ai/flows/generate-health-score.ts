
'use server';

/**
 * @fileOverview Generates a health score for a product based on its ingredients.
 *
 * - generateHealthScore - A function that generates the health score for a product.
 * - GenerateHealthScoreInput - The input type for the generateHealthScore function.
 * - GenerateHealthScoreOutput - The return type for the generateHealthScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHealthScoreInputSchema = z.object({
  ingredients: z
    .string()
    .describe('The list of ingredients for the product.'),
  productName: z.string().describe('The name of the product.'),
});

export type GenerateHealthScoreInput = z.infer<typeof GenerateHealthScoreInputSchema>;

const GenerateHealthScoreOutputSchema = z.object({
  healthScore: z
    .number()
    .describe('The health score of the product, from 1 (unhealthy/potentially harmful) to 10 (very healthy/safe).'),
  explanation: z.string().optional().describe('Explanation and justification of the health score.'),
});

export type GenerateHealthScoreOutput = z.infer<typeof GenerateHealthScoreOutputSchema>;

export async function generateHealthScore(input: GenerateHealthScoreInput): Promise<GenerateHealthScoreOutput> {
  return generateHealthScoreFlow(input);
}

const generateHealthScorePrompt = ai.definePrompt({
  name: 'generateHealthScorePrompt',
  input: {schema: GenerateHealthScoreInputSchema},
  output: {schema: GenerateHealthScoreOutputSchema},
  prompt: `You are an AI assistant specialized in determining the health and safety score of food and cosmetic products based on their ingredients.

  Analyze the ingredients provided for the product: {{productName}}.
  Ingredients: {{{ingredients}}}

  Based on the ingredient list, assign a health/safety score from 1 to 10, where 1 is very unhealthy/potentially harmful and 10 is very healthy/safe.
  For food products, consider nutritional value, presence of harmful additives, and overall impact on health.
  For cosmetic products, consider the presence of allergens, irritants, harmful chemicals (e.g., parabens, phthalates, sulfates), endocrine disruptors, and also the presence of beneficial ingredients. Evaluate based on typical use and potential for skin absorption or inhalation.

  Also, determine whether you need to justify the health score. If the score requires further explanation, provide a detailed explanation of the score.
  For very high scores (9-10) with clearly beneficial and safe ingredients, a brief justification or no justification is acceptable. For lower scores or products with controversial ingredients, a more detailed explanation is necessary.
  Output your result in JSON format.
  `,
});

const generateHealthScoreFlow = ai.defineFlow(
  {
    name: 'generateHealthScoreFlow',
    inputSchema: GenerateHealthScoreInputSchema,
    outputSchema: GenerateHealthScoreOutputSchema,
  },
  async input => {
    const {output} = await generateHealthScorePrompt(input);
    return output!;
  }
);

