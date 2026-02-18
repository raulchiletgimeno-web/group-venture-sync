import { CloudSun } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const Weather = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">El Tiempo</h2>
      </div>
      <EmptyState
        icon={CloudSun}
        title="Clima no disponible"
        description="El clima se mostrará automáticamente según el destino del viaje."
      />
    </div>
  );
};

export default Weather;
