import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Brain, Video, Activity, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary">ADVANCED SURVEILLANCE SYSTEM</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-glow-primary">
            SENTINEL AI
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Real-time video analysis powered by YOLOv8 and AI. Detect, track, and analyze threats with military-grade precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/app">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display w-full sm:w-auto">
                LAUNCH SYSTEM
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="font-display w-full sm:w-auto">
                VIEW FEATURES
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
          CORE CAPABILITIES
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all glow-primary hover:scale-105">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold mb-2">Real-Time Detection</h3>
            <p className="text-sm text-muted-foreground">
              YOLOv8-powered object detection with ByteTrack for continuous tracking
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all glow-primary hover:scale-105">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold mb-2">Threat Assessment</h3>
            <p className="text-sm text-muted-foreground">
              Advanced scoring algorithm analyzing movement patterns and behavior
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all glow-primary hover:scale-105">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold mb-2">AI Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Gemini AI integration for intelligent surveillance data interpretation
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all glow-primary hover:scale-105">
            <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold mb-2">Live Monitoring</h3>
            <p className="text-sm text-muted-foreground">
              Real-time system health and event logging with instant alerts
            </p>
          </Card>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="px-4 py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            TECHNICAL SPECIFICATIONS
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h4 className="font-display font-semibold mb-1">Detection Engine</h4>
                  <p className="text-sm text-muted-foreground">YOLOv8n with ByteTrack multi-object tracking</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h4 className="font-display font-semibold mb-1">AI Model</h4>
                  <p className="text-sm text-muted-foreground">Google Gemini 2.0 Flash for analysis</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h4 className="font-display font-semibold mb-1">Tracked Objects</h4>
                  <p className="text-sm text-muted-foreground">Person, Car, Truck, Bus, Motorcycle, Bicycle</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h4 className="font-display font-semibold mb-1">Threat Detection</h4>
                  <p className="text-sm text-muted-foreground">Area of Interest monitoring with loitering detection</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h4 className="font-display font-semibold mb-1">Processing</h4>
                  <p className="text-sm text-muted-foreground">Real-time video annotation and event logging</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h4 className="font-display font-semibold mb-1">Monitoring</h4>
                  <p className="text-sm text-muted-foreground">Live CPU/RAM metrics and system health status</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 max-w-4xl mx-auto text-center">
        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            READY TO DEPLOY?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your surveillance footage and let our AI analyze it in real-time with advanced threat detection.
          </p>
          <Link to="/app">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display">
              START ANALYSIS
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground font-mono">
          © 2024 SENTINEL AI • NEURAL COMMAND CENTER • ALL SYSTEMS OPERATIONAL
        </div>
      </footer>
    </div>
  );
};

export default Landing;
