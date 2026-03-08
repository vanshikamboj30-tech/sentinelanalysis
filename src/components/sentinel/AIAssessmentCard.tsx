import { Card } from "@/components/ui/card";
import { Brain, Zap } from "lucide-react";
import { VideoAnalysis } from "@/types/sentinel";

interface AIAssessmentCardProps {
  stats: VideoAnalysis["stats"];
}

const AIAssessmentCard = ({ stats }: AIAssessmentCardProps) => {
  if (!stats.overallAssessment) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-transparent border-primary/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 shrink-0">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-display font-semibold text-primary mb-1">
            AI ASSESSMENT
            <span className="text-[10px] font-mono text-muted-foreground ml-2">OpenAI</span>
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stats.overallAssessment}
          </p>
          {stats.patternInsights && stats.patternInsights.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.patternInsights.map((insight, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3 text-warning" />
                  {insight}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AIAssessmentCard;
