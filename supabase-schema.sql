-- Bongo Stats Database Schema for Supabase
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  birthday TEXT,
  bongs INTEGER DEFAULT 0,
  preferred_foot TEXT DEFAULT 'right',
  pace INTEGER DEFAULT 50,
  shooting INTEGER DEFAULT 50,
  passing INTEGER DEFAULT 50,
  dribbling INTEGER DEFAULT 50,
  defense INTEGER DEFAULT 50,
  physical INTEGER DEFAULT 50,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  time TEXT,
  opponent TEXT NOT NULL,
  opponent_score INTEGER,
  field_name TEXT,
  field_image TEXT,
  net_match_time INTEGER,
  stats JSONB DEFAULT '{}',
  events JSONB DEFAULT '[]',
  current_goalkeeper_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match ratings table
CREATE TABLE match_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  rating INTEGER,
  notes TEXT,
  UNIQUE(match_id, player_id)
);

-- MVP records table
CREATE TABLE mvp_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  player_id UUID NOT NULL,
  date TEXT NOT NULL,
  opponent TEXT NOT NULL,
  rating INTEGER
);

-- Enable Row Level Security (RLS)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mvp_records ENABLE ROW LEVEL SECURITY;

-- Public access policies (since data is shared among all users)
-- Players policies
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Public delete players" ON players FOR DELETE USING (true);

-- Matches policies
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Public delete matches" ON matches FOR DELETE USING (true);

-- Match ratings policies
CREATE POLICY "Public read match_ratings" ON match_ratings FOR SELECT USING (true);
CREATE POLICY "Public insert match_ratings" ON match_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update match_ratings" ON match_ratings FOR UPDATE USING (true);
CREATE POLICY "Public delete match_ratings" ON match_ratings FOR DELETE USING (true);

-- MVP records policies
CREATE POLICY "Public read mvp_records" ON mvp_records FOR SELECT USING (true);
CREATE POLICY "Public insert mvp_records" ON mvp_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update mvp_records" ON mvp_records FOR UPDATE USING (true);
CREATE POLICY "Public delete mvp_records" ON mvp_records FOR DELETE USING (true);
