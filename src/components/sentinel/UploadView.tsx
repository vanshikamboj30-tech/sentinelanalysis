import { useState, useCallback } from "react";
import { Upload, Video, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface UploadViewProps {
  onUpload: (file: File) => void;
}

const UploadView = ({ onUpload }: UploadViewProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === "video/mp4" || file.type === "video/quicktime")) {
      setSelectedFile(file);
      toast.success(`Video selected: ${file.name}`);
    } else {
      toast.error("Please upload a valid video file (.mp4 or .mov)");
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`Video selected: ${file.name}`);
    }
  }, []);

  const handleAnalyze = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      {/* Home Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="sm" className="font-display">
            <Home className="w-4 h-4 mr-2" />
            HOME
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 glow-primary mb-4">
            <Video className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-6xl font-display font-bold text-glow-primary">
            SENTINEL AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Neural-Powered Video Surveillance Platform
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-16 
            transition-all duration-300 cursor-pointer
            ${
              isDragging
                ? "border-primary bg-primary/5 glow-primary scale-105"
                : "border-border hover:border-primary/50 hover:bg-card"
            }
          `}
        >
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-6">
            <div
              className={`
              inline-flex items-center justify-center w-24 h-24 
              rounded-full bg-secondary transition-all duration-300
              ${isDragging ? "glow-primary scale-110" : ""}
            `}
            >
              <Upload
                className={`w-12 h-12 transition-colors ${
                  isDragging ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>

            {selectedFile ? (
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-primary">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  Drop video file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports MP4 and MOV formats
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {selectedFile && (
          <div className="flex justify-center">
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg px-12 py-6 rounded-xl glow-primary transition-all hover:scale-105"
            >
              INITIATE ANALYSIS
            </Button>
          </div>
        )}

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
          {[
            { label: "Object Detection", value: "YOLOv8" },
            { label: "Multi-Tracking", value: "ByteTrack" },
            { label: "AI Analysis", value: "OpenAI" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <p className="text-lg font-display font-semibold text-primary">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadView;
