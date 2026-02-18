import { CalendarDays } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Schedule = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Horario</h2>
      </div>
      <EmptyState
        icon={CalendarDays}
        title="Sin actividades planificadas"
        description="Organiza el itinerario día a día con actividades y horarios."
        action={
          <Button className="gradient-hero text-primary-foreground border-0">
            Planificar día
          </Button>
        }
      />
    </div>
  );
};

export default Schedule;
