
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-border/70 group">
      <CardHeader className="p-0 relative">
        <div className="aspect-square w-full bg-muted/50 overflow-hidden rounded-t-xl">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name || 'Product image'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              data-ai-hint="product package"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-4">
              <Package className="w-20 h-20 text-muted-foreground/70" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-5 flex-grow flex flex-col">
        <CardTitle className="text-lg font-semibold leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name || 'Unnamed Product'}
        </CardTitle>
        {product.brands && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{product.brands}</p>
        )}
        <div className="mt-auto"> {/* Pushes footer to bottom */}
            {product.productType && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${product.productType === 'cosmetic' ? 'bg-accent/10 text-accent-foreground dark:text-accent' : 'bg-primary/10 text-primary-foreground dark:text-primary'}`}>
                    {product.productType.charAt(0).toUpperCase() + product.productType.slice(1)}
                </span>
            )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0 border-t mt-auto"> {/* Ensure footer is at bottom */}
        <Button asChild className="w-full text-base py-3 h-auto rounded-md group/button">
          <Link href={`/product/${product.barcode}`}>
            View Details
            <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
