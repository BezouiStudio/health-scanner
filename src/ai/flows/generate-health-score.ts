
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
  productType: z.enum(['food', 'cosmetic', 'unknown']).default('unknown').optional().describe('The type of product (food or cosmetic) to tailor the scoring.'),
});

export type GenerateHealthScoreInput = z.infer<typeof GenerateHealthScoreInputSchema>;

const GenerateHealthScoreOutputSchema = z.object({
  healthScore: z
    .number()
    .min(1).max(10)
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
  prompt: `You are an AI assistant specialized in determining the health and safety score of products based on their ingredients and type.

  Analyze the ingredients provided for the product: "{{productName}}".
  Product Type: {{productType | default('unknown')}}
  Ingredients: {{{ingredients}}}

  Based on the ingredient list AND the product type, assign a health/safety score from 1 to 10, where 1 is very unhealthy/potentially harmful and 10 is very healthy/safe.

  Scoring Guidelines:
  - If Product Type is 'food':
    Consider nutritional value (macro/micro nutrients), presence of beneficial ingredients (fiber, vitamins), harmful additives (artificial sweeteners, colors, preservatives like nitrates), high levels of sugar, sodium, unhealthy fats, processing level, and overall impact on health. Whole, unprocessed foods generally score higher.
  - If Product Type is 'cosmetic':
    Consider the presence of known allergens, irritants (e.g., harsh sulfates, certain fragrances, alcohols if high on the list), harmful chemicals (e.g., parabens, phthalates, formaldehyde-releasers), endocrine disruptors. Also consider beneficial ingredients (e.g., antioxidants, hyaluronic acid, ceramides, peptides) if present and relevant to product function. Evaluate based on typical use (e.g., rinse-off vs. leave-on) and potential for skin absorption or inhalation. "Clean" beauty and hypoallergenic products often score higher.
  - If Product Type is 'unknown':
    Make a best guess based on the ingredients. If ingredients strongly suggest one type (e.g., "Aqua, Sodium Laureth Sulfate..." likely cosmetic; "Flour, Sugar, Eggs..." likely food), score accordingly. If truly ambiguous, be more conservative with the score and state the ambiguity in the explanation.

  Provide an explanation for your score.
  For very high scores (9-10) with clearly beneficial and safe ingredients, a brief justification is acceptable.
  For lower scores (1-5) or products with controversial/problematic ingredients, a more detailed explanation is necessary, highlighting the key factors influencing the low score.
  For mid-range scores (6-8), explain the balance of positive and negative aspects.

  Output your result in JSON format. Ensure the healthScore is an integer between 1 and 10.
  Example for a cosmetic:
  {
    "healthScore": 3,
    "explanation": "This face cream scores low due to the presence of multiple parabens (potential endocrine disruptors) and artificial fragrance, which can be irritating for sensitive skin. It also contains mineral oil, which can be comedogenic for some."
  }
  Example for a food:
  {
    "healthScore": 8,
    "explanation": "This yogurt is a good source of protein and probiotics. It contains natural fruit and no artificial sweeteners, though it has a moderate amount of added sugar from fruit puree."
  }
  `,
});

const generateHealthScoreFlow = ai.defineFlow(
  {
    name: 'generateHealthScoreFlow',
    inputSchema: GenerateHealthScoreInputSchema,
    outputSchema: GenerateHealthScoreOutputSchema,
  },
  async (input: GenerateHealthScoreInput) => {
    if (!input.ingredients || input.ingredients.trim().length < 5) { // Basic check for valid ingredients
        return { 
            healthScore: 1, 
            explanation: "Cannot generate a score due to missing or insufficient ingredient information. A minimum list of ingredients is required." 
        };
    }
    const {output} = await generateHealthScorePrompt(input);
    
    if (!output || typeof output.healthScore !== 'number') {
        return { 
            healthScore: 1, // Default to a low score if AI fails
            explanation: "AI analysis failed to produce a valid score. This might be due to unusual ingredients or a temporary system issue." 
        };
    }
    // Ensure score is within bounds
    const score = Math.max(1, Math.min(10, Math.round(output.healthScore)));
    return { ...output, healthScore: score };
  }
);

