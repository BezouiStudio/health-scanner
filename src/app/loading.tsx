
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="animate-pulse flex gap-4">
        <Leaf className="w-20 h-20 text-primary" />
        <Sparkles className="w-20 h-20 text-accent" />
      </div>
      <Skeleton className="w-72 h-8 mt-8 mb-3 bg-muted-foreground/20" />
      <Skeleton className="w-56 h-6 bg-muted-foreground/20" />
      <p className="mt-4 text-lg text-muted-foreground">Loading Health & Beauty Scanner...</p>
    </div>
  );
}

