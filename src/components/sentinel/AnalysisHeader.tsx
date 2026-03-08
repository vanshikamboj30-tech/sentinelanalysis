import { Button } from "@/components/ui/button";
import { RotateCcw, FileText, Bell, Shield, Brain, Mail, Cpu } from "lucide-react";
import SystemHealth from "./SystemHealth";
import { VideoAnalysis } from "@/types/sentinel";

interface AnalysisHeaderProps {
  data: VideoAnalysis;
  onReset: () => void;
  onGenerateReport: () => void;
  onSetupAlerts: () => void;
}

const AnalysisHeader = ({ data, onReset, onGenerateReport, onSetupAlerts }: AnalysisHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            ANALYSIS COMPLETE
          </h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {data.aiAnalysis && (
              <span className="text-xs text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                <Brain className="w-3 h-3" /> AI-Analyzed
              </span>
            )}
            {data.emailSent && (
              <span className="text-xs text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                <Mail className="w-3 h-3" /> Report emailed
              </span>
            )}
            {data.alertSent && (
              <span className="text-xs text-destructive flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full">
                <Bell className="w-3 h-3" /> Alert sent
              </span>
            )}
            <span className="text-xs text-muted-foreground font-mono">
              {data.events.length} DETECTIONS • {[...new Set(data.events.map(e => e.class))].length} CLASSES
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-wrap">
        <SystemHealth />
        <div className="h-6 w-px bg-border hidden md:block" />
        <Button
          onClick={onGenerateReport}
          variant="outline"
          size="sm"
          className="font-display border-border/50 hover:border-primary/50 hover:bg-primary/5"
        >
          <FileText className="w-4 h-4 mr-2" />
          REPORT
        </Button>
        <Button
          onClick={onSetupAlerts}
          variant="outline"
          size="sm"
          className="font-display border-border/50 hover:border-warning/50 hover:bg-warning/5"
        >
          <Bell className="w-4 h-4 mr-2" />
          ALERTS
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="font-display border-border/50 hover:border-primary/50 hover:bg-primary/5"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          NEW
        </Button>
      </div>
    </div>
  );
};

export default AnalysisHeader;
