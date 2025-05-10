
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import IngredientsList from './IngredientsList';
import HealthScoreLoader from './HealthScoreLoader'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Tag, Info, AlertCircle, ShoppingBasket, ListChecks, ShieldQuestion, Microscope } from 'lucide-react';
import { Separator } from '../ui/separator';

interface ProductDetailsDisplayProps {
  product: Product;
}

export default function ProductDetailsDisplay({ product }: ProductDetailsDisplayProps) {
  const isCosmetic = product.productType === 'cosmetic';
  const noScoreReason = 
    product.name === 'Unknown Product' || !product.name ? 'the product name is missing or invalid.' :
    !product.ingredients ? 'ingredient information is missing.' :
    'ingredient information or product name is missing or invalid.';

  const cosmeticSpecificMessage = isCosmetic 
    ? `Health score for this cosmetic product cannot be generated. This often means detailed ingredient information or a specific product name is not available in the Open Beauty Facts database for barcode ${product.barcode}.`
    : `Health score cannot be generated because ${noScoreReason}`;

  return (
    <div className="bg-card shadow-2xl rounded-xl overflow-hidden border border-border/60">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Image and Basic Info */}
          <div className="md:col-span-4 lg:col-span-4 space-y-6">
            <div className="bg-muted/50 rounded-lg overflow-hidden shadow-md aspect-square flex items-center justify-center p-2">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name || 'Product image'}
                  width={600}
                  height={600}
                  className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
                  data-ai-hint="product package"
                  priority 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary rounded-lg p-4">
                  <ShoppingBasket className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <Card className="shadow-md border-border/50">
                <CardContent className="p-5 space-y-3">
                    <h3 className="text-lg font-semibold flex items-center text-foreground/90">
                        <Package className="w-5 h-5 mr-2.5 text-primary" />
                        Product Overview
                    </h3>
                    {product.brands && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Brand:</span> {product.brands}
                      </p>
                    )}
                    {product.categories && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground block mb-1">Categories:</span> 
                        <div className="flex flex-wrap gap-1.5">
                        {product.categories.split(',').map(c => c.trim()).filter(c => c).map((cat, idx) => (
                            <span key={idx} className="text-xs bg-secondary px-2 py-0.5 rounded-full border border-border/70 shadow-xs">
                                {cat}
                            </span>
                        ))}
                        </div>
                      </div>
                    )}
                     {product.barcode && (
                      <p className="text-sm text-muted-foreground pt-1">
                        <span className="font-medium text-foreground">Barcode:</span> {product.barcode}
                      </p>
                    )}
                </CardContent>
            </Card>
          </div>

          {/* Right Column: Name, Score, Ingredients */}
          <div className="md:col-span-8 lg:col-span-8 space-y-8">
            <div>
              <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-foreground leading-tight">
                {product.name || "Product Details"}
              </CardTitle>
              {product.name === "Unknown Product" && product.barcode &&
                <CardDescription className="text-lg text-muted-foreground">
                    Displaying information for barcode: {product.barcode}
                </CardDescription>
              }
            </div>
            
            <Separator />

            {product.ingredients && product.name && product.name !== 'Unknown Product' ? (
              <div>
                <HealthScoreLoader productName={product.name} ingredients={product.ingredients} />
              </div>
            ) : (
              <Card className="border-dashed shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <ShieldQuestion className="h-7 w-7 mr-3 shrink-0" />
                    <h3 className="text-xl font-semibold">Health Score Unavailable</h3>
                  </div>
                  <p className="text-muted-foreground mt-2.5">
                    {cosmeticSpecificMessage}
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Separator />

            {product.ingredients ? (
              <div>
                <IngredientsList ingredients={product.ingredients} productType={product.productType} />
              </div>
            ) : (
                <Card className="border-dashed shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center text-destructive">
                            <ListChecks className="h-7 w-7 mr-3 shrink-0" />
                            <h3 className="text-xl font-semibold">Ingredients Information Missing</h3>
                        </div>
                        <p className="text-muted-foreground mt-2.5">
                            We could not find the ingredients list for this product. Detailed health analysis requires this information.
                            {isCosmetic && ` For cosmetic items, this data may not yet be in the Open Beauty Facts database for barcode ${product.barcode}.`}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Separator />
            
            <div className="mt-8 p-5 bg-secondary/50 border border-dashed border-border/70 rounded-lg text-sm text-muted-foreground space-y-2">
                <div className="flex items-center">
                    <Microscope className="inline-block h-5 w-5 mr-2.5 text-accent shrink-0" />
                    <p><span className="font-semibold text-foreground">AI-Powered Analysis:</span> Health scores and ingredient insights are generated by AI.</p>
                </div>
                 <div className="flex items-center">
                    <Info className="inline-block h-5 w-5 mr-2.5 text-accent shrink-0" />
                    <p><span className="font-semibold text-foreground">Disclaimer:</span> Information is for educational purposes only and not a substitute for professional advice. Always consult with a healthcare or dermatology professional for personal health or skin concerns.</p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
