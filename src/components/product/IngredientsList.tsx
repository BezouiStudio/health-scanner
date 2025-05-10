'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Leaf, MinusCircle, AlertTriangle, ShieldAlert, HelpCircle, Sparkles, AlertCircle, Info, ChevronRight, CheckCircle, Ban, Package } from 'lucide-react';
import { analyzeIngredients, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients-flow';
import type { AnalyzedIngredient } from '@/lib/types';
import { cn } from '@/lib/utils';

interface IngredientsListProps {
  ingredients: string;
  productType?: 'food' | 'cosmetic' | 'unknown';
}

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof DOMParser === 'undefined') {
    // Fallback for server-side rendering or environments without DOMParser
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  }
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || "").replace(/\s+/g, ' ').trim();
  } catch (e) {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  }
}


function SkeletonBadge() {
  return <Skeleton className="h-9 w-28 rounded-full bg-muted/60" />;
}

export default function IngredientsList({ ingredients, productType = 'unknown' }: IngredientsListProps) {
  const [individualIngredients, setIndividualIngredients] = useState<string[]>([]);
  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[] | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    if (typeof window !== 'undefined') {
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);


  useEffect(() => {
    if (!ingredients || ingredients.trim() === "") {
      setIndividualIngredients([]);
      return;
    }
    const cleanedIngredientsText = stripHtml(ingredients);
    const parsedIngredients = cleanedIngredientsText
      .replace(/_/g, ' ')
      .replace(/\s*\[[^\]]*\]\s*/g, '') 
      .split(/[,;](?!\s*\d)|\.$/) 
      .map(ingredient => ingredient.trim().replace(/\.$/, '').trim()) 
      .filter(ingredient => ingredient.length > 1 && !/^\d+(\.\d+)?\s*%$/.test(ingredient)) 
      .map(ingredient => 
        ingredient
            .toLowerCase()
            .split(/(\s+|-)/) 
            .map((word) => {
              if (word === '-' || word.match(/^\s+$/)) return word; 
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join('')
      )
      .filter((value, index, self) => self.indexOf(value) === index && value.toLowerCase() !== "ingredients" && value.toLowerCase() !== "contains" && value.toLowerCase() !== "traces of");
    
    setIndividualIngredients(parsedIngredients);
  }, [ingredients]);

  useEffect(() => {
    if (individualIngredients.length === 0) {
      setAnalyzedIngredients(null); 
      return;
    }

    const fetchAnalysis = async () => {
      setIsLoadingAnalysis(true);
      setAnalysisError(null);
      try {
        const input: AnalyzeIngredientsInput = { ingredients: individualIngredients, productContext: productType };
        const result: AnalyzeIngredientsOutput = await analyzeIngredients(input);
        setAnalyzedIngredients(result.analyzedIngredients);
      } catch (error) {
        console.error("Error analyzing ingredients:", error);
        setAnalysisError("Failed to analyze ingredients. The AI assistant might be unavailable.");
        setAnalyzedIngredients(individualIngredients.map(name => ({
          ingredientName: name,
          category: 'unknown',
          reasoning: 'Analysis failed for this ingredient.'
        })));
      } finally {
        setIsLoadingAnalysis(false);
      }
    };

    fetchAnalysis();
  }, [individualIngredients, productType]);

  if (!ingredients || ingredients.trim() === "") {
    return (
      <Card className="bg-card shadow-lg border border-border/50 rounded-xl">
        <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
          <CardTitle className="text-lg font-semibold">No Ingredients Listed</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            This product does not have ingredients information available.
          </CardDescription>        
        </CardContent>
      </Card>
    );
  }
  
  if (individualIngredients.length === 0 && !isLoadingAnalysis) {
     return (
      <Card className="bg-card shadow-lg border border-border/50 rounded-xl">
        <CardContent className="p-6 text-center">
          <Info className="mx-auto h-12 w-12 text-muted-foreground/70 mb-4" />
           <CardTitle className="text-lg font-semibold">Parsing Issue</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Ingredients could not be parsed or are not in a standard format.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

const getIngredientVisuals = (category: AnalyzedIngredient['category']): { 
    icon: React.ReactNode, 
    badgeClass: string, 
    textColorClass: string, 
    tooltipHeaderClass: string,
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | null;
  } => {
    switch (category) {
      case 'beneficial':
        return { 
            icon: <CheckCircle />, 
            badgeClass: 'border-green-400/70 dark:border-green-600/50 hover:bg-green-100/30 dark:hover:bg-green-800/30 focus:bg-green-100/40 dark:focus:bg-green-800/40',
            textColorClass: 'text-green-700 dark:text-green-300',
            tooltipHeaderClass: 'text-green-600 dark:text-green-400',
            variant: 'outline', // Use outline with custom border/text for better control
        };
      case 'neutral':
        return { 
            icon: <MinusCircle />, 
            badgeClass: 'border-slate-400/70 dark:border-slate-600/50 hover:bg-slate-100/30 dark:hover:bg-slate-700/30 focus:bg-slate-100/40 dark:focus:bg-slate-700/40',
            textColorClass: 'text-slate-600 dark:text-slate-400',
            tooltipHeaderClass: 'text-slate-500 dark:text-slate-300',
            variant: 'outline',
        };
      case 'caution':
        return { 
            icon: <AlertTriangle />, 
            badgeClass: 'border-amber-400/70 dark:border-amber-500/50 hover:bg-amber-100/30 dark:hover:bg-amber-800/30 focus:bg-amber-100/40 dark:focus:bg-amber-800/40',
            textColorClass: 'text-amber-700 dark:text-amber-400',
            tooltipHeaderClass: 'text-amber-600 dark:text-amber-300',
            variant: 'outline', 
        };
      case 'avoid':
        return { 
            icon: <Ban />, 
            badgeClass: 'border-red-400/70 dark:border-red-600/50 hover:bg-red-100/30 dark:hover:bg-red-800/30 focus:bg-red-100/40 dark:focus:bg-red-800/40',
            textColorClass: 'text-red-700 dark:text-red-400',
            tooltipHeaderClass: 'text-red-600 dark:text-red-300',
            variant: 'outline', // Use outline but style it like destructive with custom border/text
        };
      case 'unknown':
      default:
        return { 
            icon: <HelpCircle />, 
            badgeClass: 'border-gray-400/70 dark:border-gray-600/50 hover:bg-gray-100/30 dark:hover:bg-gray-700/30 focus:bg-gray-100/40 dark:focus:bg-gray-700/40',
            textColorClass: 'text-gray-600 dark:text-gray-400',
            tooltipHeaderClass: 'text-gray-500 dark:text-gray-300',
            variant: 'outline',
        };
    }
  };
  
  return (
    <TooltipProvider delayDuration={isMobile ? 50 : 100}>
      <Card className="bg-background shadow-xl border border-border/40 rounded-2xl">
        <CardHeader className="pb-5 pt-7 px-5 sm:px-7">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center text-foreground">
            <Sparkles className="w-8 h-8 mr-3.5 text-primary" />
            Ingredient Analysis
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-1">
            {isMobile ? 'Tap' : 'Hover over'} an ingredient for AI-powered insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-7">
          {analysisError && (
            <div className="mb-5 p-4 rounded-lg bg-destructive/10 text-destructive-foreground text-sm flex items-center shadow border border-destructive/30">
              <AlertCircle className="h-5 w-5 mr-3 shrink-0 text-destructive"/> {analysisError}
            </div>
          )}
          <div className="flex flex-wrap gap-3 sm:gap-3.5">
            {isLoadingAnalysis && individualIngredients.length > 0 &&
              individualIngredients.map((_, index) => <SkeletonBadge key={`skel-${index}`} />)
            }
            {!isLoadingAnalysis && analyzedIngredients && analyzedIngredients.map((analyzedIng, index) => {
              if (!analyzedIng) return null; 
              const visuals = getIngredientVisuals(analyzedIng.category);
              const currentKey = `ingredient-${analyzedIng.ingredientName}-${index}`;
              
              const baseIconElement = visuals.icon as React.ReactElement;

              const keyedIcon = React.cloneElement(baseIconElement, {
                key: 'icon', 
                className: cn('h-4 w-4 mr-1.5 shrink-0', visuals.textColorClass)
              });

              const keyedSpan = (
                <span
                  key="text"
                  className={cn(
                    "truncate font-medium",
                    visuals.textColorClass,
                    "max-w-[100px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[110px] lg:max-w-[130px] xl:max-w-[160px]"
                )}>
                  {analyzedIng.ingredientName}
                </span>
              );
              
              const badgeInnerContent = (
                <>
                  {keyedIcon}
                  {keyedSpan}
                </>
              );
              
              const commonBadgeProps = {
                variant: visuals.variant || 'outline' as const, 
                className: cn(
                  `text-xs sm:text-sm font-medium px-3 sm:px-3.5 py-2 sm:py-2 shadow-sm rounded-full flex items-center transition-all hover:shadow-md border cursor-pointer focus:ring-2 focus:ring-ring focus:ring-offset-1 bg-background hover:bg-accent/10 dark:hover:bg-accent/5 focus:bg-accent/10 dark:focus:bg-accent/5`,
                   visuals.badgeClass, 
                   visuals.textColorClass
                ),
              };


              const tooltipIcon = React.cloneElement(visuals.icon as React.ReactElement, { 
                  className: cn('h-5 w-5 mr-1.5 shrink-0', visuals.tooltipHeaderClass)
              });

              const tooltipOrDialogContent = (
                <>
                  <div className={cn("font-semibold capitalize text-base mb-1 flex items-center", visuals.tooltipHeaderClass)}>
                     {tooltipIcon}
                    {analyzedIng.category}
                  </div>
                  <p className="text-xs text-popover-foreground/80 leading-relaxed">{analyzedIng.reasoning || "No specific reasoning provided by AI."}</p>
                  {analyzedIng.ingredientName.length > 18 && 
                    <p className="text-xs text-popover-foreground/70 mt-1.5 italic">Full name: {analyzedIng.ingredientName}</p>
                  }
                </>
              );
              
              const hasReasoning = analyzedIng.reasoning && (analyzedIng.category === 'caution' || analyzedIng.category === 'avoid' || analyzedIng.category === 'beneficial' || analyzedIng.category === 'unknown' || analyzedIng.category === 'neutral');

              if (isMobile && hasReasoning) {
                return (
                  <Dialog key={`dialog-${currentKey}`}>
                    <DialogTrigger asChild>
                       <Badge {...commonBadgeProps} key={currentKey}>
                        {badgeInnerContent}
                         <ChevronRight className={cn("h-4 w-4 ml-auto shrink-0 opacity-70", visuals.textColorClass)} />
                      </Badge>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-lg p-5 bg-popover shadow-2xl">
                      <DialogHeader className="mb-2">
                        <DialogTitle className={cn("text-lg flex items-center font-semibold", visuals.tooltipHeaderClass)}>
                           {React.cloneElement(visuals.icon as React.ReactElement, { className: `h-5 w-5 mr-2 shrink-0 ${visuals.tooltipHeaderClass}`})}
                           {analyzedIng.ingredientName}
                        </DialogTitle>
                      </DialogHeader>
                      <DialogDescription asChild>
                        <div className="text-sm">{tooltipOrDialogContent}</div>
                      </DialogDescription>
                    </DialogContent>
                  </Dialog>
                );
              }

              if (hasReasoning) {
                return (
                  <Tooltip key={`tooltip-${currentKey}`}>
                    <TooltipTrigger asChild>
                      <Badge {...commonBadgeProps} key={currentKey} tabIndex={0}>
                        {badgeInnerContent}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent 
                        className="max-w-xs text-sm bg-popover text-popover-foreground p-3 rounded-lg shadow-xl border border-border/50" 
                        side="top" 
                        align="center"
                    >
                      {tooltipOrDialogContent}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return (
                <Badge {...commonBadgeProps} key={currentKey}>
                  {badgeInnerContent}
                </Badge>
              );
            })}
            {!isLoadingAnalysis && analyzedIngredients?.length === 0 && individualIngredients.length > 0 && (
                <p className="text-sm text-muted-foreground w-full p-4 bg-secondary/50 rounded-md text-center">No specific AI analysis available for these ingredients.</p>
            )}
          </div>
           {!isLoadingAnalysis && !analysisError && (
            <div className="mt-6 p-4 bg-secondary/30 border border-dashed border-border/50 rounded-lg text-xs text-muted-foreground">
              <Info className="inline-block h-4 w-4 mr-1.5 text-accent align-text-bottom" />
              Ingredient analysis is AI-generated and for informational purposes. Classifications are based on general knowledge and typical product contexts. For specific health concerns or allergies, consult a professional.
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
