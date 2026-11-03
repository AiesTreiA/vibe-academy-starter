-- Vibecode Lab Platform Database Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS vibecode_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE IF NOT EXISTS vibecode_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_number INT NOT NULL DEFAULT 1,
  module_title TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  order_index INT NOT NULL DEFAULT 1,
  is_published BOOLEAN DEFAULT true,
  timestamps JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Progress Table
CREATE TABLE IF NOT EXISTS vibecode_user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES vibecode_classes(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  watched_seconds INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, class_id)
);

-- 4. Mentorship Slots Table
CREATE TABLE IF NOT EXISTS vibecode_mentorship_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_date TIMESTAMPTZ NOT NULL,
  duration_minutes INT DEFAULT 45,
  is_booked BOOLEAN DEFAULT false,
  booked_by_user_id UUID,
  booked_by_name TEXT,
  booked_by_email TEXT,
  meet_link TEXT DEFAULT 'https://meet.google.com/jmg-iqxe-eay',
  topic TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'booked', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Pitch & Match Community Table
CREATE TABLE IF NOT EXISTS vibecode_pitch_match (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'Alumno',
  author_avatar TEXT,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('idea', 'mvp', 'seeking_cofounder', 'showcase')),
  description TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  contact_info TEXT NOT NULL,
  looking_for TEXT,
  likes_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
