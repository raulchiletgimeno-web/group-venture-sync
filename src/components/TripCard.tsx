import { MapPin, Calendar, Users, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface TripCardProps {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  memberCount: number;
  status: "upcoming" | "active" | "finished";
  memberStatus?: "approved" | "pending";
}

const TripCard = ({ id, title, destination, startDate, endDate, memberCount, status, memberStatus = "approved" }: TripCardProps) => {
  const { t } = useLanguage();

  const statusConfig = {
    upcoming: { label: t.upcoming, className: "bg-secondary text-secondary-foreground" },
    active: { label: t.active, className: "gradient-hero text-primary-foreground" },
    finished: { label: t.finished, className: "bg-muted text-muted-foreground" },
  };

  const statusInfo = statusConfig[status];

  return (
    <Link
      to={`/trip/${id}`}
      className={`block rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in ${memberStatus === "pending" ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-card-foreground">{title}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">{destination}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
          {memberStatus === "pending" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              <Clock className="h-3 w-3" />
              {t.pendingApprovalTitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{startDate} — {endDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{memberCount}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  );
};

export default TripCard;
