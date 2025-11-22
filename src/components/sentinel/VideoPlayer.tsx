import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
  return (
    <Card className="bg-card border-border overflow-hidden h-full">
      <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <span className="font-display text-sm font-semibold">
            LIVE FEED
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">REC</span>
        </div>
      </div>
      <div className="aspect-video bg-black relative group">
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          autoPlay
          loop
        />
        {/* Scanning effect overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-scan" />
        </div>
      </div>
      <div className="px-4 py-3 bg-secondary/30 border-t border-border">
        <p className="text-xs font-mono text-muted-foreground">
          PROCESSED OUTPUT • YOLOv8 + ByteTrack
        </p>
      </div>
    </Card>
  );
};

export default VideoPlayer;
