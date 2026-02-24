import { Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PendingApproval = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="rounded-full bg-amber-100 p-4 mb-4">
        <Clock className="h-8 w-8 text-amber-600" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">{t.pendingApprovalTitle}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">{t.pendingApprovalDesc}</p>
    </div>
  );
};

export default PendingApproval;
