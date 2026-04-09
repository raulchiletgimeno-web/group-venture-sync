import { useState, useEffect } from "react";
import { Plus, UserPlus, LogOut, MessageCircleQuestion } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import TripCard from "@/components/TripCard";
import EmptyState from "@/components/EmptyState";
import CreateTripDialog from "@/components/CreateTripDialog";
import JoinTripDialog from "@/components/JoinTripDialog";
import HelpChatBot from "@/components/HelpChatBot";
import InstallAppBanner from "@/components/InstallAppBanner";
import PushNotificationBanner from "@/components/PushNotificationBanner";
import { useAuth } from "@/contexts/AuthContext";
import { useUnseenCounts } from "@/hooks/use-unseen-counts";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-travel.jpg";

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: "upcoming" | "active" | "finished";
  memberCount: number;
  memberStatus: "approved" | "pending";
}

const Index = () => {
  const { profile, signOut } = useAuth();
  const { t, language } = useLanguage();
  const { counts: unseenCounts } = useUnseenCounts();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [translatedTitles, setTranslatedTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState<Record<string, number>>({});

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString(getLocale(language), { day: "numeric", month: "short" });
  };

  const fetchTrips = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: memberships } = await supabase
      .from("trip_members")
      .select("trip_id, status")
      .eq("user_id", user.id);

    if (!memberships || memberships.length === 0) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const tripIds = memberships.map((m) => m.trip_id);
    const statusMap: Record<string, string> = {};
    memberships.forEach((m) => { statusMap[m.trip_id] = m.status; });

    const { data } = await supabase
      .from("trips")
      .select("*")
      .in("id", tripIds)
      .order("start_date", { ascending: true });

    if (data) {
      // Batch member count query — single call instead of N+1
      const { data: allApprovedMembers } = await supabase
        .from("trip_members")
        .select("trip_id")
        .in("trip_id", tripIds)
        .eq("status", "approved");

      const memberCountMap: Record<string, number> = {};
      (allApprovedMembers || []).forEach((m) => {
        memberCountMap[m.trip_id] = (memberCountMap[m.trip_id] || 0) + 1;
      });

      const tripsWithCounts = data.map((trip) => {
        const today = new Date().toISOString().split("T")[0];
        const computedStatus: Trip["status"] =
          trip.end_date < today ? "finished" :
          trip.start_date <= today ? "active" :
          "upcoming";
        return {
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          status: computedStatus,
          memberCount: memberCountMap[trip.id] ?? 0,
          memberStatus: (statusMap[trip.id] || "approved") as "approved" | "pending",
        };
      });
      setTrips(tripsWithCounts);
    }
    setLoading(false);
  };

  const fetchPendingCounts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get trips where user is admin
    const { data: adminTrips } = await supabase
      .from("trip_members")
      .select("trip_id")
      .eq("user_id", user.id)
      .in("role", ["creator", "co-creator"])
      .eq("status", "approved");

    if (!adminTrips || adminTrips.length === 0) {
      setPendingCounts({});
      return;
    }

    const tripIds = adminTrips.map((t) => t.trip_id);
    const { data: pendingMembers } = await supabase
      .from("trip_members")
      .select("trip_id")
      .in("trip_id", tripIds)
      .eq("status", "pending");

    const map: Record<string, number> = {};
    (pendingMembers || []).forEach((m) => {
      map[m.trip_id] = (map[m.trip_id] || 0) + 1;
    });
    setPendingCounts(map);
  };

  useEffect(() => {
    fetchTrips();
    fetchPendingCounts();
  }, []);

  // Realtime subscription for pending member changes
  useEffect(() => {
    const channel = supabase
      .channel("pending-members-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "trip_members" }, () => {
        fetchPendingCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Translate trip titles when language changes
  useEffect(() => {
    if (trips.length === 0) return;
    if (language === "es") {
      setTranslatedTitles({});
      return;
    }

    const translateTitles = async () => {
      try {
        const titles = trips.map((t) => t.title);
        const resp = await supabase.functions.invoke("translate", {
          body: { texts: titles, targetLanguage: language },
        });
        if (resp.data?.translations) {
          const map: Record<string, string> = {};
          trips.forEach((trip, i) => {
            map[trip.id] = resp.data.translations[i] || trip.title;
          });
          setTranslatedTitles(map);
        }
      } catch (e) {
        console.error("Translation error:", e);
      }
    };
    translateTitles();
  }, [language, trips]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(175_45%_75%)] via-[hsl(190_35%_85%)] to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Travel illustration" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative px-5 pt-14 pb-10">
          <div className="flex items-center justify-between mb-4">
            <BrandLogo size="lg" className="text-white" />
            <div className="flex items-center gap-2">
              {profile?.name && (
                <span className="text-xs font-medium text-foreground">{t.user}: {profile.name}</span>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-foreground hover:text-foreground hover:bg-foreground/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-primary-foreground mt-3 leading-tight whitespace-pre-line">
            {t.heroTitle}
          </h1>
          <p className="text-sm text-primary-foreground/75 mt-3 max-w-xs leading-relaxed">
            {t.heroSubtitle}
          </p>
          <div className="flex gap-3 mt-6">
            <Button
              size="lg"
              className="bg-card text-foreground hover:bg-card/90 font-semibold shadow-card-hover"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t.createTrip}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/60 text-foreground bg-card hover:bg-card/90 font-semibold shadow-card-hover"
              onClick={() => setJoinOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t.joinTrip}
            </Button>
          </div>
        </div>
      </div>

      <PushNotificationBanner />
      <InstallAppBanner variant="dashboard" />

      <div className="px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{t.myTrips}</h2>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-black">{t.helpMeLabel}</span>
            <button
              onClick={() => setHelpOpen(true)}
              className="h-10 w-10 rounded-full gradient-hero shadow-card-hover flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              aria-label={t.helpChatTitle}
            >
              <MessageCircleQuestion className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-card border border-border/50 p-4 shadow-card animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            title={t.noTripsTitle}
            description={t.noTripsDesc}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                title={translatedTitles[trip.id] || trip.title}
                destination={trip.destination}
                startDate={formatDate(trip.start_date)}
                endDate={formatDate(trip.end_date)}
                memberCount={trip.memberCount}
                status={trip.status}
                memberStatus={trip.memberStatus}
                unseenCount={unseenCounts[trip.id] || 0}
                pendingCount={pendingCounts[trip.id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Legal footer */}
      <div className="px-5 pb-6 pt-2">
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <a href="/aviso-legal" className="hover:text-foreground transition-colors">Aviso legal</a>
          <span>·</span>
          <a href="/privacidad" className="hover:text-foreground transition-colors">Privacidad</a>
          <span>·</span>
          <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
          <span>·</span>
          <a href="/contacto" className="hover:text-foreground transition-colors">Contacto</a>
        </div>
      </div>

      <CreateTripDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinTripDialog open={joinOpen} onOpenChange={setJoinOpen} />
      <HelpChatBot open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
};

export default Index;
