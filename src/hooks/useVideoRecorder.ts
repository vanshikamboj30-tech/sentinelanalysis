import { useState, useRef, useCallback } from "react";

interface RecordedFrame {
  dataUrl: string;
  timestamp: number;
}

export const useVideoRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState<RecordedFrame[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(() => {
    setRecordedFrames([]);
    setRecordingDuration(0);
    startTimeRef.current = Date.now();
    setIsRecording(true);

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const addFrame = useCallback((dataUrl: string) => {
    if (isRecording) {
      setRecordedFrames((prev) => [
        ...prev,
        { dataUrl, timestamp: Date.now() },
      ]);
    }
  }, [isRecording]);

  const compileToVideo = useCallback(async (): Promise<Blob | null> => {
    if (recordedFrames.length === 0) return null;

    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Load first frame to get dimensions
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Use MediaRecorder for video compilation
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm;codecs=vp9",
          videoBitsPerSecond: 5000000,
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          resolve(blob);
        };

        mediaRecorder.start();

        // Draw each frame
        let frameIndex = 0;
        const drawFrame = () => {
          if (frameIndex >= recordedFrames.length) {
            setTimeout(() => mediaRecorder.stop(), 100);
            return;
          }

          const frameImg = new Image();
          frameImg.onload = () => {
            ctx.drawImage(frameImg, 0, 0);
            frameIndex++;
            // Calculate delay based on timestamps
            const delay = frameIndex < recordedFrames.length
              ? Math.max(33, (recordedFrames[frameIndex].timestamp - recordedFrames[frameIndex - 1].timestamp))
              : 33;
            setTimeout(drawFrame, delay);
          };
          frameImg.src = recordedFrames[frameIndex].dataUrl;
        };

        drawFrame();
      };
      img.src = recordedFrames[0].dataUrl;
    });
  }, [recordedFrames]);

  const downloadVideo = useCallback(async () => {
    const blob = await compileToVideo();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [compileToVideo]);

  return {
    isRecording,
    recordedFrames,
    recordingDuration,
    startRecording,
    stopRecording,
    addFrame,
    downloadVideo,
    compileToVideo,
  };
};
