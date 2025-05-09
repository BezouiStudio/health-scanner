import { Skeleton } from "@/components/ui/skeleton";
import { Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="animate-pulse">
        <Leaf className="w-24 h-24 text-primary mb-6" />
      </div>
      <Skeleton className="w-64 h-8 mb-3 bg-muted-foreground/20" />
      <Skeleton className="w-48 h-6 bg-muted-foreground/20" />
      <p className="mt-4 text-lg text-muted-foreground">Loading Health Scanner...</p>
    </div>
  );
}
