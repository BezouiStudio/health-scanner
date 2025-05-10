
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import IngredientsList from './IngredientsList';
import HealthScoreLoader from './HealthScoreLoader'; 
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Package, Tag, Info, AlertCircle, ShoppingBasket, ListChecks, ShieldQuestion, Microscope, ChevronLeft } from 'lucide-react';
import { Separator } from '../ui/separator';
import Link from 'next/link';
import { Button } from '../ui/button';


interface ProductDetailsDisplayProps {
  product: Product;
}

export default function ProductDetailsDisplay({ product }: ProductDetailsDisplayProps) {
  const isCosmetic = product.productType === 'cosmetic';
  const noScoreReason = 
    product.name === 'Unknown Product' || !product.name ? 'the product name is missing or invalid.' :
    !product.ingredients ? 'ingredient information is missing.' :
    'ingredient information or product name is missing or invalid.';

  const scoreUnavailableMessage = isCosmetic 
    ? `Health score for this cosmetic product cannot be generated. This often means detailed ingredient information or a specific product name is not available in the Open Beauty Facts database for barcode ${product.barcode}. Ensure the product type is correctly identified as 'cosmetic' for accurate analysis.`
    : `Health score cannot be generated because ${noScoreReason} The product type is currently identified as '${product.productType || 'unknown'}'.`;
  
  const ingredientsUnavailableMessage = isCosmetic
    ? `We could not find the ingredients list for this cosmetic product. Detailed health analysis requires this information. This data may not yet be in the Open Beauty Facts database for barcode ${product.barcode}.`
    : `We could not find the ingredients list for this product (type: '${product.productType || 'unknown'}'). Detailed health analysis requires this information.`;


  return (
    <div className="bg-card shadow-2xl rounded-2xl overflow-hidden border border-border/50">
      <div className="p-4 sm:p-6 md:p-8 lg:p-10">

      <div className="mb-6 sm:mb-8">
        <Button variant="outline" asChild className="rounded-lg text-base shadow-sm hover:shadow-md transition-shadow group">
          <Link href="/">
            <ChevronLeft className="mr-1.5 h-5 w-5 transition-transform group-hover:-translate-x-1 duration-200" /> Back to Search
          </Link>
        </Button>
      </div>

        <div className="grid md:grid-cols-12 gap-x-8 md:gap-x-10 lg:gap-x-12 gap-y-8 items-start">
          
          {/* Left Column: Image and Basic Info */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <div className="bg-muted/40 rounded-xl overflow-hidden shadow-md aspect-square flex items-center justify-center p-2 border border-border/30">
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
                <div className="w-full h-full flex items-center justify-center bg-secondary/70 rounded-lg p-4">
                  <ShoppingBasket className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <Card className="shadow-lg border-border/50 rounded-xl">
                <CardContent className="p-5 space-y-3.5">
                    <h3 className="text-lg font-semibold flex items-center text-foreground/90 mb-1">
                        <Package className="w-5 h-5 mr-2.5 text-primary opacity-90" />
                        Product Overview
                    </h3>
                    {product.brands && (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/90">Brand:</span> {product.brands}
                      </p>
                    )}
                    {product.categories && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/90 block mb-1.5">Categories:</span> 
                        <div className="flex flex-wrap gap-1.5">
                        {product.categories.split(',').map(c => c.trim()).filter(c => c).slice(0, 5).map((cat, idx) => ( // Limit categories shown
                            <span key={idx} className="text-xs bg-primary/10 text-primary dark:text-primary-foreground dark:bg-primary/70 px-2.5 py-1 rounded-full border border-primary/20 shadow-xs font-medium">
                                {cat}
                            </span>
                        ))}
                        </div>
                      </div>
                    )}
                     {product.barcode && (
                      <p className="text-sm text-muted-foreground pt-1.5">
                        <span className="font-medium text-foreground/90">Barcode:</span> <span className="font-mono">{product.barcode}</span>
                      </p>
                    )}
                    {product.productType && (
                      <p className="text-sm text-muted-foreground pt-1">
                        <span className="font-medium text-foreground/90">Type:</span> <span className="capitalize bg-accent/10 text-accent dark:text-accent-foreground dark:bg-accent/70 px-2 py-0.5 rounded-full text-xs font-semibold">{product.productType}</span>
                      </p>
                    )}
                </CardContent>
            </Card>
          </div>

          {/* Right Column: Name, Score, Ingredients */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            <div>
              <CardTitle className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-2.5 text-foreground leading-tight">
                {product.name || "Product Details"}
              </CardTitle>
              {product.name === "Unknown Product" && product.barcode &&
                <CardDescription className="text-lg text-muted-foreground font-mono">
                    Barcode: {product.barcode}
                </CardDescription>
              }
            </div>
            
            <Separator className="my-6 sm:my-8" />

            {(product.ingredients && product.ingredients.trim() !== "" && product.name && product.name !== 'Unknown Product') ? (
              <div>
                <HealthScoreLoader 
                  productName={product.name} 
                  ingredients={product.ingredients}
                  productCategories={product.categories}
                  productType={product.productType || 'unknown'}
                />
              </div>
            ) : (
              <Card className="border-dashed shadow-sm border-amber-500/50 bg-amber-500/5 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-start text-amber-700 dark:text-amber-400">
                    <ShieldQuestion className="h-8 w-8 mr-3.5 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xl font-semibold">Health Score Unavailable</h3>
                      <p className="text-amber-600 dark:text-amber-500 mt-2 text-sm leading-relaxed">
                        {scoreUnavailableMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Separator className="my-6 sm:my-8" />

            {product.ingredients && product.ingredients.trim() !== "" ? (
              <div>
                <IngredientsList ingredients={product.ingredients} productType={product.productType} />
              </div>
            ) : (
                <Card className="border-dashed shadow-sm border-destructive/50 bg-destructive/5 rounded-xl">
                    <CardContent className="p-6">
                       <div className="flex items-start text-destructive">
                            <ListChecks className="h-8 w-8 mr-3.5 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-xl font-semibold">Ingredients Information Missing</h3>
                                <p className="text-destructive/90 dark:text-destructive/80 mt-2 text-sm leading-relaxed">
                                    {ingredientsUnavailableMessage}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Separator className="my-6 sm:my-8" />
            
            <div className="mt-8 p-5 bg-secondary/50 border border-dashed border-border/60 rounded-xl text-sm text-muted-foreground space-y-3 shadow-inner">
                <div className="flex items-start">
                    <Microscope className="inline-block h-5 w-5 mr-3 text-primary shrink-0 mt-0.5" />
                    <p><span className="font-semibold text-foreground">AI-Powered Analysis:</span> Health scores, ingredient insights, and alternative suggestions are generated by AI.</p>
                </div>
                 <div className="flex items-start">
                    <Info className="inline-block h-5 w-5 mr-3 text-primary shrink-0 mt-0.5" />
                    <p><span className="font-semibold text-foreground">Disclaimer:</span> Information is for educational purposes only and not a substitute for professional advice. Always consult with a healthcare or dermatology professional for personal health or skin concerns.</p>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
