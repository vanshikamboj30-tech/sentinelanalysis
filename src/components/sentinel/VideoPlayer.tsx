import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";
import { forwardRef } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoUrl, videoRef }, ref) => {
    // Use the passed ref or forwarded ref
    const actualRef = videoRef || (ref as React.RefObject<HTMLVideoElement>);

    return (
      <Card className="bg-card border-border overflow-hidden h-full">
        <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-semibold">
              PROCESSED VIDEO
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">READY</span>
          </div>
        </div>
        <div className="aspect-video bg-black relative group">
          <video
            ref={actualRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            crossOrigin="anonymous"
            onError={(e) => {
              console.error("Video error:", e);
            }}
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
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
