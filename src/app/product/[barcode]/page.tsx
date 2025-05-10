
import { getProductDetails } from '@/lib/actions';
import ProductDetailsDisplay from '@/components/product/ProductDetailsDisplay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Frown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProductPageProps {
  params: {
    barcode: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductDetails(params.barcode); 

  if (!product) {
    return (
      <div className="text-center py-10"> {/* Removed container, now in layout.tsx */}
        <Alert variant="destructive" className="max-w-lg mx-auto my-10 shadow-xl rounded-xl p-6 sm:p-8">
          <Frown className="h-10 w-10 mx-auto mb-4 text-destructive" />
          <AlertTitle className="text-2xl font-semibold mb-2">Product Not Found</AlertTitle>
          <AlertDescription className="text-base">
            We couldn&apos;t find details for barcode <span className="font-mono bg-destructive/10 px-1.5 py-0.5 rounded">{params.barcode}</span>. 
            It might not be in our database, or the barcode is incorrect. Please double-check and try again.
          </AlertDescription>
        </Alert>
        <Button variant="outline" size="lg" asChild className="rounded-lg text-base shadow-md hover:shadow-lg transition-shadow">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" /> Go Back Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8"> {/* Removed container, now in layout.tsx */}
      <div className="mb-6">
        <Button variant="outline" size="lg" asChild className="rounded-lg text-base shadow-sm hover:shadow-md transition-shadow">
          <Link href="/">
            <ArrowLeft className="mr-2 h-5 w-5" /> Back to Search
          </Link>
        </Button>
      </div>
      <ProductDetailsDisplay product={product} />
    </div>
  );
}
