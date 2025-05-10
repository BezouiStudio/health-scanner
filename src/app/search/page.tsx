import { Suspense } from 'react';
import { searchProducts } from '@/lib/actions';
import ProductCard from '@/components/product/ProductCard';
import SearchBar from '@/components/search/SearchBar';
import { AlertCircle, Search as SearchIcon, ShoppingBag } from 'lucide-react'; // Renamed Search to SearchIcon
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SearchLoadingSkeleton from './loading'; 

interface SearchPageProps {
  searchParams: {
    query?: string;
  };
}

async function SearchResults({ query }: { query: string }) {
  const products = await searchProducts(query);

  if (!products || products.length === 0) {
    return (
      <Alert variant="default" className="mt-10 max-w-lg mx-auto shadow-lg rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="font-semibold">No Products Found</AlertTitle>
        <AlertDescription>
          We couldn&apos;t find any products matching &quot;<span className="font-semibold">{query}</span>&quot;. Please try a different search term or check for typos.
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
      <div className="mb-10 p-6 bg-card border border-border rounded-xl shadow-lg">
        <div className="flex items-center mb-4">
          <SearchIcon className="h-10 w-10 mr-4 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Search Products
            </h1>
            {query && (
              <p className="text-muted-foreground text-lg mt-1">
                Showing results for: <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
              </p>
            )}
          </div>
        </div>
        <div className="max-w-2xl">
         <SearchBar />
        </div>
      </div>
      
      <Suspense fallback={<SearchLoadingSkeleton />}>
        {query ? <SearchResults query={query} /> : (
            <div className="text-center py-16 text-muted-foreground">
                <ShoppingBag className="h-20 w-20 mx-auto mb-4 text-primary/70" />
                <p className="text-xl">Enter a search term above to find products.</p>
                <p className="text-sm">Search by name or barcode for food and cosmetics.</p>
            </div>
        )}
      </Suspense>
    </div>
  );
}
