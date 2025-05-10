
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Info, TrendingUp, TrendingDown, MinusCircle, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  explanation?: string;
}

export default function ScoreDisplay({ score, explanation }: ScoreDisplayProps) {
  let scoreColorClass = '';
  let IconComponent = ShieldQuestion;
  let ratingText = "Rating Unavailable";
  let badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let badgeRingClass = '';
  let badgeTextColorClass = 'text-primary-foreground';

  if (score >= 8) {
    IconComponent = ShieldCheck;
    scoreColorClass = 'text-green-600 dark:text-green-400';
    ratingText = "Excellent";
    badgeVariant = 'default'; // Will use primary color by default
    badgeRingClass = 'ring-green-500/30';
    badgeTextColorClass = 'text-primary-foreground'; // white on primary bg
  } else if (score >= 6) {
    IconComponent = ShieldCheck; // Still good
    scoreColorClass = 'text-sky-600 dark:text-sky-400'; // Using sky for "Good"
    ratingText = "Good";
    badgeVariant = 'default'; // Using primary color, but text below will differ
    badgeRingClass = 'ring-sky-500/30';
    badgeTextColorClass = 'text-primary-foreground';
  } else if (score >= 4) {
    IconComponent = AlertTriangle;
    scoreColorClass = 'text-yellow-600 dark:text-yellow-400';
    ratingText = "Fair";
    badgeVariant = 'outline'; // Outline for moderate scores
    badgeRingClass = 'ring-yellow-500/50 border-yellow-500';
    badgeTextColorClass = 'text-yellow-600 dark:text-yellow-400';
  } else {
    IconComponent = ShieldAlert;
    scoreColorClass = 'text-red-600 dark:text-red-400';
    ratingText = "Caution";
    badgeVariant = 'destructive'; // Destructive for low scores
    badgeRingClass = 'ring-red-500/30';
    badgeTextColorClass = 'text-destructive-foreground'; // white on red bg
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className={`relative inline-flex items-center justify-center p-1.5 rounded-full ring-4 ${badgeRingClass} bg-gradient-to-br ${
            score >= 8 ? 'from-green-400 to-green-600' :
            score >= 6 ? 'from-sky-400 to-sky-600' :
            score >= 4 ? 'from-yellow-400 to-yellow-600' :
            'from-red-400 to-red-600'
        } shadow-lg`}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-card rounded-full flex flex-col items-center justify-center text-center p-2">
                <IconComponent className={`w-7 h-7 sm:w-8 sm:h-8 mb-1 ${scoreColorClass}`} />
                <span className={`text-3xl sm:text-4xl font-bold ${scoreColorClass}`}>{score}</span>
                <span className={`text-xs font-medium ${scoreColorClass} uppercase tracking-wider`}>Score</span>
            </div>
        </div>
        <div className="sm:ml-2">
            <p className={`text-2xl md:text-3xl font-bold ${scoreColorClass}`}>
            {ratingText}
            </p>
            <p className="text-sm text-muted-foreground">Health & Safety Rating</p>
        </div>
      </div>
      
      {explanation && (
        <Card className="bg-secondary/30 border-border/50 rounded-lg shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <CardTitle className="text-lg font-semibold flex items-center text-foreground/90">
              <Info className="w-5 h-5 mr-2 text-accent shrink-0" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
          </CardContent>
        </Card>
      )}
       {!explanation && (
         <Card className="bg-secondary/30 border-border/50 rounded-lg shadow-sm">
          <CardContent className="px-5 py-5">
            <p className="text-sm text-muted-foreground italic flex items-center">
                <Info className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                No detailed explanation provided by the AI for this score.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
