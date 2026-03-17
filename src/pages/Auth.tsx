import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Luggage, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-travel.jpg";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, session } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (session) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: t.loginError, description: error.message, variant: "destructive" });
      } else {
        navigate("/dashboard");
      }
    } else {
      const nameParts = name.trim().split(/\s+/);
      if (nameParts.length < 2 || nameParts.some(p => p.length === 0)) {
        toast({ title: t.nameRequired, description: t.nameRequiredDesc, variant: "destructive" });
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        toast({ title: t.registerError, description: error.message, variant: "destructive" });
      } else {
        toast({ title: t.registerSuccess, description: t.registerSuccessDesc });
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Travel" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="relative px-5 pt-14 pb-8 text-center">
          <BrandLogo size="xl" className="text-white" />
          <h1 className="text-2xl font-extrabold text-primary-foreground">
            {mode === "login" ? t.letsGo : t.createAccount}
          </h1>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-card rounded-xl shadow-card p-6 max-w-sm mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">{t.name}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Ej: Juan García" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={submitting}>
              {submitting ? t.loading : mode === "login" ? t.login : t.register}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                {t.noAccount}{" "}
                <button onClick={() => setMode("register")} className="text-primary font-semibold hover:underline">
                  {t.registerLink}
                </button>
              </>
            ) : (
              <>
                {t.hasAccount}{" "}
                <button onClick={() => setMode("login")} className="text-primary font-semibold hover:underline">
                  {t.loginLink}
                </button>
              </>
            )}
          </div>

          {mode === "login" && (
            <div className="mt-2 text-center">
              <button onClick={() => navigate("/reset-password")} className="text-xs text-muted-foreground hover:text-primary">
                {t.forgotPassword}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
