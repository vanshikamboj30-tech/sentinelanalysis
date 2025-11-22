import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, MessageSquare } from "lucide-react";
import ChatInterface from "@/components/sentinel/ChatInterface";
import { DetectionEvent } from "@/types/sentinel";

const ChatPage = () => {
  // Placeholder/demo event data for demonstration purposes
  const demoEvents: DetectionEvent[] = [
    {
      id: 1,
      timestamp: "00:00:15",
      class: "person",
      confidence: 0.92,
      threatScore: 45,
    },
    {
      id: 2,
      timestamp: "00:00:42",
      class: "car",
      confidence: 0.87,
      threatScore: 72,
    },
    {
      id: 3,
      timestamp: "00:01:08",
      class: "person",
      confidence: 0.89,
      threatScore: 65,
    },
    {
      id: 4,
      timestamp: "00:01:35",
      class: "truck",
      confidence: 0.94,
      threatScore: 38,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
              AI ASSISTANT
            </h1>
            <p className="text-muted-foreground">Discuss surveillance events and analysis with AI</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="font-display">
              <Home className="w-4 h-4 mr-2" />
              HOME
            </Button>
          </Link>
        </div>

        {/* Chat Interface */}
        <div className="h-[calc(100vh-200px)]">
          <ChatInterface events={[]} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
