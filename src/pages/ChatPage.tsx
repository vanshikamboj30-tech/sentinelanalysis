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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="sm" className="font-display">
            <Home className="w-4 h-4 mr-2" />
            HOME
          </Button>
        </Link>
      </div>

      <div className="fixed top-4 right-4 z-50">
        <Link to="/analyze">
          <Button variant="outline" size="sm" className="font-display">
            ANALYZE
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MessageSquare className="w-10 h-10 text-primary" />
            <h1 className="font-display text-4xl font-bold">
              AI INTELLIGENCE CONSOLE
            </h1>
          </div>
          <p className="text-muted-foreground font-mono">
            Query surveillance data with natural language
          </p>
        </header>

        <Card className="bg-card border-border max-w-5xl mx-auto p-6">
          <div className="mb-4 p-4 bg-secondary/30 border border-border rounded-lg">
            <p className="text-xs font-mono text-muted-foreground mb-2">
              DEMO MODE: Using placeholder event data
            </p>
            <p className="text-xs text-muted-foreground">
              Navigate to <Link to="/analyze" className="text-primary hover:underline">Analyze</Link> to 
              process actual surveillance footage and interact with real detection events.
            </p>
          </div>
          
          <ChatInterface events={demoEvents} />
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground font-mono">
            Ask questions like: "Show me high-threat events" or "Analyze behavior patterns"
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
