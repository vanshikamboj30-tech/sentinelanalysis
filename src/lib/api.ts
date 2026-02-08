import axios from "axios";
import { AnalysisReport, AnalyticsSummary, ThreatDistribution } from "@/types/sentinel";

// Backend API base URL - change this if using a tunnel like ngrok
// For local development: http://localhost:8000
// For production: use your deployed backend URL
const getApiBase = () => {
  // Check if running on Lovable preview (not localhost)
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    // Return localStorage override if set, otherwise localhost (will fail with clear error)
    return localStorage.getItem('SENTINEL_API_URL') || 'http://localhost:8000';
  }
  return 'http://localhost:8000';
};

const API_BASE = getApiBase();

export const api = {
  // Health & Status
  async getHealth() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data as { cpu: number; ram: number };
  },

  async getStatus() {
    const response = await axios.get(`${API_BASE}/status`);
    return response.data as { database: boolean; email: boolean; gemini: boolean };
  },

  // Analytics
  async getAnalyticsSummary() {
    const response = await axios.get(`${API_BASE}/analytics/summary`);
    return response.data as {
      summary: AnalyticsSummary;
      threatDistribution: ThreatDistribution;
    };
  },

  async getRecentData() {
    const response = await axios.get(`${API_BASE}/analytics/recent`);
    return response.data as {
      analyses: AnalysisReport[];
      alerts: Array<{
        _id: string;
        events: Array<{ timestamp: string; class: string; threatScore: number }>;
        video_url: string;
        created_at: string;
        status: string;
      }>;
    };
  },

  // Reports
  async getReports(limit: number = 50) {
    const response = await axios.get(`${API_BASE}/reports?limit=${limit}`);
    return response.data as AnalysisReport[];
  },

  async getReport(id: string) {
    const response = await axios.get(`${API_BASE}/reports/${id}`);
    return response.data as AnalysisReport;
  },

  async resendReport(id: string, email?: string) {
    const response = await axios.post(`${API_BASE}/reports/${id}/resend`, { email });
    return response.data;
  },

  // Video Analysis
  async analyzeVideo(file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE}/analyze`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });

    return response.data;
  },

  // Live Feed
  async processFrame(frameData: string) {
    const response = await axios.post(`${API_BASE}/process-frame`, {
      frame: frameData,
    });
    return response.data;
  },

  // Alerts
  async sendAlert(events: Array<{ timestamp: string; class: string; threatScore: number }>, videoUrl: string, email?: string) {
    const response = await axios.post(`${API_BASE}/send-alert`, {
      events,
      videoUrl,
      email,
      sendEmail: true,
    });
    return response.data;
  },

  // Chat
  async chat(query: string, logs: Array<{ timestamp: string; class: string; threatScore: number }>) {
    const response = await axios.post(`${API_BASE}/chat`, { query, logs });
    return response.data as { reply: string };
  },
};
