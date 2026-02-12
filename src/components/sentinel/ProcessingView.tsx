import { Loader2 } from "lucide-react";

const ProcessingView = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-8">
        {/* Animated Spinner */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute w-32 h-32 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="absolute w-32 h-32 rounded-full border-4 border-primary/40 animate-pulse-slow" />
          <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center glow-primary">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        </div>

        {/* Processing Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-display font-bold text-glow-primary animate-pulse">
            PROCESSING NEURAL NETWORKS
          </h2>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2 max-w-md mx-auto">
          {[
            "Initializing YOLOv8 detection model",
            "Loading ByteTrack multi-object tracker",
            "Processing video frames",
            "Analyzing threat patterns",
            "Running OpenAI analysis on detections",
            "Generating AI-powered insights",
          ].map((message, index) => (
            <div
              key={index}
              className="text-left text-sm font-mono text-muted-foreground animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            >
              <span className="text-primary">›</span> {message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingView;
