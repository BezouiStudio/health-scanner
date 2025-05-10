
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, Sparkles, ShieldCheck } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-6 text-center">
      <div className="relative flex items-center justify-center mb-8">
        <ShieldCheck className="w-24 h-24 md:w-32 md:w-32 text-primary opacity-20 animate-ping absolute" />
        <ShieldCheck className="w-20 h-20 md:w-28 md:h-28 text-primary relative" />
      </div>
      <h2 className="text-3xl font-semibold text-foreground mb-3 animate-pulse">
        Loading Health & Beauty Scanner
      </h2>
      <p className="text-lg text-muted-foreground mb-10 max-w-md">
        Preparing your smart product analysis experience...
      </p>
      <div className="w-full max-w-sm space-y-3">
        <Skeleton className="h-8 w-3/4 mx-auto bg-muted/70" />
        <Skeleton className="h-6 w-1/2 mx-auto bg-muted/60" />
      </div>
    </div>
  );
}
