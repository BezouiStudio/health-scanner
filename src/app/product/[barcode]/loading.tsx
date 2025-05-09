import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-32 mb-6" /> {/* Back button skeleton */}
      <Card className="overflow-hidden shadow-xl">
        <CardContent className="p-0 md:p-6">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Image Skeleton */}
            <div className="md:col-span-1 bg-muted">
              <Skeleton className="aspect-square w-full" />
            </div>

            {/* Details Skeleton */}
            <div className="md:col-span-2 p-6 md:p-0">
              <Skeleton className="h-10 w-3/4 mb-3" /> {/* Product Name */}
              <Skeleton className="h-6 w-1/2 mb-4" /> {/* Brands */}
              <Skeleton className="h-5 w-1/3 mb-6" /> {/* Categories */}
              
              {/* Score Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-8 w-1/4 mb-2" /> {/* Score Title */}
                <Skeleton className="h-12 w-20 mb-2" /> {/* Score Badge */}
                <Skeleton className="h-4 w-full mb-1" /> {/* Explanation line 1 */}
                <Skeleton className="h-4 w-3/4 mb-1" /> {/* Explanation line 2 */}
                <Skeleton className="h-4 w-1/2" />      {/* Explanation line 3 */}
              </div>

              {/* Ingredients Skeleton */}
              <div>
                <Skeleton className="h-8 w-1/3 mb-3" /> {/* Ingredients Title */}
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
