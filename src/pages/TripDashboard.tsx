import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Plane, Hotel, Receipt, Camera, MessageCircle, CloudSun, CalendarDays,
  Users, MapPin, Calendar, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useTripRole } from "@/hooks/use-trip-role";
import { useMemberStatus } from "@/hooks/use-member-status";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { formatDisplayName } from "@/lib/formatDisplayName";
import PendingApproval from "@/components/PendingApproval";
import MemberApprovalManager from "@/components/MemberApprovalManager";

interface TripData {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  invite_code: string;
}

const TripDashboard = () => {
  const { tripId } = useParams();
  const { isCreator } = useTripRole(tripId);
  const { status: memberStatus, loading: statusLoading } = useMemberStatus(tripId);
  const { t, language } = useLanguage();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  const sections = [
    { path: "transport", label: t.transport, icon: Plane, color: "bg-primary/10 text-primary" },
    { path: "accommodation", label: t.accommodation, icon: Hotel, color: "bg-accent/10 text-accent" },
    { path: "expenses", label: t.expenses, icon: Receipt, color: "bg-secondary text-secondary-foreground" },
    { path: "photos", label: t.photos, icon: Camera, color: "bg-primary/10 text-primary" },
    { path: "chat", label: t.chat, icon: MessageCircle, color: "bg-accent/10 text-accent" },
    { path: "weather", label: t.weather, icon: CloudSun, color: "bg-secondary text-secondary-foreground" },
    { path: "schedule", label: t.activities, icon: CalendarDays, color: "bg-primary/10 text-primary" },
  ];

  const statusLabels: Record<string, string> = {
    upcoming: t.upcoming,
    active: t.active,
    finished: t.finished,
  };

  useEffect(() => {
    if (!tripId) return;

    // Fetch trip info - use a direct query that works for both pending and approved
    supabase
      .from("trips")
      .select("title, destination, start_date, end_date, status, invite_code")
      .eq("id", tripId)
      .single()
      .then(({ data }) => {
        if (data) setTrip(data);
      });

    supabase
      .from("trip_members")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", tripId)
      .eq("status", "approved")
      .then(({ count }) => {
        setMemberCount(count ?? 0);
      });
  }, [tripId]);

  const handleShare = () => {
    if (!trip) return;
    const link = `${window.location.origin}/join/${trip.invite_code}`;
    const text = `${t.joinTripTitle} "${trip.title}"! ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.location.href = whatsappUrl;
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" });
  };

  if (!trip || statusLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Show pending approval screen for non-approved members
  if (memberStatus === "pending") {
    return <PendingApproval />;
  }

  return (
    <div className="animate-fade-in">
      {/* Show pending requests to creator */}
      {isCreator && tripId && <MemberApprovalManager tripId={tripId} />}

      <div className="rounded-xl bg-card p-5 shadow-card mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{trip.title}</h2>
            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span>{trip.destination}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
              <Users className="h-3.5 w-3.5" />
              <span>{memberCount} {memberCount !== 1 ? t.members : t.member}</span>
            </div>
          </div>
          <span className="gradient-hero text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
            {statusLabels[trip.status] ?? trip.status}
          </span>
        </div>
        {isCreator && (
          <div className="mt-4 flex items-center gap-3">
            <Button variant="outline" size="sm" className="text-sm" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              {t.inviteFriends}
            </Button>
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t.code}: {trip.invite_code}
            </span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t.sections}</h3>
      <div className="grid grid-cols-2 gap-3">
        {sections.map(({ path, label, icon: Icon, color }) => (
          <Link
            key={path}
            to={`/trip/${tripId}/${path}`}
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300"
          >
            <div className={`rounded-lg p-2.5 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-card-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TripDashboard;
