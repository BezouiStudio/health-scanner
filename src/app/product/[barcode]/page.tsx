import { getProductDetailsWithScore } from '@/lib/actions';
import ProductDetailsDisplay from '@/components/product/ProductDetailsDisplay';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ProductPageProps {
  params: {
    barcode: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductDetailsWithScore(params.barcode);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Alert variant="destructive" className="max-w-lg mx-auto my-10 shadow-lg">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Product Not Found</AlertTitle>
          <AlertDescription>
            We couldn&apos;t find details for barcode <span className="font-mono">{params.barcode}</span>. It might not be in our database, or the barcode is incorrect.
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back Home
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
          </Link>
        </Button>
      </div>
      <ProductDetailsDisplay product={product} />
    </div>
  );
}
