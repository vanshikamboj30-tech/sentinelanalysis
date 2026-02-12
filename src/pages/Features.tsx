import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, AlertTriangle, Brain, Activity, Target, Shield, Eye, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface Feature {
  icon: React.ReactNode;
  title: string;
  shortDesc: string;
  fullDesc: string;
  specs: string[];
}

const Features = () => {
  const features: Feature[] = [
    {
      icon: <Video className="w-8 h-8" />,
      title: "Real-Time Object Detection",
      shortDesc: "YOLOv8-powered detection with ByteTrack tracking",
      fullDesc: "Our system uses YOLOv8n, a state-of-the-art object detection model, combined with ByteTrack for persistent multi-object tracking. This enables real-time identification and tracking of people, vehicles, and other objects with high accuracy and minimal latency.",
      specs: [
        "YOLOv8n neural network for fast inference",
        "ByteTrack algorithm for object persistence",
        "Tracks: Person, Car, Truck, Bus, Motorcycle, Bicycle",
        "30+ FPS processing on standard hardware",
        "Automatic bounding box annotation"
      ]
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Intelligent Threat Scoring",
      shortDesc: "Advanced algorithm for risk assessment",
      fullDesc: "Each detected object is assigned a dynamic threat score (0-100) based on multiple factors including position, movement patterns, and behavior. The system monitors Area of Interest (central 60% of frame) and detects loitering behavior to identify potential security risks.",
      specs: [
        "0-100 threat score calculation",
        "Area of Interest (AOI) monitoring",
        "Loitering detection algorithm",
        "Movement pattern analysis",
        "Confidence-weighted scoring",
        "Automatic high-threat alerts (70+)"
      ]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      shortDesc: "OpenAI-powered intelligent insights",
      fullDesc: "Integrated with OpenAI's GPT-4o model, our Neural Core provides natural language understanding of surveillance data. Ask questions about events, get threat summaries, and receive intelligent recommendations based on detected patterns. OpenAI handles reasoning and interpretation while computer vision models handle raw detection.",
      specs: [
        "OpenAI GPT-4o integration",
        "Natural language query interface",
        "Context-aware responses",
        "Event log interpretation",
        "Threat pattern recognition",
        "Actionable security recommendations"
      ]
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Live System Monitoring",
      shortDesc: "Real-time health and performance metrics",
      fullDesc: "Continuous monitoring of system resources ensures optimal performance. Track CPU and RAM usage in real-time, with automatic status indicators showing system health. Never miss a beat with our comprehensive monitoring dashboard.",
      specs: [
        "Real-time CPU monitoring",
        "RAM usage tracking",
        "System health indicators",
        "Performance optimization alerts",
        "Automatic resource management",
        "1-second update intervals"
      ]
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Precision Tracking",
      shortDesc: "Persistent object tracking across frames",
      fullDesc: "ByteTrack ensures objects maintain consistent IDs throughout the video, even during occlusions or rapid movements. Track individual subjects across the entire surveillance footage with unprecedented accuracy.",
      specs: [
        "Unique ID assignment per object",
        "Occlusion handling",
        "Cross-frame persistence",
        "Movement history logging",
        "Speed calculation",
        "Path prediction"
      ]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Security Event Logging",
      shortDesc: "Comprehensive event recording system",
      fullDesc: "Every detection is logged with precise timestamps, confidence scores, and threat levels. Review historical events, filter by threat level, and export logs for compliance and security audits.",
      specs: [
        "Timestamp precision (MM:SS:FF)",
        "Confidence percentage logging",
        "Threat score recording",
        "Event classification",
        "High-threat event highlighting",
        "Exportable event data"
      ]
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Visual Annotation",
      shortDesc: "Real-time video markup and labeling",
      fullDesc: "Processed videos feature bounding boxes, tracking IDs, and class labels overlaid directly on the footage. Visual scanning effects and threat indicators provide immediate situational awareness.",
      specs: [
        "Automatic bounding box drawing",
        "Track ID labeling",
        "Object class display",
        "Scanning line animation",
        "Color-coded indicators",
        "Recording status overlay"
      ]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "High-Speed Processing",
      shortDesc: "Optimized for real-time performance",
      fullDesc: "Leveraging GPU acceleration and optimized algorithms, Sentinel AI processes video feeds with minimal latency. Suitable for live feeds or batch processing of recorded footage.",
      specs: [
        "GPU-accelerated inference",
        "Optimized frame processing",
        "Multi-threaded architecture",
        "Minimal latency (<100ms)",
        "Batch processing support",
        "Scalable architecture"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-2xl font-display font-bold text-glow-primary">SENTINEL AI</span>
          </Link>
          <Link to="/app">
            <Button className="bg-primary text-primary-foreground font-display">
              LAUNCH SYSTEM
            </Button>
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-glow-primary">
            SYSTEM FEATURES
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the advanced capabilities that power Sentinel AI's surveillance and threat detection system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 bg-card border-border hover:border-primary/50 transition-all group">
              <div className="p-4 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {feature.shortDesc}
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full font-display">
                    VIEW DETAILS
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <DialogTitle className="font-display text-2xl">
                        {feature.title}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-foreground leading-relaxed">
                      {feature.fullDesc}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-6">
                    <h4 className="font-display font-semibold text-lg mb-4">Technical Specifications</h4>
                    <ul className="space-y-2">
                      {feature.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                          <span className="text-sm text-muted-foreground">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 bg-secondary/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            READY TO EXPERIENCE IT?
          </h2>
          <p className="text-muted-foreground mb-8">
            Upload your surveillance video and see these features in action.
          </p>
          <Link to="/app">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-display">
              START ANALYSIS NOW
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

export default Features;
