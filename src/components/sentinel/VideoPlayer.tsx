import { Card } from "@/components/ui/card";
import { Video, Maximize2, Volume2, AlertCircle } from "lucide-react";
import { forwardRef, useState } from "react";
import { resolveVideoUrl } from "@/lib/api";

interface VideoPlayerProps {
  videoUrl: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ videoUrl, videoRef }, ref) => {
    const actualRef = videoRef || (ref as React.RefObject<HTMLVideoElement>);
    const [isHovered, setIsHovered] = useState(false);
    const [hasError, setHasError] = useState(false);
    const resolvedUrl = resolveVideoUrl(videoUrl);

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
              <div className={`w-2 h-2 rounded-full ${hasError ? 'bg-destructive' : 'bg-primary'} animate-pulse`} />
              <span className="text-xs font-mono text-muted-foreground">
                {hasError ? 'ERROR' : 'READY'}
              </span>
            </div>
          </div>
        </div>

        {/* Video Container */}
        <div className="aspect-video bg-black relative">
          {hasError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <AlertCircle className="w-12 h-12 text-destructive/60" />
              <p className="text-sm font-mono">Failed to load video</p>
              <p className="text-xs text-muted-foreground/60 max-w-xs text-center">
                Make sure the backend is running and accessible
              </p>
            </div>
          ) : (
            <video
              ref={actualRef}
              src={resolvedUrl}
              className="w-full h-full object-contain"
              controls
              crossOrigin="anonymous"
              onError={() => setHasError(true)}
              onLoadedData={() => setHasError(false)}
            />
          )}
          
          {/* Scanning effect overlay */}
          {!hasError && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60 animate-scan" />
            </div>
          )}

          {/* Corner brackets */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/50" />
            <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-primary/50" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-primary/50" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-primary/50" />
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