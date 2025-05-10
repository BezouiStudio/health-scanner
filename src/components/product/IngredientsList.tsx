'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, X } from 'lucide-react';

interface IngredientsListProps {
  ingredients: string;
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Fallback for server-side rendering or environments where DOMParser is not available
    // This is a very basic stripper, more robust server-side stripping might be needed if complex HTML is common
    return html.replace(/<[^>]*>?/gm, '');
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

// Function to identify potential allergens or highlighted terms
function getIngredientHighlight(ingredient: string): { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon?: React.ReactNode } {
  const lowerIngredient = ingredient.toLowerCase();
  // Example: highlight common allergens or beneficial ingredients
  if (lowerIngredient.includes('paraben') || lowerIngredient.includes('sulfate') || lowerIngredient.includes('phthalate')) {
    return { variant: 'destructive', icon: <X className="h-3 w-3 mr-1" /> };
  }
  if (lowerIngredient.includes('shea butter') || lowerIngredient.includes('glycerin') || lowerIngredient.includes('vitamin e')) {
    return { variant: 'default', icon: <Check className="h-3 w-3 mr-1" /> };
  }
  return { variant: 'secondary' };
}


export default function IngredientsList({ ingredients }: IngredientsListProps) {
  if (!ingredients || ingredients.trim() === "") {
    return (
      <Card className="bg-muted/30 shadow-inner border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            No ingredients information available for this product.
          </p>        
        </CardContent>
      </Card>
    );
  }

  // Strip HTML and then process
  const cleanedIngredientsText = stripHtml(ingredients);
  
  const individualIngredients = cleanedIngredientsText
    .replace(/_/g, ' ') // Remove underscores
    .replace(/\s*\[[^\]]*\]\s*/g, '') // Remove content in brackets like [EN], [FR] and surrounding spaces
    .split(/[,;](?!\s*\d)|\.$/) // Split by comma, semicolon (not followed by a digit for percentages), or period at the end
    .map(ingredient => ingredient.trim().replace(/\.$/, '').trim()) // Trim, remove trailing period, trim again
    .filter(ingredient => ingredient.length > 1) // Remove very short/empty strings
    .filter(ingredient => !/^\d+(\.\d+)?\s*%$/.test(ingredient)) // Remove percentage-only items like "20%" or "0.5 %"
    .map(ingredient => {
        // Capitalize each word in the ingredient, handle hyphens
        return ingredient
            .toLowerCase()
            .split(/(\s|-)/) // Split by space or hyphen, keeping delimiter
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    })
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  if (individualIngredients.length === 0) {
    return (
      <Card className="bg-muted/30 shadow-inner border-dashed">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Ingredients information could not be parsed or is not available in a recognizable format.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-md border border-border/50 rounded-lg">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Key Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {individualIngredients.map((ingredient, index) => {
            const highlight = getIngredientHighlight(ingredient);
            return (
              <Badge 
                key={index} 
                variant={highlight.variant} 
                className="text-xs sm:text-sm font-medium px-3 py-1.5 shadow-sm rounded-full flex items-center transition-all hover:scale-105"
              >
                {highlight.icon}
                {ingredient}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
