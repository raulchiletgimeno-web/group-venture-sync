import { Camera } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Photos = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Fotos</h2>
      </div>
      <EmptyState
        icon={Camera}
        title="Sin fotos aún"
        description="Sube fotos del viaje y compártelas con el grupo."
        action={
          <Button className="gradient-hero text-primary-foreground border-0">
            Subir fotos
          </Button>
        }
      />
    </div>
  );
};

export default Photos;
