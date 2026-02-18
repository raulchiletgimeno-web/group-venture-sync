import { Plane } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Transport = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Cómo Viajamos</h2>
      </div>
      <EmptyState
        icon={Plane}
        title="Sin transporte registrado"
        description="Añade los detalles de vuelos, trenes o cualquier medio de transporte del viaje."
        action={
          <Button className="gradient-hero text-primary-foreground border-0">
            Añadir transporte
          </Button>
        }
      />
    </div>
  );
};

export default Transport;
