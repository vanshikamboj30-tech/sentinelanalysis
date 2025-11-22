import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, TrendingUp, Activity, AlertCircle, Clock } from "lucide-react";
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

// Demo data
const threatTrendData = [
  { time: "00:00", threats: 12, detections: 45 },
  { time: "04:00", threats: 8, detections: 32 },
  { time: "08:00", threats: 25, detections: 89 },
  { time: "12:00", threats: 18, detections: 67 },
  { time: "16:00", threats: 32, detections: 112 },
  { time: "20:00", threats: 15, detections: 58 },
];

const detectionPatternData = [
  { class: "Person", count: 245 },
  { class: "Vehicle", count: 156 },
  { class: "Bicycle", count: 89 },
  { class: "Animal", count: 34 },
];

const threatDistribution = [
  { name: "Low", value: 65, color: "hsl(142, 71%, 45%)" },
  { name: "Medium", value: 25, color: "hsl(45, 95%, 51%)" },
  { name: "High", value: 10, color: "hsl(0, 84%, 60%)" },
];

const hourlyActivity = [
  { hour: "00", activity: 15 },
  { hour: "03", activity: 8 },
  { hour: "06", activity: 32 },
  { hour: "09", activity: 67 },
  { hour: "12", activity: 89 },
  { hour: "15", activity: 78 },
  { hour: "18", activity: 95 },
  { hour: "21", activity: 45 },
];

const Analytics = () => {
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
          <Link to="/">
            <Button variant="outline" size="sm" className="font-display">
              <Home className="w-4 h-4 mr-2" />
              HOME
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Detections</p>
                <p className="text-3xl font-display font-bold text-foreground">1,247</p>
              </div>
              <Activity className="w-10 h-10 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">High Threats</p>
                <p className="text-3xl font-display font-bold text-destructive">127</p>
              </div>
              <AlertCircle className="w-10 h-10 text-destructive opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Avg Response Time</p>
                <p className="text-3xl font-display font-bold text-success">2.3s</p>
              </div>
              <Clock className="w-10 h-10 text-success opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Detection Rate</p>
                <p className="text-3xl font-display font-bold text-primary">94%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Threat Trends */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-display font-bold text-primary mb-4">
              THREAT TRENDS (24H)
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
                <Line
                  type="monotone"
                  dataKey="threats"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  name="High Threats"
                />
                <Line
                  type="monotone"
                  dataKey="detections"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Total Detections"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Detection Patterns */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-display font-bold text-primary mb-4">
              DETECTION PATTERNS
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={detectionPatternData}>
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

          {/* Threat Distribution */}
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

          {/* Hourly Activity */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-xl font-display font-bold text-primary mb-4">
              HOURLY ACTIVITY
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="activity" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
