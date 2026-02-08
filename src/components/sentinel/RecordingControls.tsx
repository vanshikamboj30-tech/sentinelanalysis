import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Circle, Square, Download, Clock, Disc
} from "lucide-react";
import { toast } from "sonner";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";

interface RecordingControlsProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  maxDuration: number; // seconds
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

const RecordingControls = ({ 
  canvasRef, 
  maxDuration, 
  onRecordingStart, 
  onRecordingStop 
}: RecordingControlsProps) => {
  const { 
    isRecording, 
    recordedFrames, 
    recordingDuration, 
    startRecording, 
    stopRecording, 
    addFrame,
    downloadVideo 
  } = useVideoRecorder();
  
  const [isCompiling, setIsCompiling] = useState(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-stop when max duration reached
  useEffect(() => {
    if (isRecording && recordingDuration >= maxDuration) {
      handleStopRecording();
      toast.info(`Recording stopped: Max duration (${maxDuration}s) reached`);
    }
  }, [isRecording, recordingDuration, maxDuration]);

  // Capture frames while recording
  useEffect(() => {
    if (isRecording && canvasRef.current) {
      captureIntervalRef.current = setInterval(() => {
        if (canvasRef.current) {
          const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8);
          addFrame(dataUrl);
        }
      }, 100); // Capture at ~10fps for recording
    }

    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
    };
  }, [isRecording, canvasRef, addFrame]);

  const handleStartRecording = useCallback(() => {
    startRecording();
    onRecordingStart?.();
    toast.success("Recording started");
  }, [startRecording, onRecordingStart]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    onRecordingStop?.();
    toast.success(`Recording stopped: ${recordedFrames.length} frames captured`);
  }, [stopRecording, onRecordingStop, recordedFrames.length]);

  const handleDownload = useCallback(async () => {
    if (recordedFrames.length === 0) {
      toast.error("No frames recorded");
      return;
    }

    setIsCompiling(true);
    toast.info("Compiling video...");

    try {
      await downloadVideo();
      toast.success("Video downloaded successfully");
    } catch (error) {
      console.error("Video compilation failed:", error);
      toast.error("Failed to compile video");
    } finally {
      setIsCompiling(false);
    }
  }, [recordedFrames.length, downloadVideo]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Disc className={`w-5 h-5 ${isRecording ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
          <span className="font-display text-sm font-semibold">RECORDING</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-mono">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={isRecording ? "text-destructive" : "text-muted-foreground"}>
            {formatDuration(recordingDuration)} / {formatDuration(maxDuration)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={(recordingDuration / maxDuration) * 100} 
        className="h-2 mb-4"
      />

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            onClick={handleStartRecording}
            variant="destructive"
            className="flex-1 font-display"
          >
            <Circle className="w-4 h-4 mr-2 fill-current" />
            START RECORDING
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            variant="outline"
            className="flex-1 font-display border-destructive text-destructive hover:bg-destructive/10"
          >
            <Square className="w-4 h-4 mr-2 fill-current" />
            STOP RECORDING
          </Button>
        )}

        <Button
          onClick={handleDownload}
          variant="outline"
          disabled={recordedFrames.length === 0 || isCompiling || isRecording}
          className="font-display"
        >
          {isCompiling ? (
            <>
              <Disc className="w-4 h-4 mr-2 animate-spin" />
              COMPILING...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              DOWNLOAD ({recordedFrames.length} frames)
            </>
          )}
        </Button>
      </div>

      {recordedFrames.length > 0 && !isRecording && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Video will be compiled as WebM format
        </p>
      )}
    </Card>
  );
};

export default RecordingControls;
