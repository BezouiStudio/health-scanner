import { Suspense } from 'react';
import { searchProducts } from '@/lib/actions';
import ProductCard from '@/components/product/ProductCard';
import SearchBar from '@/components/search/SearchBar';
import { AlertCircle, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SearchLoadingSkeleton from './loading'; // Import the specific loading skeleton

interface SearchPageProps {
  searchParams: {
    query?: string;
  };
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query);

  if (!products || products.length === 0) {
    return (
      <Alert variant="default" className="mt-8 max-w-lg mx-auto shadow-md">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>No Products Found</AlertTitle>
        <AlertDescription>
          We couldn&apos;t find any products matching &quot;{query}&quot;. Try a different search term.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {products.map((product) => (
        <ProductCard key={product.barcode} product={product} />
      ))}
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.query || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
          <Search className="h-8 w-8 mr-3 text-primary" /> Search Results
        </h1>
        {query && (
          <p className="text-muted-foreground text-lg">
            Showing results for: <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
          </p>
        )}
        <div className="mt-6 max-w-xl">
         <SearchBar />
        </div>
      </div>
      
      <Suspense fallback={<SearchLoadingSkeleton />}>
        {query ? <SearchResults query={query} /> : (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Enter a search term above to find products.</p>
            </div>
        )}
      </Suspense>
    </div>
  );
}
