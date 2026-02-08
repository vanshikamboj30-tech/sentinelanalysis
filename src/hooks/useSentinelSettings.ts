import { useState, useEffect } from "react";
import { SentinelSettings } from "@/types/sentinel";

const DEFAULT_SETTINGS: SentinelSettings = {
  detectionSensitivity: 50,
  frameProcessingInterval: 2000,
  alertThreshold: 70,
  recordingDuration: 60,
  playbackSpeed: 1,
  autoSendEmail: true,
  emailRecipient: "joshivaibhavjoc@gmail.com",
};

const STORAGE_KEY = "sentinel-settings";

export const useSentinelSettings = () => {
  const [settings, setSettings] = useState<SentinelSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Partial<SentinelSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  };

  return { settings, updateSettings, resetSettings, isLoaded };
};
