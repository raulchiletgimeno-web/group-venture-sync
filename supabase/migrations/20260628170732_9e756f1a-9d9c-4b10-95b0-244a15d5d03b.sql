-- 1) debt_reminders: bloquear escritura desde clientes (solo service_role)
REVOKE INSERT, UPDATE, DELETE ON public.debt_reminders FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.debt_reminders FROM anon;

-- 2) trips: restringir UPDATE a creador/co-creador
DROP POLICY IF EXISTS "Members can update trips" ON public.trips;

CREATE POLICY "Creators can update trips"
ON public.trips
FOR UPDATE
TO authenticated
USING (public.is_trip_creator(id))
WITH CHECK (public.is_trip_creator(id));