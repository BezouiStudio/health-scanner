
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Info, TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  explanation?: string;
}

export default function ScoreDisplay({ score, explanation }: ScoreDisplayProps) {
  let scoreVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let scoreColorClass = '';
  let IconComponent = TrendingUp; // Default to a positive trend icon
  let ratingText = "Moderate";
  let badgeBgColor = 'bg-primary'; // Default for 'default' variant

  if (score >= 8) {
    scoreVariant = 'default'; 
    IconComponent = CheckCircle;
    scoreColorClass = 'text-green-600 dark:text-green-400';
    ratingText = "Good";
    badgeBgColor = 'bg-green-500 hover:bg-green-500/90';
  } else if (score >= 4) {
    scoreVariant = 'outline'; 
    IconComponent = AlertTriangle;
    scoreColorClass = 'text-yellow-600 dark:text-yellow-400';
    ratingText = "Moderate";
    // For outline, the border and text color define it.
  } else {
    scoreVariant = 'destructive'; 
    IconComponent = XCircle;
    scoreColorClass = 'text-red-600 dark:text-red-400';
    ratingText = "Low";
    badgeBgColor = 'bg-red-500 hover:bg-red-500/90';
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Badge 
          variant={scoreVariant} 
          className={`px-4 py-2 text-2xl md:text-3xl font-bold shadow-lg rounded-full flex items-center
            ${scoreVariant === 'default' ? `${badgeBgColor} text-white` : ''}
            ${scoreVariant === 'destructive' ? `${badgeBgColor} text-white` : ''}
            ${scoreVariant === 'outline' ? `border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10` : ''}
          `}
        >
          <IconComponent className={`w-7 h-7 md:w-8 md:h-8 mr-2 ${scoreVariant !== 'outline' ? 'text-white' : scoreColorClass }`} />
          {score}/10
        </Badge>
        <p className={`text-xl md:text-2xl font-semibold ${scoreColorClass}`}>
          {ratingText} Health/Safety Rating
        </p>
      </div>
      {explanation && (
        <Card className="bg-muted/50 border-border/70 rounded-lg shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-md font-semibold flex items-center text-foreground/90">
              <Info className="w-5 h-5 mr-2 text-accent" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
          </CardContent>
        </Card>
      )}
       {!explanation && (
         <Card className="bg-muted/50 border-border/70 rounded-lg shadow-sm">
          <CardContent className="px-4 py-4">
            <p className="text-sm text-muted-foreground italic">No detailed explanation provided by the AI for this score.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
