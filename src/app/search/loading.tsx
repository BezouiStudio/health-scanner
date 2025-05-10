
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function SearchLoadingSkeleton() {
  return (
    <div className="w-full pt-8 space-y-10">
      <div className="text-center">
        <Search className="mx-auto h-16 w-16 md:h-20 md:w-20 text-primary animate-pulse mb-5" />
        <h2 className="text-3xl font-semibold text-foreground mb-2">Searching for Products...</h2>
        <p className="text-lg text-muted-foreground">Please wait while we gather the results for you!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="rounded-xl border bg-card text-card-foreground shadow-lg overflow-hidden">
            <Skeleton className="aspect-square w-full bg-muted/70" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-7 w-3/4 rounded-md bg-muted/70" />
              <Skeleton className="h-5 w-1/2 rounded-md bg-muted/60" />
              <Skeleton className="h-5 w-1/3 rounded-md bg-muted/50" />
              <Skeleton className="h-11 w-full mt-2 rounded-lg bg-muted/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
