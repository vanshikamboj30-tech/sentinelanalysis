import { useState } from "react";
import UploadView from "@/components/sentinel/UploadView";
import ProcessingView from "@/components/sentinel/ProcessingView";
import DashboardView from "@/components/sentinel/DashboardView";
import { VideoAnalysis } from "@/types/sentinel";

type View = "upload" | "processing" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("upload");
  const [analysisData, setAnalysisData] = useState<VideoAnalysis | null>(null);

  const handleVideoUpload = async (file: File) => {
    setCurrentView("processing");
    
    // Simulate API call to backend
    // In production, this would call http://localhost:8000/analyze
    setTimeout(() => {
      // Mock data for demonstration
      const mockData: VideoAnalysis = {
        videoUrl: URL.createObjectURL(file),
        events: [
          {
            id: 1,
            timestamp: "00:00:12",
            class: "person",
            confidence: 0.95,
            threatScore: 75,
          },
          {
            id: 2,
            timestamp: "00:00:24",
            class: "car",
            confidence: 0.88,
            threatScore: 45,
          },
          {
            id: 3,
            timestamp: "00:00:36",
            class: "person",
            confidence: 0.92,
            threatScore: 85,
          },
        ],
        stats: {
          totalDetections: 3,
          highThreatEvents: 2,
        },
      };
      setAnalysisData(mockData);
      setCurrentView("dashboard");
    }, 3000);
  };

  const handleReset = () => {
    setCurrentView("upload");
    setAnalysisData(null);
  };

  return (
    <main className="min-h-screen bg-background">
      {currentView === "upload" && <UploadView onUpload={handleVideoUpload} />}
      {currentView === "processing" && <ProcessingView />}
      {currentView === "dashboard" && analysisData && (
        <DashboardView data={analysisData} onReset={handleReset} />
      )}
    </main>
  );
};

export default Index;
