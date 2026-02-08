import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Search, Filter, ArrowUpDown, AlertTriangle, Shield, CheckCircle2 } from "lucide-react";
import { DetectionEvent } from "@/types/sentinel";

interface EventLogsProps {
  events: DetectionEvent[];
}

type SortField = "timestamp" | "class" | "confidence" | "threatScore";
type SortOrder = "asc" | "desc";

const EventLogs = ({ events }: EventLogsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("threatScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterThreat, setFilterThreat] = useState<"all" | "high" | "medium" | "low">("all");

  const getThreatColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-warning";
    return "text-success";
  };

  const getThreatBg = (score: number) => {
    if (score >= 70) return "bg-destructive/10 border-destructive/30";
    if (score >= 40) return "bg-warning/10 border-warning/30";
    return "bg-success/10 border-success/30";
  };

  const getThreatIcon = (score: number) => {
    if (score >= 70) return <AlertTriangle className="w-3 h-3" />;
    if (score >= 40) return <Shield className="w-3 h-3" />;
    return <CheckCircle2 className="w-3 h-3" />;
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.timestamp.includes(searchQuery);
    
    let matchesThreat = true;
    if (filterThreat === "high") matchesThreat = event.threatScore >= 70;
    else if (filterThreat === "medium") matchesThreat = event.threatScore >= 40 && event.threatScore < 70;
    else if (filterThreat === "low") matchesThreat = event.threatScore < 40;
    
    return matchesSearch && matchesThreat;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "timestamp":
        comparison = a.timestamp.localeCompare(b.timestamp);
        break;
      case "class":
        comparison = a.class.localeCompare(b.class);
        break;
      case "confidence":
        comparison = a.confidence - b.confidence;
        break;
      case "threatScore":
        comparison = a.threatScore - b.threatScore;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className={`flex items-center gap-1 hover:text-primary transition-colors ${
        sortField === field ? "text-primary" : ""
      }`}
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? "opacity-100" : "opacity-40"}`} />
    </button>
  );

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/80 to-secondary/40 border-b border-border px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold">
            EVENT LOGS
          </span>
          <span className="text-xs text-muted-foreground font-mono ml-2">
            {sortedEvents.length}/{events.length}
          </span>
        </div>

        <div className="flex-1 flex items-center gap-2 md:justify-end">
          {/* Search */}
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-background/50 border-border/50"
            />
          </div>

          {/* Threat Filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border/50 overflow-hidden">
              {(["all", "high", "medium", "low"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterThreat(level)}
                  className={`px-2 py-1 text-xs font-mono transition-colors ${
                    filterThreat === level
                      ? level === "high"
                        ? "bg-destructive/20 text-destructive"
                        : level === "medium"
                        ? "bg-warning/20 text-warning"
                        : level === "low"
                        ? "bg-success/20 text-success"
                        : "bg-primary/20 text-primary"
                      : "hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="h-[400px]">
        <div className="p-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wide">
            <div className="col-span-2">
              <SortButton field="timestamp">Timestamp</SortButton>
            </div>
            <div className="col-span-1">ID</div>
            <div className="col-span-3">
              <SortButton field="class">Detection</SortButton>
            </div>
            <div className="col-span-3">
              <SortButton field="confidence">Confidence</SortButton>
            </div>
            <div className="col-span-3">
              <SortButton field="threatScore">Threat Level</SortButton>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border/30">
            {sortedEvents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events match your filters</p>
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-12 gap-4 py-3 text-sm hover:bg-secondary/20 transition-colors group"
                >
                  <div className="col-span-2 font-mono text-primary">
                    {event.timestamp}
                  </div>
                  <div className="col-span-1 text-muted-foreground font-mono">
                    #{event.id.toString().padStart(3, "0")}
                  </div>
                  <div className="col-span-3">
                    <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-secondary/50 text-foreground font-medium uppercase text-xs">
                      {event.class}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success rounded-full transition-all"
                          style={{ width: `${event.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-success w-12">
                        {(event.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${getThreatBg(event.threatScore)} ${getThreatColor(event.threatScore)}`}>
                      {getThreatIcon(event.threatScore)}
                      <span className="font-mono text-xs font-bold">
                        {event.threatScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-secondary/50 to-secondary/20 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span>{events.length} TOTAL EVENTS</span>
          <span className="text-destructive">{events.filter(e => e.threatScore >= 70).length} HIGH</span>
          <span className="text-warning">{events.filter(e => e.threatScore >= 40 && e.threatScore < 70).length} MEDIUM</span>
          <span className="text-success">{events.filter(e => e.threatScore < 40).length} LOW</span>
        </div>
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