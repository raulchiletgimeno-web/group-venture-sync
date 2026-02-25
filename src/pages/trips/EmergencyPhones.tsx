import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getEmergencyPhones, buildTelLink, type CountryPhones } from "@/data/emergencyPhones";

const EmergencyPhones = () => {
  const { tripId } = useParams();
  const { t } = useLanguage();
  const [phoneData, setPhoneData] = useState<CountryPhones | null>(null);
  const [destination, setDestination] = useState("");

  useEffect(() => {
    if (!tripId) return;
    supabase
      .from("trips")
      .select("destination")
      .eq("id", tripId)
      .single()
      .then(({ data }) => {
        if (data) {
          setDestination(data.destination);
          setPhoneData(getEmergencyPhones(data.destination));
        }
      });
  }, [tripId]);

  if (!phoneData) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const labelMap: Record<string, string> = {
    phoneEmergencies: t.phoneEmergencies,
    phonePolice: t.phonePolice,
    phoneLocalPolice: t.phoneLocalPolice,
    phoneAmbulance: t.phoneAmbulance,
    phoneFire: t.phoneFire,
    phoneTaxi: t.phoneTaxi,
    phoneTourism: t.phoneTourism,
    phoneNonEmergency: t.phoneNonEmergency,
    phonePoison: t.phonePoison,
    phoneCarabinieri: t.phoneCarabinieri,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Phone className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-card-foreground">{t.emergencyPhones}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {destination} {phoneData.name ? `(${phoneData.name})` : ""}
      </p>

      <div className="space-y-2">
        {phoneData.phones.map((phone, idx) => (
          <a
            key={idx}
            href={buildTelLink(phoneData.prefix, phone.number)}
            className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300 active:scale-[0.98]"
          >
            <span className="text-2xl">{phone.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground">
                {labelMap[phone.labelKey] ?? phone.labelKey}
              </p>
              <p className="text-xs text-muted-foreground">
                {phone.number.length > 3 ? `${phoneData.prefix} ${phone.number}` : phone.number}
              </p>
            </div>
            <div className="rounded-full bg-primary/10 p-2.5">
              <Phone className="h-4 w-4 text-primary" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EmergencyPhones;
