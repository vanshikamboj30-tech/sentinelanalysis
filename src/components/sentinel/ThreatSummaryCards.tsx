import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Shield, Zap } from "lucide-react";
import { DetectionEvent } from "@/types/sentinel";

interface ThreatSummaryCardsProps {
  events: DetectionEvent[];
  criticalEvents?: number;
}

const ThreatSummaryCards = ({ events, criticalEvents }: ThreatSummaryCardsProps) => {
  const highCount = events.filter((e) => e.threatScore >= 70).length;
  const mediumCount = events.filter((e) => e.threatScore >= 40 && e.threatScore < 70).length;
  const lowCount = events.filter((e) => e.threatScore < 40).length;
  const criticalCount = criticalEvents || events.filter(e => e.severity === "Critical").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {criticalCount > 0 && (
        <Card className="p-4 bg-gradient-to-br from-destructive/20 to-transparent border-destructive/50 hover:border-destructive/70 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/30">
              <Zap className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-destructive">{criticalCount}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Critical</p>
            </div>
          </div>
        </Card>
      )}
      <Card className="p-4 bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30 hover:border-destructive/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/20">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-destructive">{highCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">High Threat</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-warning/10 to-transparent border-warning/30 hover:border-warning/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/20">
            <Shield className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-warning">{mediumCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Medium Threat</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 bg-gradient-to-br from-success/10 to-transparent border-success/30 hover:border-success/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/20">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-success">{lowCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Low Threat</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ThreatSummaryCards;
