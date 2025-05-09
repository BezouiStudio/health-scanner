import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScoreDisplay from './ScoreDisplay';
import IngredientsList from './IngredientsList';
import { Package, Tag, Info } from 'lucide-react';

interface ProductDetailsDisplayProps {
  product: Product;
}

export default function ProductDetailsDisplay({ product }: ProductDetailsDisplayProps) {
  return (
    <Card className="overflow-hidden shadow-xl rounded-lg">
      <CardContent className="p-0 md:p-6">
        <div className="grid md:grid-cols-3 gap-6 md:gap-10 items-start">
          <div className="md:col-span-1 bg-muted rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={400}
                className="object-contain w-full aspect-square"
                data-ai-hint="product package"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center bg-secondary rounded-lg">
                <Package className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="md:col-span-2 p-6 md:p-0">
            <CardTitle className="text-3xl md:text-4xl font-bold mb-2 text-primary-foreground bg-primary p-3 rounded-md shadow">
              {product.name}
            </CardTitle>
            
            {product.brands && (
              <p className="text-lg text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">Brand:</span> {product.brands}
              </p>
            )}
            {product.categories && (
              <p className="text-md text-muted-foreground mb-6 flex items-center">
                <Tag className="w-4 h-4 mr-2 text-primary" />
                <span className="font-semibold text-foreground">Categories:</span> {product.categories.split(',').map(c => c.trim()).join(', ')}
              </p>
            )}

            {product.healthScore !== undefined && (
              <div className="mb-6 p-4 border rounded-lg bg-secondary/50">
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-accent" />
                  Health Score & Analysis
                </h2>
                <ScoreDisplay 
                  score={product.healthScore} 
                  explanation={product.scoreExplanation} 
                />
              </div>
            )}
             {!product.healthScore && product.ingredients && (
                <Alert variant="default" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Health Score Pending</AlertTitle>
                    <AlertDescription>
                        The health score for this product is currently being processed or could not be generated.
                    </AlertDescription>
                </Alert>
            )}


            {product.ingredients && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
                <IngredientsList ingredients={product.ingredients} />
              </div>
            )}

            {!product.ingredients && (
                 <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ingredients Information Missing</AlertTitle>
                    <AlertDescription>
                        We could not find the ingredients list for this product. Health score analysis requires ingredient information.
                    </AlertDescription>
                </Alert>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
