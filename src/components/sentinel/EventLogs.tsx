import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Terminal, Search, Filter, ArrowUpDown, AlertTriangle, Shield, CheckCircle2, Zap, Brain, ChevronDown, ChevronUp, MapPin, Users, Package } from "lucide-react";
import { DetectionEvent } from "@/types/sentinel";

interface EventLogsProps {
  events: DetectionEvent[];
}

type SortField = "timestamp" | "class" | "confidence" | "threatScore";
type SortOrder = "asc" | "desc";

const CATEGORY_ICONS: Record<string, string> = {
  person: "👤",
  vehicle: "🚗",
  carried_object: "🎒",
  weapon: "⚠️",
  equipment: "📱",
  animal: "🐕",
  misc: "📦",
};

const EventLogs = ({ events }: EventLogsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("threatScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterThreat, setFilterThreat] = useState<"all" | "high" | "medium" | "low">("all");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

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

  const getSeverityBadge = (severity?: string) => {
    const colors: Record<string, string> = {
      Critical: "bg-destructive text-destructive-foreground",
      High: "bg-destructive/80 text-destructive-foreground",
      Medium: "bg-warning/80 text-warning-foreground",
      Low: "bg-success/80 text-success-foreground",
    };
    if (!severity) return null;
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${colors[severity] || "bg-muted text-muted-foreground"}`}>
        {severity}
      </span>
    );
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.timestamp.includes(searchQuery) ||
      (event.explanation || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.zone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.associatedObjects || []).join(" ").toLowerCase().includes(searchQuery.toLowerCase());

    let matchesThreat = true;
    if (filterThreat === "high") matchesThreat = event.threatScore >= 70;
    else if (filterThreat === "medium") matchesThreat = event.threatScore >= 40 && event.threatScore < 70;
    else if (filterThreat === "low") matchesThreat = event.threatScore < 40;

    return matchesSearch && matchesThreat;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "timestamp": comparison = a.timestamp.localeCompare(b.timestamp); break;
      case "class": comparison = a.class.localeCompare(b.class); break;
      case "confidence": comparison = a.confidence - b.confidence; break;
      case "threatScore": comparison = a.threatScore - b.threatScore; break;
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
      className={`flex items-center gap-1 hover:text-primary transition-colors ${sortField === field ? "text-primary" : ""}`}
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? "opacity-100" : "opacity-40"}`} />
    </button>
  );

  const hasAIInsights = events.some(e => e.explanation || e.severity);
  const uniqueClasses = [...new Set(events.map(e => e.class))];

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/80 to-secondary/40 border-b border-border px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold">EVENT LOGS</span>
          {hasAIInsights && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1">
              <Brain className="w-3 h-3" /> AI-Analyzed
            </span>
          )}
          <span className="text-xs text-muted-foreground font-mono ml-2">
            {sortedEvents.length}/{events.length}
          </span>
          {uniqueClasses.length > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {uniqueClasses.length} object types
            </span>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2 md:justify-end">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by class, zone, objects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-background/50 border-border/50"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border/50 overflow-hidden">
              {(["all", "high", "medium", "low"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterThreat(level)}
                  className={`px-2 py-1 text-xs font-mono transition-colors ${
                    filterThreat === level
                      ? level === "high" ? "bg-destructive/20 text-destructive"
                        : level === "medium" ? "bg-warning/20 text-warning"
                        : level === "low" ? "bg-success/20 text-success"
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
          <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border text-xs font-mono text-muted-foreground font-semibold uppercase tracking-wide">
            <div className="col-span-2">
              <SortButton field="timestamp">Timestamp</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="class">Detection</SortButton>
            </div>
            <div className="col-span-2">Zone</div>
            <div className="col-span-2">
              <SortButton field="confidence">Confidence</SortButton>
            </div>
            <div className="col-span-2">
              <SortButton field="threatScore">Threat</SortButton>
            </div>
            <div className="col-span-2">Severity</div>
          </div>

          <div className="divide-y divide-border/30">
            {sortedEvents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events match your filters</p>
              </div>
            ) : (
              sortedEvents.map((event) => (
                <div key={event.id}>
                  <div
                    className="grid grid-cols-12 gap-4 py-3 text-sm hover:bg-secondary/20 transition-colors group cursor-pointer"
                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                  >
                    <div className="col-span-2 font-mono text-primary text-xs">
                      {event.timestamp}
                    </div>
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary/50 text-foreground font-medium uppercase text-xs">
                        <span>{CATEGORY_ICONS[event.category || "misc"] || "📦"}</span>
                        {event.class}
                      </span>
                      {event.associatedObjects && event.associatedObjects.length > 0 && (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          +{event.associatedObjects.length}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        event.zoneId === "restricted" ? "bg-destructive/10 text-destructive"
                          : event.zoneId === "perimeter" ? "bg-warning/10 text-warning"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}>
                        <MapPin className="w-3 h-3 inline mr-0.5" />
                        {event.zone || "Public"}
                      </span>
                    </div>
                    <div className="col-span-2">
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
                    <div className="col-span-2">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${getThreatBg(event.threatScore)} ${getThreatColor(event.threatScore)}`}>
                        {getThreatIcon(event.threatScore)}
                        <span className="font-mono text-xs font-bold">{event.threatScore}/100</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      {getSeverityBadge(event.severity)}
                      {(event.explanation || event.associatedObjects?.length) && (
                        expandedEvent === event.id
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Row */}
                  {expandedEvent === event.id && (
                    <div className="px-4 pb-3 ml-8 border-l-2 border-primary/30">
                      <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                        {/* Associated Objects */}
                        {event.associatedObjects && event.associatedObjects.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              <span className="text-primary font-semibold">Nearby Objects: </span>
                              {event.associatedObjects.map((obj, i) => (
                                <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-secondary/50 text-foreground text-[10px] mr-1">
                                  {obj}
                                </span>
                              ))}
                            </span>
                          </div>
                        )}
                        {/* Behavior */}
                        {(event.behavior || event.behaviorPattern) && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-warning shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              <span className="text-warning font-semibold">Behavior: </span>
                              {event.behavior || event.behaviorPattern}
                              {event.speed !== undefined && (
                                <span className="ml-2 font-mono text-[10px]">Speed: {event.speed} px/f</span>
                              )}
                            </span>
                          </div>
                        )}
                        {/* Zone */}
                        {event.zone && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              <span className="text-primary font-semibold">Zone: </span>
                              {event.zone}
                            </span>
                          </div>
                        )}
                        {/* AI Explanation */}
                        {event.explanation && (
                          <div className="flex items-start gap-2">
                            <Brain className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              <span className="text-primary font-semibold">AI Explanation: </span>
                              {event.explanation}
                            </p>
                          </div>
                        )}
                        {/* Context Flags */}
                        {event.contextFlags && event.contextFlags.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {event.contextFlags.map((flag, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                        {/* Recommended Action */}
                        {event.recommendedAction && (
                          <div className="flex items-start gap-2">
                            <Shield className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              <span className="text-success font-semibold">Action: </span>
                              {event.recommendedAction}
                            </p>
                          </div>
                        )}
                        {event.aiConfidence !== undefined && event.aiConfidence > 0 && (
                          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              AI Confidence: {(event.aiConfidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-3 bg-gradient-to-r from-secondary/50 to-secondary/20 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <span>{events.length} TOTAL</span>
          <span className="text-destructive">{events.filter(e => e.threatScore >= 70).length} HIGH</span>
          <span className="text-warning">{events.filter(e => e.threatScore >= 40 && e.threatScore < 70).length} MED</span>
          <span className="text-success">{events.filter(e => e.threatScore < 40).length} LOW</span>
          <span className="text-muted-foreground">|</span>
          <span>{uniqueClasses.length} CLASSES</span>
        </div>
        <div className="flex items-center gap-2">
          {hasAIInsights && (
            <span className="text-[10px] font-mono text-primary mr-2">OpenAI ANALYZED</span>
          )}
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">MONITORING</span>
        </div>
      </div>
    </Card>
  );
};

export default EventLogs;
