
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
// ScoreDisplay is not directly used here anymore but HealthScoreLoader might use it or similar logic
import IngredientsList from './IngredientsList';
import HealthScoreLoader from './HealthScoreLoader'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Tag, Info, AlertCircle } from 'lucide-react';

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

            {product.ingredients && product.name !== 'Unknown Product' ? (
              <div className="mb-6">
                <HealthScoreLoader productName={product.name} ingredients={product.ingredients} />
              </div>
            ) : (
              <Alert variant="default" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Health Score Information</AlertTitle>
                <AlertDescription>
                  Health score cannot be generated because ingredient information or product name is missing or invalid.
                </AlertDescription>
              </Alert>
            )}

            {product.ingredients ? (
              <div className="mb-6">
                {/* Title "Ingredients" is now part of IngredientsList component */}
                <IngredientsList ingredients={product.ingredients} productType={product.productType} />
              </div>
            ) : (
                 <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ingredients Information Missing</AlertTitle>
                    <AlertDescription>
                        We could not find the ingredients list for this product. Detailed health analysis requires ingredient information.
                    </AlertDescription>
                </Alert>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
