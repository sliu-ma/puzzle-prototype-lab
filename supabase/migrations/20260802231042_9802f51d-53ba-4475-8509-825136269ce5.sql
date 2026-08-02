-- Öffentliche Direktlesezugriffe entfernen
DROP POLICY IF EXISTS "Rounds are readable by everyone" ON public.rounds;
DROP POLICY IF EXISTS "Teams are readable by everyone" ON public.teams;

REVOKE SELECT ON public.rounds FROM anon, authenticated;
REVOKE SELECT ON public.teams FROM anon, authenticated;

GRANT ALL ON public.rounds TO service_role;
GRANT ALL ON public.teams TO service_role;

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Nachschlagen einer Runde nur mit Kenntnis des Codes, ohne Code-Auflistung
CREATE OR REPLACE FUNCTION public.get_round_by_code(_code text)
RETURNS TABLE (id uuid, title text, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.title, r.status
  FROM public.rounds r
  WHERE r.code = upper(btrim(coalesce(_code, '')))
  LIMIT 1
$$;

-- Rangliste nur mit Kenntnis des Codes, ohne token_hash
CREATE OR REPLACE FUNCTION public.get_leaderboard_by_code(_code text)
RETURNS TABLE (
  id uuid,
  name text,
  members text[],
  stages_done integer,
  hints_used integer,
  badges text[],
  started_at timestamptz,
  finished_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.name, t.members, t.stages_done, t.hints_used, t.badges,
         t.started_at, t.finished_at
  FROM public.teams t
  JOIN public.rounds r ON r.id = t.round_id
  WHERE r.code = upper(btrim(coalesce(_code, '')))
$$;

REVOKE ALL ON FUNCTION public.get_round_by_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_leaderboard_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_round_by_code(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_by_code(text) TO anon, authenticated, service_role;