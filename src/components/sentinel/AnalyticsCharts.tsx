import { Card } from "@/components/ui/card";
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
import { DetectionEvent } from "@/types/sentinel";

interface AnalyticsChartsProps {
  events: DetectionEvent[];
}

const AnalyticsCharts = ({ events }: AnalyticsChartsProps) => {
  // Process events into chart data
  const threatTrendData = events.reduce((acc: any[], event) => {
    const time = event.timestamp.split(':').slice(0, 2).join(':');
    const existing = acc.find(item => item.time === time);
    
    if (existing) {
      existing.detections += 1;
      if (event.threatScore > 70) existing.threats += 1;
    } else {
      acc.push({
        time,
        detections: 1,
        threats: event.threatScore > 70 ? 1 : 0,
      });
    }
    
    return acc;
  }, []).slice(0, 10);

  // Detection patterns by class
  const detectionPatternData = events.reduce((acc: any[], event) => {
    const existing = acc.find(item => item.class === event.class);
    
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ class: event.class, count: 1 });
    }
    
    return acc;
  }, []);

  // Threat distribution
  const threatDistribution = [
    {
      name: "Low",
      value: events.filter(e => e.threatScore <= 40).length,
      color: "hsl(142, 71%, 45%)",
    },
    {
      name: "Medium",
      value: events.filter(e => e.threatScore > 40 && e.threatScore <= 70).length,
      color: "hsl(45, 95%, 51%)",
    },
    {
      name: "High",
      value: events.filter(e => e.threatScore > 70).length,
      color: "hsl(0, 84%, 60%)",
    },
  ].filter(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Threat Trends */}
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
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
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
  );
};

export default AnalyticsCharts;
