
import { Suspense } from 'react';
import { searchProducts } from '@/lib/actions';
import ProductCard from '@/components/product/ProductCard';
import SearchBar from '@/components/search/SearchBar';
import { AlertCircle, Search as SearchIcon, PackageSearch, Frown } from 'lucide-react';
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
      <Alert variant="default" className="mt-10 max-w-lg mx-auto shadow-xl rounded-xl p-6 sm:p-8 text-center border-border/60">
        <Frown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <AlertTitle className="text-xl font-semibold mb-1.5">No Products Found</AlertTitle>
        <AlertDescription className="text-base">
          We couldn&apos;t find any products matching &quot;<span className="font-semibold text-primary">{query}</span>&quot;. 
          Please try a different search term or check for typos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 mt-10">
      {products.map((product) => (
        <ProductCard key={product.barcode} product={product} />
      ))}
    </div>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.query || '';

  return (
    <div className="space-y-10"> {/* Removed container, now in layout.tsx */}
      <div className="p-6 sm:p-8 bg-card border border-border/60 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 sm:mb-5 gap-4">
          <SearchIcon className="h-12 w-12 sm:h-14 sm:w-14 text-primary shrink-0" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Discover Products
            </h1>
            {query && (
              <p className="text-muted-foreground text-lg mt-1">
                Showing results for: <span className="font-semibold text-primary">&quot;{query}&quot;</span>
              </p>
            )}
             {!query && (
              <p className="text-muted-foreground text-lg mt-1">
                Enter a product name or barcode to begin.
              </p>
            )}
          </div>
        </div>
        <div className="max-w-2xl">
         <SearchBar />
        </div>
      </div>
      
      <Suspense fallback={<SearchLoadingSkeleton />}>
        {query ? (
          <SearchResults query={query} />
        ) : (
            <div className="text-center py-16 text-muted-foreground">
                <PackageSearch className="h-24 w-24 mx-auto mb-6 text-primary/40" />
                <p className="text-xl font-medium">Enter a search term above to find products.</p>
                <p className="text-base mt-1">Search by name or barcode for food and cosmetics.</p>
            </div>
        )}
      </Suspense>
    </div>
  );
}
