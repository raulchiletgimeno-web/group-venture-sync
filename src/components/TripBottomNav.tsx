import { useLocation, Link } from "react-router-dom";
import { CloudSun, CalendarDays } from "lucide-react";

const navItems = [
  { path: "weather", label: "Tiempo", icon: CloudSun },
  { path: "schedule", label: "Horario", icon: CalendarDays },
];

interface TripBottomNavProps {
  tripId: string;
}

const TripBottomNav = ({ tripId }: TripBottomNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card shadow-nav border-t border-border">
      <div className="flex overflow-x-auto no-scrollbar">
        {navItems.map(({ path, label, icon: Icon }) => {
          const fullPath = `/trip/${tripId}/${path}`;
          const isActive = currentPath === fullPath;

          return (
            <Link
              key={path}
              to={fullPath}
              className={`flex flex-col items-center justify-center min-w-[4.5rem] flex-1 py-2 px-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] mt-0.5 font-medium truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default TripBottomNav;
