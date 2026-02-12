export interface DetectionEvent {
  id: number;
  timestamp: string;
  class: string;
  confidence: number;
  threatScore: number;
  severity?: "Low" | "Medium" | "High" | "Critical";
  explanation?: string;
  behaviorPattern?: "Transient" | "Loitering" | "Repeated" | "Evasive" | "Normal";
  recommendedAction?: string;
  aiConfidence?: number;
}

export interface AIAnalysis {
  analyzed_events: Array<{
    event_id: number;
    severity: string;
    explanation: string;
    behavior_pattern: string;
    recommended_action: string;
    ai_confidence: number;
  }>;
  overall_assessment: string;
  pattern_insights: string[];
}

export interface AIReportContent {
  incident_summary: string;
  key_findings: string[];
  behavioral_analysis: string;
  risk_level: string;
  recommendations: string[];
}

export interface VideoAnalysis {
  videoUrl: string;
  events: DetectionEvent[];
  stats: {
    totalDetections: number;
    highThreatEvents: number;
    overallAssessment?: string;
    patternInsights?: string[];
    criticalEvents?: number;
  };
  analysisId?: string;
  emailSent?: boolean;
  alertSent?: boolean;
  aiAnalysis?: AIAnalysis;
  reportContent?: AIReportContent;
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
    overallAssessment?: string;
    patternInsights?: string[];
    criticalEvents?: number;
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
  detectionSensitivity: number;
  frameProcessingInterval: number;
  alertThreshold: number;
  recordingDuration: number;
  playbackSpeed: number;
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
