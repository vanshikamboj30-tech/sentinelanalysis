export interface DetectionEvent {
  id: number;
  timestamp: string;
  class: string;
  confidence: number;
  threatScore: number;
}

export interface VideoAnalysis {
  videoUrl: string;
  events: DetectionEvent[];
  stats: {
    totalDetections: number;
    highThreatEvents: number;
  };
}

export interface SystemHealth {
  cpu: number;
  ram: number;
}
