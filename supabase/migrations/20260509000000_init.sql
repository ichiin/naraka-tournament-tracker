-- Create the initial tables for the Naraka Tournament Hero Tracker

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('solo', 'trios')),
  num_participants INTEGER NOT NULL CHECK (num_participants > 0),
  num_games INTEGER NOT NULL CHECK (num_games > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL CHECK (game_number >= 1),
  hero_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_participants_tournament ON participants(tournament_id);
CREATE INDEX idx_picks_tournament ON picks(tournament_id);
CREATE INDEX idx_picks_participant_game ON picks(participant_id, game_number);

-- RLS policies: allow all read/write (no auth, shareable by link)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read tournaments" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert tournaments" ON tournaments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update tournaments" ON tournaments
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete tournaments" ON tournaments
  FOR DELETE USING (true);

CREATE POLICY "Allow all read participants" ON participants
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert participants" ON participants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update participants" ON participants
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete participants" ON participants
  FOR DELETE USING (true);

CREATE POLICY "Allow all read picks" ON picks
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert picks" ON picks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update picks" ON picks
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete picks" ON picks
  FOR DELETE USING (true);
