import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface IngredientsListProps {
  ingredients: string;
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  if (!ingredients || ingredients.trim() === "") {
    return (
      <Card className="bg-secondary/30 shadow-inner">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            No ingredients information available for this product.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Strip HTML and then process
  const cleanedIngredients = stripHtml(ingredients);
  
  const individualIngredients = cleanedIngredients
    .replace(/_/g, ' ') // Remove underscores
    .replace(/\[.*?\]/g, '') // Remove content in brackets like [EN], [FR]
    .split(/[,;.]/) // Split by common delimiters
    .map(ingredient => ingredient.trim().toLowerCase())
    .filter(ingredient => ingredient.length > 0) // Remove empty strings
    .filter(ingredient => !/^\d+%$/.test(ingredient)) // Remove percentage-only items like "20%"
    .map(ingredient => ingredient.charAt(0).toUpperCase() + ingredient.slice(1)); // Capitalize each ingredient

  if (individualIngredients.length === 0) {
    return (
      <Card className="bg-secondary/30 shadow-inner">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Ingredients information could not be parsed or is not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-secondary/30 shadow-inner">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {individualIngredients.map((ingredient, index) => (
            <Badge key={index} variant="secondary" className="text-sm font-normal px-3 py-1 shadow-sm">
              {ingredient}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
