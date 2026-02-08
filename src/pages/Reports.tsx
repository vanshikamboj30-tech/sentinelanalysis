import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Home, FileText, Search, Calendar, AlertTriangle, CheckCircle, Clock, Eye, Mail, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { AnalysisReport } from "@/types/sentinel";

const Reports = () => {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await api.getRecentData();
      setReports(data.analyses || []);
    } catch (error) {
      console.error("Failed to load reports:", error);
      // Check if this is a network error (likely localhost issue from cloud preview)
      const isNetworkError = error instanceof Error && error.message.includes('Network Error');
      if (isNetworkError && !window.location.hostname.includes('localhost')) {
        toast.error("Cannot connect to backend. Run the frontend locally with 'npm run dev' to connect to your local backend.");
      } else {
        toast.error("Failed to load reports. Make sure the backend is running on http://localhost:8000");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) =>
    report.video_filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getThreatLevel = (report: AnalysisReport) => {
    const highRatio = report.high_threat_count / Math.max(report.total_events, 1);
    if (highRatio > 0.3) return "high";
    if (highRatio > 0.1) return "medium";
    return "low";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleResendEmail = async (reportId: string) => {
    try {
      await api.resendReport(reportId);
      toast.success("Report email sent successfully");
    } catch {
      toast.error("Failed to send email");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-primary text-glow-primary mb-2">
              ANALYSIS REPORTS
            </h1>
            <p className="text-muted-foreground">View all past video surveillance analyses</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="font-display">
              <Home className="w-4 h-4 mr-2" />
              HOME
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <Card className="p-4 mb-6 bg-card border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by video filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-display font-bold text-primary">{reports.length}</div>
            <div className="text-xs text-muted-foreground uppercase">Total Reports</div>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-display font-bold text-destructive">
              {reports.filter((r) => getThreatLevel(r) === "high").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">High Threat</div>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-display font-bold text-warning">
              {reports.filter((r) => getThreatLevel(r) === "medium").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Medium Threat</div>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <div className="text-2xl font-display font-bold text-success">
              {reports.filter((r) => getThreatLevel(r) === "low").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Low Threat</div>
          </Card>
        </div>

        {/* Reports List */}
        {loading ? (
          <Card className="p-12 bg-card border-border text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading reports...</p>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card className="p-12 bg-card border-border text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No reports match your search" : "No analysis reports yet"}
            </p>
            <Link to="/analyze" className="mt-4 inline-block">
              <Button className="font-display">
                Analyze a Video
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const threatLevel = getThreatLevel(report);
              return (
                <Card
                  key={report._id}
                  className={`p-6 bg-card border-border hover:border-primary/50 transition-all cursor-pointer ${
                    threatLevel === "high" ? "border-l-4 border-l-destructive" :
                    threatLevel === "medium" ? "border-l-4 border-l-warning" :
                    "border-l-4 border-l-success"
                  }`}
                  onClick={() => navigate(`/report/${report._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-display font-semibold text-lg">
                          {report.video_filename || "Untitled Video"}
                        </h3>
                        <Badge
                          variant={
                            threatLevel === "high" ? "destructive" :
                            threatLevel === "medium" ? "secondary" : "outline"
                          }
                        >
                          {threatLevel.toUpperCase()} THREAT
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(report.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {Math.round(report.duration_seconds || 0)}s duration
                        </span>
                        <span className="flex items-center gap-1">
                          {report.status === "completed" ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <Clock className="w-4 h-4 text-warning" />
                          )}
                          {report.status}
                        </span>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <span>
                          <span className="text-muted-foreground">Total Events:</span>{" "}
                          <span className="font-mono">{report.total_events}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">High:</span>{" "}
                          <span className="font-mono text-destructive">{report.high_threat_count}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Medium:</span>{" "}
                          <span className="font-mono text-warning">{report.medium_threat_count}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Low:</span>{" "}
                          <span className="font-mono text-success">{report.low_threat_count}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendEmail(report._id)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/report/${report._id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
