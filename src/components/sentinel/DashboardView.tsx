import { useState } from "react";
import { VideoAnalysis } from "@/types/sentinel";
import VideoPlayer from "./VideoPlayer";
import StatsCard from "./StatsCard";
import ChatInterface from "./ChatInterface";
import EventLogs from "./EventLogs";
import SystemHealth from "./SystemHealth";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface DashboardViewProps {
  data: VideoAnalysis;
  onReset: () => void;
}

const DashboardView = ({ data, onReset }: DashboardViewProps) => {
  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-glow-primary">
            SENTINEL AI
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Neural Command Center
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SystemHealth />
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="font-display"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            NEW ANALYSIS
          </Button>
        </div>
      </header>

      {/* Bento Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Main Video Feed - 8/12 width on large screens */}
        <div className="lg:col-span-8">
          <VideoPlayer videoUrl={data.videoUrl} />
        </div>

        {/* Stats Cards - 4/12 width on large screens, stacked */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <StatsCard
            title="HIGH THREAT EVENTS"
            value={data.stats.highThreatEvents}
            variant="danger"
            description="Requires immediate attention"
          />
          <StatsCard
            title="TOTAL DETECTIONS"
            value={data.stats.totalDetections}
            variant="warning"
            description="Objects tracked in video"
          />
        </div>

        {/* Neural Core Chat - 4/12 width */}
        <div className="lg:col-span-4">
          <ChatInterface events={data.events} />
        </div>

        {/* Event Logs - 8/12 width */}
        <div className="lg:col-span-8">
          <EventLogs events={data.events} />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
