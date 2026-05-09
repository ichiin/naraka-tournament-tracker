CREATE TABLE banpick_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  pool_number INTEGER NOT NULL CHECK (pool_number BETWEEN 1 AND 4),
  name TEXT NOT NULL DEFAULT '',
  player_name TEXT NOT NULL DEFAULT '',
  won_duel BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tournament_id, pool_number)
);

CREATE TABLE banpick_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
  game_number INTEGER NOT NULL CHECK (game_number BETWEEN 2 AND 5),
  pool_id UUID NOT NULL REFERENCES banpick_pools(id) ON DELETE CASCADE,
  hero_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tournament_id, round_number, game_number)
);

CREATE INDEX idx_banpick_pools_tournament ON banpick_pools(tournament_id);
CREATE INDEX idx_banpick_picks_tournament ON banpick_picks(tournament_id);
CREATE INDEX idx_banpick_picks_round ON banpick_picks(tournament_id, round_number);

ALTER TABLE banpick_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE banpick_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read banpick_pools" ON banpick_pools
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert banpick_pools" ON banpick_pools
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update banpick_pools" ON banpick_pools
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete banpick_pools" ON banpick_pools
  FOR DELETE USING (true);

CREATE POLICY "Allow all read banpick_picks" ON banpick_picks
  FOR SELECT USING (true);

CREATE POLICY "Allow all insert banpick_picks" ON banpick_picks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update banpick_picks" ON banpick_picks
  FOR UPDATE USING (true);

CREATE POLICY "Allow all delete banpick_picks" ON banpick_picks
  FOR DELETE USING (true);
