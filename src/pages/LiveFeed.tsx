import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Video, VideoOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";

const LiveFeed = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<Array<{ time: string; class: string; threat: number }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { requestPermission, sendAlert } = useAlertNotifications();

  useEffect(() => {
    requestPermission();
    return () => {
      stopStream();
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        toast.success("Live feed started");
        
        // Simulate periodic detections for demonstration
        const interval = setInterval(() => {
          const classes = ["person", "car", "bicycle"];
          const randomClass = classes[Math.floor(Math.random() * classes.length)];
          const threatScore = Math.floor(Math.random() * 100);
          
          const detection = {
            time: new Date().toLocaleTimeString(),
            class: randomClass,
            threat: threatScore,
          };
          
          setDetections(prev => [detection, ...prev].slice(0, 10));
          
          if (threatScore > 70) {
            sendAlert(`High threat detected: ${randomClass} (${threatScore})`, "danger");
          }
        }, 5000);

        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Failed to access camera. Please grant camera permissions.");
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    toast.info("Live feed stopped");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
              LIVE SURVEILLANCE FEED
            </h1>
            <p className="text-muted-foreground">Real-time camera monitoring and threat detection</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="font-display">
              <Home className="w-4 h-4 mr-2" />
              HOME
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <Card className="lg:col-span-2 p-6 bg-card border-border">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {!isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center">
                    <VideoOff className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera feed inactive</p>
                  </div>
                </div>
              )}

              {isStreaming && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-destructive/90 text-destructive-foreground px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-display">LIVE</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4">
              {!isStreaming ? (
                <Button onClick={startStream} className="flex-1 font-display">
                  <Video className="w-4 h-4 mr-2" />
                  START FEED
                </Button>
              ) : (
                <Button onClick={stopStream} variant="destructive" className="flex-1 font-display">
                  <VideoOff className="w-4 h-4 mr-2" />
                  STOP FEED
                </Button>
              )}
            </div>
          </Card>

          {/* Detections Log */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              LIVE DETECTIONS
            </h2>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {detections.length === 0 ? (
                <p className="text-muted-foreground text-sm">No detections yet</p>
              ) : (
                detections.map((detection, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      detection.threat > 70
                        ? "bg-destructive/10 border-destructive"
                        : detection.threat > 40
                        ? "bg-warning/10 border-warning"
                        : "bg-success/10 border-success"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-sm uppercase">{detection.class}</span>
                      <span className="text-xs text-muted-foreground font-mono">{detection.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Threat Level</span>
                      <span
                        className={`text-sm font-display font-bold ${
                          detection.threat > 70
                            ? "text-destructive"
                            : detection.threat > 40
                            ? "text-warning"
                            : "text-success"
                        }`}
                      >
                        {detection.threat}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;
