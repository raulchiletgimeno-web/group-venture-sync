// Helper interno para reportar incidencias al endpoint internal-alert.
// Uso: import { reportInternalAlert } from '../_shared/internal-alert.ts'
// Nunca debe romper la lógica de la función que lo invoca (try/catch interno).

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface InternalAlertPayload {
  severity: AlertSeverity;
  source: string;
  event_key: string;
  title: string;
  description: string;
  impact?: string;
  recommended_action?: string;
  metadata?: Record<string, unknown>;
}

export async function reportInternalAlert(payload: InternalAlertPayload): Promise<void> {
  try {
    const baseUrl = Deno.env.get('SUPABASE_URL');
    const secret = Deno.env.get('INTERNAL_ALERT_SECRET');
    if (!baseUrl || !secret) return;
    await fetch(`${baseUrl}/functions/v1/internal-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': secret,
      },
      body: JSON.stringify(payload),
    });
  } catch (_e) {
    // Silencio total: una alerta nunca debe romper al emisor.
  }
}
