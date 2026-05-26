-- Enable RLS on realtime.messages (idempotent) and add topic-based policies
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Trip members can read realtime topics" ON realtime.messages;
DROP POLICY IF EXISTS "Trip members can write realtime topics" ON realtime.messages;

CREATE POLICY "Trip members can read realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'trip:%' THEN
      public.is_trip_member( (split_part(realtime.topic(), ':', 2))::uuid )
    WHEN realtime.topic() LIKE 'user:%' THEN
      (split_part(realtime.topic(), ':', 2))::uuid = auth.uid()
    ELSE false
  END
);

CREATE POLICY "Trip members can write realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'trip:%' THEN
      public.is_trip_member( (split_part(realtime.topic(), ':', 2))::uuid )
    WHEN realtime.topic() LIKE 'user:%' THEN
      (split_part(realtime.topic(), ':', 2))::uuid = auth.uid()
    ELSE false
  END
);