import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") setStatus("already");
        else if (data.valid) setStatus("valid");
        else setStatus("invalid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleUnsubscribe = async () => {
    setStatus("loading");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-foreground">YORMIT</h1>

        {status === "loading" && (
          <p className="text-muted-foreground">Cargando...</p>
        )}

        {status === "valid" && (
          <div className="space-y-4">
            <p className="text-foreground">¿Quieres dejar de recibir emails de recordatorio de deuda?</p>
            <button
              onClick={handleUnsubscribe}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
            >
              Confirmar cancelación
            </button>
          </div>
        )}

        {status === "success" && (
          <p className="text-foreground">✅ Te has dado de baja correctamente. No recibirás más emails de recordatorio.</p>
        )}

        {status === "already" && (
          <p className="text-muted-foreground">Ya te habías dado de baja anteriormente.</p>
        )}

        {status === "invalid" && (
          <p className="text-destructive">Enlace no válido o expirado.</p>
        )}

        {status === "error" && (
          <p className="text-destructive">Ha ocurrido un error. Inténtalo de nuevo más tarde.</p>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
