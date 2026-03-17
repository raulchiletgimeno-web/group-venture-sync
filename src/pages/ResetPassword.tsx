import { useState, useEffect } from "react";
import { Compass, Mail, Lock } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [isRecovery, setIsRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.emailSent, description: t.emailSentDesc });
    }
    setSubmitting(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: t.error, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.passwordUpdated, description: t.passwordUpdatedDesc });
      navigate("/auth");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-20 px-5">
      <div className="flex items-center gap-2 mb-6">
        <Compass className="h-6 w-6 text-primary" />
        <BrandLogo size="sm" className="text-muted-foreground" />
      </div>

      <div className="bg-card rounded-xl shadow-card p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-card-foreground mb-4">
          {isRecovery ? t.newPassword : t.resetPassword}
        </h2>

        {isRecovery ? (
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">{t.newPassword}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="new-password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-9" required minLength={6} />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full font-semibold">
              {submitting ? t.saving : t.savePassword}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full font-semibold">
              {submitting ? t.sending : t.sendRecoveryLink}
            </Button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button onClick={() => navigate("/auth")} className="text-sm text-primary font-semibold hover:underline">
            {t.backToLogin}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
