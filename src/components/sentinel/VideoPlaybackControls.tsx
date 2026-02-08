import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, SkipBack, SkipForward, 
  ChevronLeft, ChevronRight, Maximize, Volume2, VolumeX
} from "lucide-react";

interface VideoPlaybackControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onFrameChange?: (currentTime: number) => void;
}

const VideoPlaybackControls = ({ videoRef, onFrameChange }: VideoPlaybackControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const video = videoRef.current;

  useEffect(() => {
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onFrameChange?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [video, onFrameChange]);

  const togglePlay = useCallback(() => {
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [video, isPlaying]);

  const seek = useCallback((time: number) => {
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, duration));
  }, [video, duration]);

  const stepFrame = useCallback((direction: "forward" | "backward") => {
    if (!video) return;
    const frameTime = 1 / 30; // Assuming 30fps
    const newTime = direction === "forward" 
      ? video.currentTime + frameTime 
      : video.currentTime - frameTime;
    video.currentTime = Math.max(0, Math.min(newTime, duration));
    video.pause();
    setIsPlaying(false);
  }, [video, duration]);

  const skip = useCallback((seconds: number) => {
    if (!video) return;
    seek(video.currentTime + seconds);
  }, [video, seek]);

  const changeSpeed = useCallback((speed: number) => {
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  }, [video]);

  const toggleMute = useCallback(() => {
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, [video]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const speedOptions = [0.25, 0.5, 1, 1.5, 2];

  return (
    <Card ref={containerRef} className="p-4 bg-card/80 backdrop-blur border-border">
      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          onValueChange={(value) => seek(value[0])}
          max={duration || 100}
          step={0.033}
          className="w-full"
        />
        <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Frame-by-frame backward */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => stepFrame("backward")}
            title="Previous frame"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Skip backward */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => skip(-5)}
            title="Skip 5s backward"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          {/* Play/Pause */}
          <Button
            size="icon"
            onClick={togglePlay}
            className="w-12 h-12"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Skip forward */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => skip(5)}
            title="Skip 5s forward"
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          {/* Frame-by-frame forward */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => stepFrame("forward")}
            title="Next frame"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Speed:</span>
          {speedOptions.map((speed) => (
            <Button
              key={speed}
              variant={playbackSpeed === speed ? "default" : "outline"}
              size="sm"
              onClick={() => changeSpeed(speed)}
              className="font-mono text-xs px-2 h-7"
            >
              {speed}x
            </Button>
          ))}
        </div>

        {/* Additional Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFullscreen}
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VideoPlaybackControls;
