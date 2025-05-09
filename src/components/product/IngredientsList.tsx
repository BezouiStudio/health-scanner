import { Card, CardContent } from '@/components/ui/card';

interface IngredientsListProps {
  ingredients: string;
}

export default function IngredientsList({ ingredients }: IngredientsListProps) {
  // Basic formatting: replace common separators with a comma and space for better readability
  const formattedIngredients = ingredients
    .replace(/_/g, ' ') // Remove underscores often found in API data
    .replace(/\[.*?\]/g, '') // Remove content in brackets like [EN], [FR]
    .split(/[,;.]/) // Split by common delimiters
    .map(ingredient => ingredient.trim().toLowerCase())
    .filter(ingredient => ingredient.length > 0)
    .map(ingredient => ingredient.charAt(0).toUpperCase() + ingredient.slice(1)) // Capitalize each ingredient
    .join(', ');

  return (
    <Card className="bg-secondary/30 shadow-inner">
      <CardContent className="p-4">
        <p className="text-sm text-foreground leading-relaxed">
          {formattedIngredients || "No ingredients information available."}
        </p>
      </CardContent>
    </Card>
  );
}
