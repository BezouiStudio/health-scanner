
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, Info, List } from "lucide-react";

export default function ProductLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-9 w-32 mb-6 flex items-center px-3">
         <ArrowLeft className="mr-2 h-4 w-4 text-muted-foreground" /> 
         <span className="text-sm text-muted-foreground">Back</span>
      </Skeleton>
      <Card className="overflow-hidden shadow-xl rounded-lg">
        <CardContent className="p-0 md:p-6">
          <div className="grid md:grid-cols-3 gap-6 md:gap-10 items-start">
            {/* Image Skeleton */}
            <div className="md:col-span-1 bg-muted rounded-lg flex items-center justify-center aspect-square">
              <ImageIcon className="w-24 h-24 text-muted-foreground/50 animate-pulse" />
            </div>

            {/* Details Skeleton */}
            <div className="md:col-span-2 p-6 md:p-0">
              <Skeleton className="h-12 w-full mb-3 rounded-md bg-primary/20" /> {/* Product Name as title */}
              <Skeleton className="h-6 w-1/2 mb-2" /> {/* Brands */}
              <Skeleton className="h-5 w-1/3 mb-6" /> {/* Categories */}
              
              {/* Score Skeleton Section Placeholder */}
              <div className="mb-6 p-4 border rounded-lg bg-secondary/30 border-dashed">
                <div className="flex items-center mb-3">
                  <Info className="w-5 h-5 mr-2 text-accent/70" />
                  <Skeleton className="h-6 w-1/3" /> {/* Score Title */}
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" /> {/* "Generating score..." text */}
                <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-12 w-28 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-6 w-1/4 mb-2" /> {/* Explanation Title */}
                <Skeleton className="h-4 w-full mb-1" /> 
                <Skeleton className="h-4 w-5/6 mb-1" /> 
                <Skeleton className="h-4 w-3/4" />      
              </div>

              {/* Ingredients Skeleton Section Placeholder */}
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <List className="w-5 h-5 mr-2 text-foreground/70" />
                  <Skeleton className="h-6 w-1/4" /> {/* Ingredients Title */}
                </div>
                <div className="p-4 border rounded-lg bg-secondary/30 border-dashed">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <Skeleton className="h-5 w-full mt-4 text-center text-muted-foreground" /> {/* "Loading details..." type message */}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center mt-8">
        <p className="text-muted-foreground">Fetching product details, please wait...</p>
      </div>
    </div>
  );
}
