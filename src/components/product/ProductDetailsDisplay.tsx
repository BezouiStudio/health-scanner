
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
// ScoreDisplay is not directly used here anymore but HealthScoreLoader might use it or similar logic
import IngredientsList from './IngredientsList';
import HealthScoreLoader from './HealthScoreLoader'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Tag, Info, AlertCircle, ShoppingBasket } from 'lucide-react';

interface ProductDetailsDisplayProps {
  product: Product;
}

export default function ProductDetailsDisplay({ product }: ProductDetailsDisplayProps) {
  const isCosmetic = product.productType === 'cosmetic';
  const noScoreReason = 
    product.name === 'Unknown Product' ? 'the product name is missing or invalid.' :
    !product.ingredients ? 'ingredient information is missing.' :
    'ingredient information or product name is missing or invalid.';

  const cosmeticSpecificMessage = isCosmetic 
    ? `Health score for this cosmetic product cannot be generated. This often means detailed ingredient information or a specific product name is not available in the Open Beauty Facts database for barcode ${product.barcode}.`
    : `Health score cannot be generated because ${noScoreReason}`;

  return (
    <Card className="overflow-hidden shadow-xl rounded-lg">
      <CardContent className="p-0 md:p-6 lg:p-8">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start">
          <div className="md:col-span-1 bg-muted rounded-lg overflow-hidden shadow-md">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={500}
                height={500}
                className="object-contain w-full aspect-square transition-transform duration-300 hover:scale-105"
                data-ai-hint="product package"
                priority // Prioritize loading of the main product image
              />
            ) : (
              <div className="aspect-square flex items-center justify-center bg-secondary rounded-lg p-4">
                <ShoppingBasket className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/70" />
              </div>
            )}
          </div>

          <div className="md:col-span-2 p-4 md:p-0">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 text-primary-foreground bg-gradient-to-r from-primary to-primary/80 p-3 sm:p-4 rounded-md shadow-lg">
              {product.name}
            </CardTitle>
            
            {product.brands && (
              <p className="text-lg text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">Brand:</span> {product.brands}
              </p>
            )}
            {product.categories && (
              <p className="text-md text-muted-foreground mb-6 flex items-center flex-wrap">
                <Tag className="w-4 h-4 mr-2 text-primary shrink-0" />
                <span className="font-semibold text-foreground mr-1">Categories:</span> 
                {product.categories.split(',').map(c => c.trim()).join(', ')}
              </p>
            )}

            {product.ingredients && product.name !== 'Unknown Product' ? (
              <div className="mb-6">
                <HealthScoreLoader productName={product.name} ingredients={product.ingredients} />
              </div>
            ) : (
              <Alert variant="default" className="mb-6 shadow-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Health Score Information</AlertTitle>
                <AlertDescription>
                  {cosmeticSpecificMessage}
                </AlertDescription>
              </Alert>
            )}

            {product.ingredients ? (
              <div className="mb-6">
                <IngredientsList ingredients={product.ingredients} productType={product.productType} />
              </div>
            ) : (
                 <Alert variant="default" className="shadow-sm">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Ingredients Information Missing</AlertTitle>
                    <AlertDescription>
                        We could not find the ingredients list for this product. Detailed health analysis requires ingredient information.
                        {isCosmetic && ` For cosmetic items, this data may not yet be in the Open Beauty Facts database for barcode ${product.barcode}.`}
                    </AlertDescription>
                </Alert>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
