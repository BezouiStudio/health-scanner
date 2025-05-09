import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag } from "lucide-react";

export default function SearchLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center w-full pt-8">
      <div className="text-center mb-10">
        <ShoppingBag className="mx-auto h-20 w-20 text-primary animate-pulse mb-5" />
        <h2 className="text-3xl font-semibold text-foreground mb-2">Searching for Products...</h2>
        <p className="text-lg text-muted-foreground">Hang tight while we fetch the details!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
