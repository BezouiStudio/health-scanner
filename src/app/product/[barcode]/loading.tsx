
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ImageIcon, Info, ListChecks, ShieldQuestion, Package } from "lucide-react";

export default function ProductLoadingSkeleton() {
  return (
    <div className="space-y-8"> {/* Removed container, now in layout.tsx */}
      <Skeleton className="h-10 w-40 mb-6 flex items-center px-4 py-2 rounded-lg bg-muted/70">
         <ArrowLeft className="mr-2.5 h-5 w-5 text-muted-foreground" /> 
         <span className="text-sm text-muted-foreground">Back to Search</span>
      </Skeleton>
      
      <Card className="overflow-hidden shadow-xl rounded-xl border-border/60">
        <CardContent className="p-6 md:p-8 lg:p-10">
          <div className="grid md:grid-cols-12 gap-8 md:gap-10 lg:gap-12 items-start">
            {/* Image Skeleton */}
            <div className="md:col-span-4 lg:col-span-4 space-y-6">
                <Skeleton className="aspect-square w-full bg-muted/70 rounded-lg flex items-center justify-center">
                    <Package className="w-24 h-24 text-muted-foreground/40 animate-pulse" />
                </Skeleton>
                <Skeleton className="h-32 w-full bg-muted/70 rounded-lg" />
            </div>

            {/* Details Skeleton */}
            <div className="md:col-span-8 lg:col-span-8 space-y-8">
              <Skeleton className="h-14 w-full mb-2 rounded-lg bg-muted/80" /> {/* Product Name as title */}
              <Skeleton className="h-7 w-2/3 mb-1 rounded-md bg-muted/70" /> {/* Brands */}
              <Skeleton className="h-6 w-1/2 mb-5 rounded-md bg-muted/60" /> {/* Categories */}
              
              {/* Score Skeleton Section */}
              <div className="p-5 border border-dashed border-border/50 rounded-lg bg-secondary/40 space-y-4">
                <div className="flex items-center mb-2">
                  <ShieldQuestion className="w-7 h-7 mr-3 text-accent/60 animate-pulse" />
                  <Skeleton className="h-8 w-1/2 rounded-md bg-muted/70" /> {/* Score Title */}
                </div>
                <div className="flex items-center gap-4 mb-2">
                    <Skeleton className="h-20 w-20 rounded-full bg-muted/70" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48 rounded-md bg-muted/70" />
                        <Skeleton className="h-5 w-32 rounded-md bg-muted/60" />
                    </div>
                </div>
                <Skeleton className="h-6 w-1/3 mb-2 rounded-md bg-muted/70" /> {/* Explanation Title */}
                <Skeleton className="h-4 w-full rounded-md bg-muted/60" /> 
                <Skeleton className="h-4 w-5/6 rounded-md bg-muted/60" /> 
                <Skeleton className="h-4 w-3/4 rounded-md bg-muted/60" />      
              </div>

              {/* Ingredients Skeleton Section */}
              <div>
                <div className="flex items-center mb-3">
                  <ListChecks className="w-7 h-7 mr-3 text-primary/60 animate-pulse" />
                  <Skeleton className="h-8 w-1/3 rounded-md bg-muted/70" /> {/* Ingredients Title */}
                </div>
                <div className="p-5 border border-dashed border-border/50 rounded-lg bg-secondary/40 space-y-3">
                  <Skeleton className="h-5 w-full rounded-md bg-muted/60" />
                  <Skeleton className="h-5 w-11/12 rounded-md bg-muted/60" />
                  <Skeleton className="h-5 w-5/6 rounded-md bg-muted/60" />
                  <Skeleton className="h-5 w-3/4 rounded-md bg-muted/60" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-10">
        <p className="text-muted-foreground animate-pulse">Fetching product details, please wait...</p>
      </div>
    </div>
  );
}
