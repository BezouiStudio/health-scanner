'use client';

import type { AlternativeProduct } from '@/ai/flows/generate-alternatives-flow';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lightbulb, Search, Sparkles } from 'lucide-react';

interface AlternativeProductsDisplayProps {
  alternatives: AlternativeProduct[];
}

export default function AlternativeProductsDisplay({ alternatives }: AlternativeProductsDisplayProps) {
  if (!alternatives || alternatives.length === 0) {
    return (
        <div className="mt-10 p-6 bg-secondary/40 border border-dashed border-border/60 rounded-xl text-center shadow-sm">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No specific alternatives could be suggested at this time.</p>
            <p className="text-sm text-muted-foreground mt-1">Consider searching for products with simpler ingredient lists or higher ratings.</p>
        </div>
    );
  }

  return (
    <div className="mt-10 pt-8 border-t border-border/50">
      <h2 className="text-2xl md:text-3xl font-bold flex items-center mb-8 text-foreground">
        <Sparkles className="mr-3.5 h-8 w-8 text-accent animate-pulse" />
        Looking for Better Options?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {alternatives.map((alt, index) => (
          <Card key={`${alt.name}-${index}`} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border-border/70 bg-card">
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-xl font-semibold leading-snug text-primary group-hover:text-primary/90 line-clamp-2">
                {alt.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
              {alt.reason && (
                <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                  {alt.reason}
                </CardDescription>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-5 px-5 mt-auto">
              <Button asChild variant="outline" className="w-full text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/search?query=${encodeURIComponent(alt.name)}`}>
                  <Search className="mr-2 h-4 w-4" /> Search for this
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <p className="mt-8 text-xs text-muted-foreground text-center italic px-4">
            Alternative suggestions are AI-generated and for informational purposes. Availability may vary.
        </p>
    </div>
  );
}
