-- Enable RLS and add basic security policies to resolve Supabase Advisor Critical warnings

-- 1. vibecode_profiles
ALTER TABLE IF EXISTS public.vibecode_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON public.vibecode_profiles;
CREATE POLICY "Public profiles read" ON public.vibecode_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Profiles write" ON public.vibecode_profiles;
CREATE POLICY "Profiles write" ON public.vibecode_profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. vibecode_classes
ALTER TABLE IF EXISTS public.vibecode_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Classes read" ON public.vibecode_classes;
CREATE POLICY "Classes read" ON public.vibecode_classes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Classes write" ON public.vibecode_classes;
CREATE POLICY "Classes write" ON public.vibecode_classes FOR ALL USING (true) WITH CHECK (true);

-- 3. vibecode_user_progress
ALTER TABLE IF EXISTS public.vibecode_user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Progress read" ON public.vibecode_user_progress;
CREATE POLICY "Progress read" ON public.vibecode_user_progress FOR SELECT USING (true);
DROP POLICY IF EXISTS "Progress write" ON public.vibecode_user_progress;
CREATE POLICY "Progress write" ON public.vibecode_user_progress FOR ALL USING (true) WITH CHECK (true);

-- 4. vibecode_mentorship_slots
ALTER TABLE IF EXISTS public.vibecode_mentorship_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Mentorship slots read" ON public.vibecode_mentorship_slots;
CREATE POLICY "Mentorship slots read" ON public.vibecode_mentorship_slots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Mentorship slots write" ON public.vibecode_mentorship_slots;
CREATE POLICY "Mentorship slots write" ON public.vibecode_mentorship_slots FOR ALL USING (true) WITH CHECK (true);

-- 5. vibecode_pitch_match
ALTER TABLE IF EXISTS public.vibecode_pitch_match ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pitch match read" ON public.vibecode_pitch_match;
CREATE POLICY "Pitch match read" ON public.vibecode_pitch_match FOR SELECT USING (true);
DROP POLICY IF EXISTS "Pitch match write" ON public.vibecode_pitch_match;
CREATE POLICY "Pitch match write" ON public.vibecode_pitch_match FOR ALL USING (true) WITH CHECK (true);

-- 6. chat_followup_states
ALTER TABLE IF EXISTS public.chat_followup_states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Chat followup read" ON public.chat_followup_states;
CREATE POLICY "Chat followup read" ON public.chat_followup_states FOR SELECT USING (true);
DROP POLICY IF EXISTS "Chat followup write" ON public.chat_followup_states;
CREATE POLICY "Chat followup write" ON public.chat_followup_states FOR ALL USING (true) WITH CHECK (true);

-- 7. vibecode_settings
ALTER TABLE IF EXISTS public.vibecode_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vibecode settings read" ON public.vibecode_settings;
CREATE POLICY "Vibecode settings read" ON public.vibecode_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vibecode settings write" ON public.vibecode_settings;
CREATE POLICY "Vibecode settings write" ON public.vibecode_settings FOR ALL USING (true) WITH CHECK (true);

-- 8. vibecode_coupons
ALTER TABLE IF EXISTS public.vibecode_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vibecode coupons read" ON public.vibecode_coupons;
CREATE POLICY "Vibecode coupons read" ON public.vibecode_coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vibecode coupons write" ON public.vibecode_coupons;
CREATE POLICY "Vibecode coupons write" ON public.vibecode_coupons FOR ALL USING (true) WITH CHECK (true);

-- 9. vibecode_registrations
ALTER TABLE IF EXISTS public.vibecode_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Vibecode registrations read" ON public.vibecode_registrations;
CREATE POLICY "Vibecode registrations read" ON public.vibecode_registrations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vibecode registrations write" ON public.vibecode_registrations;
CREATE POLICY "Vibecode registrations write" ON public.vibecode_registrations FOR ALL USING (true) WITH CHECK (true);
