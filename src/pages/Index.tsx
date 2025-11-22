import { useState } from "react";
import UploadView from "@/components/sentinel/UploadView";
import ProcessingView from "@/components/sentinel/ProcessingView";
import DashboardView from "@/components/sentinel/DashboardView";
import { VideoAnalysis } from "@/types/sentinel";
import axios from "axios";
import { toast } from "sonner";

type View = "upload" | "processing" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("upload");
  const [analysisData, setAnalysisData] = useState<VideoAnalysis | null>(null);

  const handleVideoUpload = async (file: File) => {
    setCurrentView("processing");
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<VideoAnalysis>(
        "http://localhost:8000/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAnalysisData(response.data);
      setCurrentView("dashboard");
      toast.success("Video analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze video. Make sure the backend is running on http://localhost:8000");
      setCurrentView("upload");
    }
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
