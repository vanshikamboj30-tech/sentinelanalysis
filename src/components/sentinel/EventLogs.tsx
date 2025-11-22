import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";
import { DetectionEvent } from "@/types/sentinel";

interface EventLogsProps {
  events: DetectionEvent[];
}

const EventLogs = ({ events }: EventLogsProps) => {
  const getThreatColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 50) return "text-warning";
    return "text-success";
  };

  return (
    <Card className="bg-card border-border h-full">
      <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="font-display text-sm font-semibold">
          EVENT LOGS
        </span>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4 font-mono text-xs">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border text-muted-foreground font-semibold mb-3">
            <div>TIMESTAMP</div>
            <div>ID</div>
            <div>CLASS</div>
            <div>CONFIDENCE</div>
            <div>THREAT</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="grid grid-cols-5 gap-4 py-2 border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <div className="text-primary">{event.timestamp}</div>
                <div className="text-muted-foreground">
                  #{event.id.toString().padStart(3, "0")}
                </div>
                <div className="text-foreground uppercase">{event.class}</div>
                <div className="text-success">
                  {(event.confidence * 100).toFixed(1)}%
                </div>
                <div className={getThreatColor(event.threatScore)}>
                  {event.threatScore}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="px-4 py-3 bg-secondary/30 border-t border-border flex items-center justify-between">
        <p className="text-xs font-mono text-muted-foreground">
          {events.length} EVENTS RECORDED
        </p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            MONITORING
          </span>
        </div>
      </div>
    </Card>
  );
};

export default EventLogs;
