import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Video, Brain, Activity, ArrowRight, Eye, Settings, FileText, BarChart3 } from "lucide-react";
import SystemHealth from "@/components/sentinel/SystemHealth";

const FrontPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary glow-primary" />
            <h1 className="font-display text-6xl font-bold text-glow-primary">
              SENTINEL AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl mx-auto">
            Military-Grade Autonomous Surveillance Intelligence System
          </p>
          <div className="mt-6 flex justify-center">
            <SystemHealth />
          </div>
        </header>

        {/* System Status */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-card border-border p-6 hover:glow-primary transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Video className="w-8 h-8 text-primary" />
              <h3 className="font-display text-lg font-semibold">Real-Time Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced YOLOv8 object detection with ByteTrack multi-object tracking capabilities
            </p>
          </Card>

          <Card className="bg-card border-border p-6 hover:glow-primary transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-primary" />
              <h3 className="font-display text-lg font-semibold">AI Intelligence</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              OpenAI-powered analytical engine for threat assessment and behavioral analysis
            </p>
          </Card>

          <Card className="bg-card border-border p-6 hover:glow-primary transition-all">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-8 h-8 text-primary" />
              <h3 className="font-display text-lg font-semibold">Threat Scoring</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Dynamic threat calculation based on AOI breach, loitering detection, and confidence metrics
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-12">
          <Card className="bg-card border-primary/50 p-12 max-w-4xl mx-auto glow-primary">
            <Eye className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
            <h2 className="font-display text-3xl font-bold mb-4">
              Begin Mission Analysis
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Upload surveillance footage for comprehensive threat detection, behavioral tracking, 
              and AI-powered intelligence assessment
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/analyze">
                <Button size="lg" className="font-display text-lg px-8 glow-primary group">
                  VIDEO ANALYSIS
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/live">
                <Button size="lg" variant="outline" className="font-display text-lg px-8">
                  LIVE FEED
                </Button>
              </Link>
              <Link to="/analytics">
                <Button size="lg" variant="outline" className="font-display text-lg px-8">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  ANALYTICS
                </Button>
              </Link>
              <Link to="/chat">
                <Button size="lg" variant="outline" className="font-display text-lg px-8">
                  AI ASSISTANT
                </Button>
              </Link>
            </div>
            
            {/* Secondary Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-border">
              <Link to="/reports">
                <Button variant="ghost" className="font-display">
                  <FileText className="w-4 h-4 mr-2" />
                  VIEW REPORTS
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost" className="font-display">
                  <Settings className="w-4 h-4 mr-2" />
                  SETTINGS
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Additional Navigation */}
        <div className="text-center">
          <Link to="/features">
            <Button variant="outline" className="font-display">
              View System Capabilities
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            SENTINEL AI v2.0 • Autonomous Surveillance Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FrontPage;
