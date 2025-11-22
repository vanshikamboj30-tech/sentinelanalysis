import { Card } from "@/components/ui/card";
import { AlertTriangle, Activity } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  variant: "danger" | "warning";
  description: string;
}

const StatsCard = ({ title, value, variant, description }: StatsCardProps) => {
  const Icon = variant === "danger" ? AlertTriangle : Activity;
  const colorClass =
    variant === "danger"
      ? "text-destructive"
      : "text-warning";
  const glowClass =
    variant === "danger" ? "glow-danger" : "glow-primary";

  return (
    <Card className={`bg-card border-border p-6 ${glowClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-display font-semibold text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className={`text-5xl font-display font-bold ${colorClass}`}>
            {value}
          </h3>
        </div>
        <div
          className={`p-3 rounded-lg ${
            variant === "danger" ? "bg-destructive/10" : "bg-warning/10"
          }`}
        >
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
};

export default StatsCard;
