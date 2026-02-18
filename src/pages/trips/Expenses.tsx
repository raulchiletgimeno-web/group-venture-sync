import { Receipt } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

const Expenses = () => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Gastos Compartidos</h2>
      </div>
      <EmptyState
        icon={Receipt}
        title="Sin gastos registrados"
        description="Registra gastos y divide cuentas fácilmente entre los miembros del viaje."
        action={
          <Button className="gradient-hero text-primary-foreground border-0">
            Añadir gasto
          </Button>
        }
      />
    </div>
  );
};

export default Expenses;
