CREATE TABLE public.rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  name text NOT NULL,
  members text[] NOT NULL DEFAULT '{}',
  token_hash text NOT NULL,
  stages_done integer NOT NULL DEFAULT 0,
  hints_used integer NOT NULL DEFAULT 0,
  badges text[] NOT NULL DEFAULT '{}',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX teams_round_id_idx ON public.teams(round_id);
CREATE UNIQUE INDEX teams_round_name_idx ON public.teams(round_id, lower(name));

GRANT SELECT (id, code, title, status, created_at) ON public.rounds TO anon, authenticated;
GRANT ALL ON public.rounds TO service_role;

GRANT SELECT (id, round_id, name, members, stages_done, hints_used, badges, started_at, finished_at, created_at) ON public.teams TO anon, authenticated;
GRANT ALL ON public.teams TO service_role;

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rounds are readable by everyone"
  ON public.rounds FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Teams are readable by everyone"
  ON public.teams FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON public.rounds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.teams REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;