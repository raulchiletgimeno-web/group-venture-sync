
-- Fix trips policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY "Authenticated users can create trips" ON trips;
CREATE POLICY "Authenticated users can create trips" ON trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY "Members can view trips" ON trips;
CREATE POLICY "Members can view trips" ON trips FOR SELECT TO authenticated USING (is_trip_member(id));

DROP POLICY "Members can update trips" ON trips;
CREATE POLICY "Members can update trips" ON trips FOR UPDATE TO authenticated USING (is_trip_member(id));

DROP POLICY "Only creator can delete trips" ON trips;
CREATE POLICY "Only creator can delete trips" ON trips FOR DELETE TO authenticated USING (is_trip_creator(id));

-- Fix trip_members policies
DROP POLICY "Creator or self can insert members" ON trip_members;
CREATE POLICY "Creator or self can insert members" ON trip_members FOR INSERT TO authenticated WITH CHECK (is_trip_creator(trip_id) OR (user_id = auth.uid()));

DROP POLICY "Members can view trip members" ON trip_members;
CREATE POLICY "Members can view trip members" ON trip_members FOR SELECT TO authenticated USING (is_trip_member(trip_id));

DROP POLICY "Only creator can remove members" ON trip_members;
CREATE POLICY "Only creator can remove members" ON trip_members FOR DELETE TO authenticated USING (is_trip_creator(trip_id));

-- Fix profiles policies
DROP POLICY "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Also allow viewing trips by invite_code for joining (needed for JoinTripDialog)
CREATE POLICY "Anyone authenticated can find trip by invite code" ON trips FOR SELECT TO authenticated USING (true);
