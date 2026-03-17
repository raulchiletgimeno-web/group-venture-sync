import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import translations, { Language } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations["es"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return saved && saved in translations ? (saved as Language) : "es";
  });
  const [loaded, setLoaded] = useState(false);

  // Load language from DB on auth
  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    supabase
      .from("profiles")
      .select("language")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.language && data.language in translations) {
          const lang = data.language as Language;
          setLanguageState(lang);
          localStorage.setItem("app-language", lang);
        }
        setLoaded(true);
      });
  }, [user]);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      localStorage.setItem("app-language", lang);
      if (user) {
        supabase
          .from("profiles")
          .update({ language: lang } as any)
          .eq("id", user.id)
          .then();
      }
    },
    [user]
  );

  // Sync <html lang> with current language
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
