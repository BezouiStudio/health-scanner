
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  explanation?: string;
}

export default function ScoreDisplay({ score, explanation }: ScoreDisplayProps) {
  let scoreVariant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let scoreColorClass = '';
  let IconComponent = Info;
  let ratingText = "Moderate";

  if (score >= 8) {
    scoreVariant = 'default'; // Uses primary color (green)
    IconComponent = CheckCircle;
    scoreColorClass = 'text-primary';
    ratingText = "Good";
  } else if (score >= 4) {
    scoreVariant = 'outline'; // Neutral outline
    IconComponent = AlertTriangle;
    scoreColorClass = 'text-yellow-600 dark:text-yellow-400';
    ratingText = "Moderate";
  } else {
    scoreVariant = 'destructive'; // Uses destructive color (red)
    IconComponent = XCircle;
    scoreColorClass = 'text-destructive';
    ratingText = "Low";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge variant={scoreVariant} className={`px-4 py-2 text-2xl font-bold shadow-md ${scoreVariant === 'outline' ? 'border-2 border-yellow-500' : ''}`}>
          <IconComponent className={`w-7 h-7 mr-2 ${scoreColorClass}`} />
          {score}/10
        </Badge>
        <p className={`text-xl font-semibold ${scoreColorClass}`}>
          {ratingText} Health/Safety Rating
        </p>
      </div>
      {explanation && (
        <Card className="bg-background/70 border-dashed">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md flex items-center">
              <Info className="w-4 h-4 mr-2 text-muted-foreground" />
              AI Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

