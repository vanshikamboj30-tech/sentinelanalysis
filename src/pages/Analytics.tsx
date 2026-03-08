import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, TrendingUp, Activity, AlertCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AnalyticsSummary, ThreatDistribution, AnalysisReport } from "@/types/sentinel";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [threatDist, setThreatDist] = useState<ThreatDistribution | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, recentData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getRecentData(),
      ]);
      setSummary(summaryData.summary);
      setThreatDist(summaryData.threatDistribution);
      setRecentAnalyses(recentData.analyses || []);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      const isNetworkError = error instanceof Error && error.message.includes('Network Error');
      if (isNetworkError && !window.location.hostname.includes('localhost')) {
        toast.error("Cannot connect to backend. Set your backend URL in Settings.");
      } else {
        toast.error("Failed to load analytics. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Build chart data from real analyses
  const threatTrendData = recentAnalyses.slice(0, 10).reverse().map((a, i) => ({
    time: new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    threats: a.high_threat_count,
    detections: a.total_events,
  }));

  const detectionPatternData = recentAnalyses.reduce<Record<string, number>>((acc, a) => {
    (a.events || []).forEach(e => {
      acc[e.class] = (acc[e.class] || 0) + 1;
    });
    return acc;
  }, {});
  const detectionPatternChartData = Object.entries(detectionPatternData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cls, count]) => ({ class: cls, count }));

  const threatDistribution = threatDist
    ? [
        { name: "Low", value: threatDist.low, color: "hsl(142, 71%, 45%)" },
        { name: "Medium", value: threatDist.medium, color: "hsl(45, 95%, 51%)" },
        { name: "High", value: threatDist.high, color: "hsl(0, 84%, 60%)" },
      ].filter(d => d.value > 0)
    : [];

  const hasData = summary && (summary.total_events > 0 || recentAnalyses.length > 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
              ANALYTICS DASHBOARD
            </h1>
            <p className="text-muted-foreground">Comprehensive surveillance data analysis and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="font-display" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              REFRESH
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm" className="font-display">
                <Home className="w-4 h-4 mr-2" />
                HOME
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <Card className="p-12 bg-card border-border text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </Card>
        ) : !hasData ? (
          <Card className="p-12 bg-card border-border text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No analytics data yet. Analyze some videos first!</p>
            <Link to="/analyze">
              <Button className="font-display">Analyze a Video</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Detections</p>
                    <p className="text-3xl font-display font-bold text-foreground">
                      {summary?.total_events?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <Activity className="w-10 h-10 text-primary opacity-50" />
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">High Threats</p>
                    <p className="text-3xl font-display font-bold text-destructive">
                      {summary?.high_threat_events?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-destructive opacity-50" />
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Analyses</p>
                    <p className="text-3xl font-display font-bold text-success">
                      {summary?.total_analyses?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-success opacity-50" />
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Total Alerts</p>
                    <p className="text-3xl font-display font-bold text-primary">
                      {summary?.total_alerts?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-primary opacity-50" />
                </div>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Threat Trends */}
              {threatTrendData.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h2 className="text-xl font-display font-bold text-primary mb-4">
                    THREAT TRENDS
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={threatTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="threats" stroke="hsl(var(--destructive))" strokeWidth={2} name="High Threats" />
                      <Line type="monotone" dataKey="detections" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Detections" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Detection Patterns */}
              {detectionPatternChartData.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h2 className="text-xl font-display font-bold text-primary mb-4">
                    DETECTION PATTERNS
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={detectionPatternChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Threat Distribution */}
              {threatDistribution.length > 0 && (
                <Card className="p-6 bg-card border-border">
                  <h2 className="text-xl font-display font-bold text-primary mb-4">
                    THREAT DISTRIBUTION
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={threatDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {threatDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
