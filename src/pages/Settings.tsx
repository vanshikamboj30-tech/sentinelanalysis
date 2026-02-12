import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Home, Settings as SettingsIcon, Save, RotateCcw, Mail, Gauge, Clock, AlertTriangle, Video, Globe } from "lucide-react";
import { toast } from "sonner";
import { useSentinelSettings } from "@/hooks/useSentinelSettings";
import { api, setApiBaseUrl, getCurrentApiUrl } from "@/lib/api";

const Settings = () => {
  const { settings, updateSettings, resetSettings, isLoaded } = useSentinelSettings();
  const [systemStatus, setSystemStatus] = useState<{ database: boolean; email: boolean; openai: boolean } | null>(null);
  const [backendUrl, setBackendUrl] = useState(getCurrentApiUrl());

  useEffect(() => {
    api.getStatus()
      .then(setSystemStatus)
      .catch(() => setSystemStatus(null));
  }, []);

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  const handleReset = () => {
    resetSettings();
    toast.info("Settings reset to defaults");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
              SYSTEM SETTINGS
            </h1>
            <p className="text-muted-foreground">Configure detection, alerts, and recording parameters</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="font-display">
              <Home className="w-4 h-4 mr-2" />
              HOME
            </Button>
          </Link>
        </div>

        {/* System Status */}
        {systemStatus && (
          <Card className="p-4 mb-6 bg-card border-border">
            <div className="flex items-center gap-6 text-sm">
              <span className="font-display text-muted-foreground">SYSTEM STATUS:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.database ? 'bg-success' : 'bg-destructive'}`} />
                <span>Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.email ? 'bg-success' : 'bg-destructive'}`} />
                <span>Email</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${systemStatus.openai ? 'bg-success' : 'bg-destructive'}`} />
                <span>OpenAI</span>
              </div>
            </div>
          </Card>
        )}

        <div className="grid gap-6">
          {/* Backend Connection */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold">Backend Connection</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backendUrl" className="text-sm">Backend API URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="backendUrl"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setApiBaseUrl(backendUrl);
                      toast.success("Backend URL updated. Reloading...");
                    }}
                  >
                    Connect
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Default: http://localhost:8000 — Use an ngrok URL if accessing from the cloud preview
                </p>
              </div>
            </div>
          </Card>

          {/* Detection Settings */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Gauge className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold">Detection Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sensitivity" className="text-sm">
                    Detection Sensitivity
                  </Label>
                  <span className="text-sm font-mono text-primary">{settings.detectionSensitivity}%</span>
                </div>
                <Slider
                  id="sensitivity"
                  value={[settings.detectionSensitivity]}
                  onValueChange={(value) => updateSettings({ detectionSensitivity: value[0] })}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher sensitivity detects more objects but may increase false positives
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="interval" className="text-sm">
                    Frame Processing Interval
                  </Label>
                  <span className="text-sm font-mono text-primary">{settings.frameProcessingInterval}ms</span>
                </div>
                <Slider
                  id="interval"
                  value={[settings.frameProcessingInterval]}
                  onValueChange={(value) => updateSettings({ frameProcessingInterval: value[0] })}
                  max={5000}
                  min={500}
                  step={100}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower values = faster detection but higher CPU usage (500ms - 5000ms)
                </p>
              </div>
            </div>
          </Card>

          {/* Alert Settings */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-display font-bold">Alert Thresholds</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="threshold" className="text-sm">
                    Threat Alert Threshold
                  </Label>
                  <span className="text-sm font-mono text-destructive">{settings.alertThreshold}%</span>
                </div>
                <Slider
                  id="threshold"
                  value={[settings.alertThreshold]}
                  onValueChange={(value) => updateSettings({ alertThreshold: value[0] })}
                  max={100}
                  min={30}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Events with threat scores above this threshold will trigger alerts
                </p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="autoEmail" className="text-sm">
                    Auto-send Email Alerts
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatically email high-threat event alerts
                  </p>
                </div>
                <Switch
                  id="autoEmail"
                  checked={settings.autoSendEmail}
                  onCheckedChange={(checked) => updateSettings({ autoSendEmail: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Alert Email Recipients
                </Label>
                <div className="flex gap-2">
                  <Mail className="w-5 h-5 text-muted-foreground mt-2" />
                  <Input
                    id="email"
                    type="text"
                    value={settings.emailRecipient}
                    onChange={(e) => updateSettings({ emailRecipient: e.target.value })}
                    placeholder="email1@example.com, email2@example.com"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Separate multiple emails with commas
                </p>
              </div>
            </div>
          </Card>

          {/* Recording Settings */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <Video className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-display font-bold">Recording Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="duration" className="text-sm">
                    Max Recording Duration
                  </Label>
                  <span className="text-sm font-mono text-primary">{settings.recordingDuration}s</span>
                </div>
                <Slider
                  id="duration"
                  value={[settings.recordingDuration]}
                  onValueChange={(value) => updateSettings({ recordingDuration: value[0] })}
                  max={300}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum duration for live feed recordings (10s - 300s)
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Default Playback Speed</Label>
                <div className="flex gap-2">
                  {[0.25, 0.5, 1, 1.5, 2].map((speed) => (
                    <Button
                      key={speed}
                      variant={settings.playbackSpeed === speed ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ playbackSpeed: speed })}
                      className="font-mono"
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-end">
          <Button variant="outline" onClick={handleReset} className="font-display">
            <RotateCcw className="w-4 h-4 mr-2" />
            RESET DEFAULTS
          </Button>
          <Button onClick={handleSave} className="font-display">
            <Save className="w-4 h-4 mr-2" />
            SAVE SETTINGS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
