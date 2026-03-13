DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'trip_photos') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_photos;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'trip_expenses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_expenses;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'trip_accommodation') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_accommodation;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'trip_transport') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_transport;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'trip_schedule') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_schedule;
  END IF;
END $$;