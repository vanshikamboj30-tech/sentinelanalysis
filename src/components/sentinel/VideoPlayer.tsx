import { Card } from "@/components/ui/card";
import { Video, Maximize2, Volume2 } from "lucide-react";
import { forwardRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoUrl, videoRef }, ref) => {
    const actualRef = videoRef || (ref as React.RefObject<HTMLVideoElement>);
    const [isHovered, setIsHovered] = useState(false);

    const handleFullscreen = () => {
      if (actualRef?.current) {
        if (actualRef.current.requestFullscreen) {
          actualRef.current.requestFullscreen();
        }
      }
    };

    return (
      <Card 
        className="bg-card border-border overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary/80 to-secondary/40 border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/20">
              <Video className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-sm font-semibold">
              PROCESSED VIDEO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleFullscreen}
              className="p-1.5 rounded hover:bg-secondary/80 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">READY</span>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="aspect-video bg-black relative">
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
            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60 animate-scan" />
          </div>

          {/* Corner brackets */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top-left */}
            <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
            {/* Top-right */}
            <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-primary/50" />
            {/* Bottom-left */}
            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-primary/50" />
            {/* Bottom-right */}
            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-primary/50" />
          </div>

          {/* Hover overlay with controls hint */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/80 text-xs font-mono">
              <Volume2 className="w-3 h-3" />
              <span>Use controls below for playback</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gradient-to-r from-secondary/50 to-secondary/20 border-t border-border flex items-center justify-between">
          <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            PROCESSED OUTPUT • YOLOv8 + ByteTrack
          </p>
          <p className="text-xs font-mono text-primary/70">
            AI ENHANCED
          </p>
        </div>
      </Card>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;