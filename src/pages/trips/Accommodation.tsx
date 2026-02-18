import { Hotel } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Accommodation = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Dónde Dormimos</h2>
      </div>
      <EmptyState
        icon={Hotel}
        title="Sin alojamiento registrado"
        description="Añade hoteles, apartamentos o cualquier alojamiento del viaje."
        action={
          <Button className="gradient-hero text-primary-foreground border-0">
            Añadir alojamiento
          </Button>
        }
      />
    </div>
  );
};

export default Accommodation;
