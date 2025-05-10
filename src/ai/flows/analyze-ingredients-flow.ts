'use server';
/**
 * @fileOverview Analyzes a list of ingredients to classify them by their potential effects.
 *
 * - analyzeIngredients - A function that analyzes ingredients.
 * - AnalyzeIngredientsInput - The input type for the analyzeIngredients function.
 * - AnalyzeIngredientsOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientAnalysisSchema = z.object({
  ingredientName: z.string().describe('The name of the ingredient being analyzed.'),
  category: z
    .enum(['beneficial', 'neutral', 'caution', 'avoid', 'unknown'])
    .describe(
      "Classification of the ingredient: 'beneficial' (good), 'neutral' (harmless), 'caution' (potential minor issues/allergens), 'avoid' (potentially harmful), 'unknown' (unable to classify)."
    ),
  reasoning: z
    .string()
    .optional()
    .describe('Brief reasoning for the classification, especially for "caution" and "avoid" categories.'),
});

export type IngredientAnalysis = z.infer<typeof IngredientAnalysisSchema>;

const AnalyzeIngredientsInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredient names to analyze.'),
  productContext: z.enum(['food', 'cosmetic', 'unknown']).default('unknown').optional().describe('The context of the product (food or cosmetic) for more accurate ingredient analysis.'),
});

export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const AnalyzeIngredientsOutputSchema = z.object({
  analyzedIngredients: z.array(IngredientAnalysisSchema),
});

export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(
  input: AnalyzeIngredientsInput
): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const analyzeIngredientsPrompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are an expert toxicologist and dermatologist specializing in food and cosmetic ingredient safety and efficacy.
The user will provide a list of ingredients and a product context (e.g., 'food', 'cosmetic').

For each ingredient in the provided list:
1.  Identify the ingredient.
2.  Classify it into one of the following categories based on its typical use in the given productContext:
    *   'beneficial': Generally recognized as safe and offers positive/useful effects for the product type.
    *   'neutral': Generally recognized as safe with no significant positive or negative effects in typical concentrations for the product type.
    *   'caution': May cause irritation, allergic reactions in some individuals, is controversial, or has specific usage warnings for the product type. Not necessarily harmful for everyone but warrants awareness.
    *   'avoid': Known to be potentially harmful, a common strong allergen/irritant, an endocrine disruptor, carcinogen, or has significant concerns regarding its safety or environmental impact within the product type.
    *   'unknown': If you cannot reliably classify the ingredient.
3.  Provide a brief (1-2 sentence) 'reasoning' for your classification, especially for 'caution', 'avoid', and sometimes 'beneficial' if the benefit is notable. For 'neutral' or 'unknown', reasoning can be very short or omitted.

Product Context: {{productContext}}
Ingredients to analyze:
{{#each ingredients}}
- {{{this}}}
{{/each}}

Return your analysis as a JSON object containing a single key "analyzedIngredients", which is an array of objects. Each object in the array should have the following fields: "ingredientName", "category", and "reasoning". Ensure ingredientName matches the input ingredient.
Example for a single ingredient:
{
  "analyzedIngredients": [
    {
      "ingredientName": "Retinol",
      "category": "beneficial",
      "reasoning": "A well-known anti-aging ingredient in cosmetics, promotes cell turnover."
    }
  ]
}
`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async (input: AnalyzeIngredientsInput) => {
    // Filter out very short or placeholder ingredients before sending to AI
    const significantIngredients = input.ingredients.filter(
      (ing) => ing.length > 2 && !/^\s*\(?\s*e\d{3,4}\s*\)?\s*$/i.test(ing) // filter out E-numbers like (E322)
    );

    if (significantIngredients.length === 0) {
        return { analyzedIngredients: [] };
    }
    
    const {output} = await analyzeIngredientsPrompt({ ...input, ingredients: significantIngredients });
    
    if (!output || !output.analyzedIngredients) {
        // Attempt to map original ingredients to unknown if AI fails to return structured output
        return {
            analyzedIngredients: input.ingredients.map(name => ({
                ingredientName: name,
                category: 'unknown' as const,
                reasoning: 'Analysis could not be performed for this ingredient.',
            }))
        };
    }
    
    // Ensure all original ingredients have an entry, even if AI missed some
    const resultIngredients = input.ingredients.map(originalIngredient => {
        const foundAnalysis = output.analyzedIngredients.find(
            (analyzed) => analyzed.ingredientName.toLowerCase() === originalIngredient.toLowerCase()
        );
        if (foundAnalysis) {
            return foundAnalysis;
        }
        return {
            ingredientName: originalIngredient,
            category: 'unknown' as const,
            reasoning: 'This specific ingredient was not detailed in the AI analysis.'
        };
    });

    return { analyzedIngredients: resultIngredients };
  }
);
