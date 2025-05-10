'use server';
/**
 * @fileOverview Generates alternative product suggestions.
 *
 * - generateAlternatives - A function that suggests alternative products.
 * - GenerateAlternativesInput - The input type for the generateAlternatives function.
 * - GenerateAlternativesOutput - The return type for the generateAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlternativeProductSchema = z.object({
  name: z.string().describe('The name of the suggested alternative product.'),
  reason: z.string().optional().describe('A brief reason why this product is a good alternative.'),
});

export type AlternativeProduct = z.infer<typeof AlternativeProductSchema>;

const GenerateAlternativesInputSchema = z.object({
  productName: z.string().describe('The name of the current product for which alternatives are sought.'),
  productCategories: z.string().optional().describe('The categories of the current product (e.g., "soda", "face cream").'),
  productIngredients: z.string().optional().describe('The list of ingredients of the current product.'),
  productType: z.enum(['food', 'cosmetic', 'unknown']).describe('The type of the current product.'),
  currentHealthScore: z.number().describe('The health score of the current product (1-10).'),
  reasonForAlternative: z.string().optional().describe('Specific reason for seeking an alternative, e.g., "low health score", "contains allergens". Defaults to "low health score".'),
});

export type GenerateAlternativesInput = z.infer<typeof GenerateAlternativesInputSchema>;

const GenerateAlternativesOutputSchema = z.object({
  alternatives: z.array(AlternativeProductSchema).describe('A list of 3-5 suggested alternative products.'),
});

export type GenerateAlternativesOutput = z.infer<typeof GenerateAlternativesOutputSchema>;

export async function generateAlternatives(
  input: GenerateAlternativesInput
): Promise<GenerateAlternativesOutput> {
  return generateAlternativesFlow(input);
}

const generateAlternativesPrompt = ai.definePrompt({
  name: 'generateAlternativesPrompt',
  input: {schema: GenerateAlternativesInputSchema},
  output: {schema: GenerateAlternativesOutputSchema},
  prompt: `You are a helpful AI assistant that suggests alternative products based on health and safety considerations.
The user has a product named "{{productName}}" (Type: {{productType}}) which has a health score of {{currentHealthScore}} out of 10 (where 1 is poor, 10 is excellent).
The user is looking for alternatives, primarily because of: {{#if reasonForAlternative}}{{{reasonForAlternative}}}{{else}}its low health score{{/if}}.
Product Categories: {{#if productCategories}}"{{productCategories}}"{{else}}Not specified{{/if}}.
{{#if productIngredients}}
Product Ingredients: {{{productIngredients}}}
{{/if}}

Please suggest 3 to 4 alternative products that are generally considered to be healthier or safer.
- If it's a 'food' product, focus on alternatives with better nutritional profiles, fewer processed ingredients, or less sugar/sodium/unhealthy fats.
- If it's a 'cosmetic' product, focus on alternatives with cleaner ingredient lists, fewer common irritants/allergens, or those suitable for sensitive skin (if applicable based on the reason).
- For 'unknown' product types, try to infer the best approach or provide general advice if too ambiguous.

For each alternative, provide:
1. 'name': The specific name of the alternative product (e.g., "Organic Apple Slices", "Gentle Skin Cleanser by Brand X"). Be specific but suggest generally available types of products or common brands.
2. 'reason': A brief (1-sentence) explanation of why it's a better alternative in the context of the original product's issue.

Do not suggest products that are extremely niche, very expensive, or hard to find for the average consumer.
Prioritize suggestions that directly address the likely reasons for the original product's low score or the user's stated concern.
If the original product information is too vague to make specific suggestions, provide more general advice on what to look for in an alternative.

Return your suggestions as a JSON object with an "alternatives" array.
Example:
{
  "alternatives": [
    {
      "name": "Filtered Water with Lemon",
      "reason": "A refreshing, sugar-free alternative to sugary sodas, promoting hydration."
    },
    {
      "name": "Unsweetened Iced Green Tea",
      "reason": "Provides antioxidants and hydration without added sugars or artificial sweeteners."
    }
  ]
}
`,
});

const generateAlternativesFlow = ai.defineFlow(
  {
    name: 'generateAlternativesFlow',
    inputSchema: GenerateAlternativesInputSchema,
    outputSchema: GenerateAlternativesOutputSchema,
  },
  async (input) => {
    // If productName is generic or missing, it's hard to give good alternatives.
    if (!input.productName || input.productName === "Unknown Product" || input.productName.trim().length < 3) {
        return { alternatives: [{ name: "General Advice", reason: "Please provide a specific product name for tailored alternatives. Look for products with simpler ingredient lists and recognizable components."}] };
    }
    const {output} = await generateAlternativesPrompt(input);
    if (!output || !output.alternatives || output.alternatives.length === 0) {
        return { alternatives: [{ name: "Suggestion Engine", reason: "Could not generate specific alternatives at this time. Try looking for products with higher nutritional ratings (for food) or simpler, hypoallergenic formulas (for cosmetics)." }] };
    }
    return output;
  }
);

