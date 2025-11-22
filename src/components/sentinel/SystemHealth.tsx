import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cpu, HardDrive } from "lucide-react";
import { SystemHealth as SystemHealthType } from "@/types/sentinel";
import axios from "axios";

const SystemHealth = () => {
  const [health, setHealth] = useState<SystemHealthType>({
    cpu: 45,
    ram: 62,
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await axios.get<SystemHealthType>(
          "http://localhost:8000/health"
        );
        setHealth(response.data);
      } catch (error) {
        console.error("Health check failed:", error);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);

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
