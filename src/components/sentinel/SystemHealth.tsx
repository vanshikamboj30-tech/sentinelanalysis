import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cpu, HardDrive } from "lucide-react";
import { SystemHealth as SystemHealthType } from "@/types/sentinel";

const SystemHealth = () => {
  const [health, setHealth] = useState<SystemHealthType>({
    cpu: 45,
    ram: 62,
  });

  useEffect(() => {
    // Simulate system health updates
    // In production, this would call http://localhost:8000/health
    const interval = setInterval(() => {
      setHealth({
        cpu: Math.floor(Math.random() * 30) + 40,
        ram: Math.floor(Math.random() * 20) + 55,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card border-border px-4 py-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-mono font-semibold">
              {health.cpu}
            </span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-mono font-semibold">
              {health.ram}
            </span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemHealth;
