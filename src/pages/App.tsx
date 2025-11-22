import { useState } from "react";
import UploadView from "@/components/sentinel/UploadView";
import ProcessingView from "@/components/sentinel/ProcessingView";
import DashboardView from "@/components/sentinel/DashboardView";
import { VideoAnalysis } from "@/types/sentinel";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

type View = "upload" | "processing" | "dashboard";

const App = () => {
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
      {/* Home button for navigation */}
      {currentView !== "upload" && (
        <div className="fixed top-4 left-4 z-50">
          <Link to="/">
            <Button variant="outline" size="sm" className="font-display">
              <Home className="w-4 h-4 mr-2" />
              HOME
            </Button>
          </Link>
        </div>
      )}

      {currentView === "upload" && <UploadView onUpload={handleVideoUpload} />}
      {currentView === "processing" && <ProcessingView />}
      {currentView === "dashboard" && analysisData && (
        <DashboardView data={analysisData} onReset={handleReset} />
      )}
    </main>
  );
};

export default App;
