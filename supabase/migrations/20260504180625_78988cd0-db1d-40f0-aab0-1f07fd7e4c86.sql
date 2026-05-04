-- Reprogramar el cron del email post-viaje para que se envíe siempre a las 10:00 Europe/Madrid.
-- Disparamos a 08:00 y 09:00 UTC (cubre CET y CEST). La edge function comprueba
-- internamente que en Europe/Madrid sean exactamente las 10:00 antes de enviar.

-- Eliminar cualquier programación anterior (horaria u otras variantes)
DO $$
DECLARE
  job RECORD;
BEGIN
  FOR job IN
    SELECT jobid, jobname FROM cron.job
    WHERE jobname IN (
      'check-trip-post-departure-hourly',
      'check-trip-post-departure-daily-10',
      'check-trip-post-departure'
    )
  LOOP
    PERFORM cron.unschedule(job.jobid);
  END LOOP;
END $$;

-- Programar el nuevo job: 08:00 y 09:00 UTC todos los días
SELECT cron.schedule(
  'check-trip-post-departure-daily-10',
  '0 8,9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://oktrzxlwaflyirjfjlad.supabase.co/functions/v1/check-trip-post-departure',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
