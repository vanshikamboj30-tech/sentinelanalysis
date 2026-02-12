import axios from "axios";
import { AnalysisReport, AnalyticsSummary, ThreatDistribution } from "@/types/sentinel";

// Backend API base URL - change this if using a tunnel like ngrok
// For local development: http://localhost:8000
// For production: use your deployed backend URL
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('SENTINEL_API_URL');
    if (stored) return stored;
  }
  return 'http://localhost:8000';
};

const API_BASE = getApiBase();

// Allow runtime URL updates
export const setApiBaseUrl = (url: string) => {
  localStorage.setItem('SENTINEL_API_URL', url);
  window.location.reload();
};

export const getCurrentApiUrl = () => API_BASE;

// Resolve video URLs that may be relative paths from the backend
export const resolveVideoUrl = (url: string) => {
  if (!url) return '';
  // Already absolute URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  // Relative path — prepend API base
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const api = {
  // Health & Status
  async getHealth() {
    const response = await axios.get(`${API_BASE}/health`);
    return response.data as { cpu: number; ram: number };
  },

  async getStatus() {
    const response = await axios.get(`${API_BASE}/status`);
    return response.data as { database: boolean; email: boolean; openai: boolean };
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
