import { useState } from "react";
import UploadView from "@/components/sentinel/UploadView";
import ProcessingView from "@/components/sentinel/ProcessingView";
import DashboardView from "@/components/sentinel/DashboardView";
import { VideoAnalysis } from "@/types/sentinel";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Home, Shield, Cpu } from "lucide-react";

type View = "upload" | "processing" | "dashboard";

const Analyze = () => {
  const [currentView, setCurrentView] = useState<View>("upload");
  const [analysisData, setAnalysisData] = useState<VideoAnalysis | null>(null);
  

  const handleVideoUpload = async (file: File) => {
    setCurrentView("processing");
    
    try {
      const response = await api.analyzeVideo(file);
      setAnalysisData(response);
      setCurrentView("dashboard");
      toast.success("Video analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      const isNetworkError = error instanceof Error && error.message.includes('Network Error');
      if (isNetworkError && !window.location.hostname.includes('localhost')) {
        toast.error("Cannot connect to backend. Set your backend URL in Settings or run the frontend locally.", {
          duration: 8000,
        });
      } else {
        toast.error("Failed to analyze video. Make sure the backend is running.");
      }
      setCurrentView("upload");
    }
  };

  const handleReset = () => {
    setCurrentView("upload");
    setAnalysisData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cyber grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-primary tracking-tight">
                  VIDEO ANALYSIS
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Cpu className="w-3 h-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground font-mono">
                    YOLOV8 • BYTETRACK • OPENAI
                  </p>
                </div>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="font-display border-border/50 hover:border-primary/50 hover:bg-primary/5">
                <Home className="w-4 h-4 mr-2" />
                HOME
              </Button>
            </Link>
          </div>

          {currentView === "upload" && <UploadView onUpload={handleVideoUpload} />}
          {currentView === "processing" && <ProcessingView />}
          {currentView === "dashboard" && analysisData && (
            <DashboardView data={analysisData} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyze;
