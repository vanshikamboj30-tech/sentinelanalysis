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
  analysisId?: string;
  emailSent?: boolean;
}

export interface SystemHealth {
  cpu: number;
  ram: number;
}

export interface AnalysisReport {
  _id: string;
  video_filename: string;
  video_url: string;
  events: DetectionEvent[];
  stats: {
    totalDetections: number;
    highThreatEvents: number;
  };
  duration_seconds: number;
  total_events: number;
  high_threat_count: number;
  medium_threat_count: number;
  low_threat_count: number;
  created_at: string;
  status: string;
}

export interface SentinelSettings {
  detectionSensitivity: number; // 0-100
  frameProcessingInterval: number; // milliseconds
  alertThreshold: number; // threat score threshold for alerts
  recordingDuration: number; // seconds
  playbackSpeed: number; // 0.25, 0.5, 1, 1.5, 2
  autoSendEmail: boolean;
  emailRecipient: string;
}

export interface AnalyticsSummary {
  total_analyses: number;
  total_events: number;
  high_threat_events: number;
  total_alerts: number;
}

export interface ThreatDistribution {
  high: number;
  medium: number;
  low: number;
}
