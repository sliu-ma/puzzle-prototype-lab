-- Teamnamen innerhalb einer Runde eindeutig (Gross-/Kleinschreibung egal)
CREATE UNIQUE INDEX IF NOT EXISTS teams_round_name_unique
  ON public.teams (round_id, lower(btrim(name)));

-- round_join: verständliche Meldung statt Index-Fehler bei doppeltem Namen
CREATE OR REPLACE FUNCTION public.round_join(p_code text, p_team_name text, p_members jsonb, p_token_hash text)
 RETURNS TABLE(team_id uuid, round_code text, round_title text, round_status text, started_at timestamp with time zone, budget_min integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_team_id uuid;
  v_name text;
BEGIN
  IF p_token_hash IS NULL OR length(p_token_hash) < 32 THEN
    RAISE EXCEPTION 'Ungültiges Team-Token.';
  END IF;
  v_name := btrim(p_team_name);
  IF length(v_name) < 2 OR length(v_name) > 60 THEN
    RAISE EXCEPTION 'Teamname muss zwischen 2 und 60 Zeichen lang sein.';
  END IF;

  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  IF v_round.status NOT IN ('lobby','running','open') THEN
    RAISE EXCEPTION 'Diese Runde ist geschlossen.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.round_id = v_round.id AND lower(btrim(t.name)) = lower(v_name)
  ) THEN
    RAISE EXCEPTION 'Diesen Teamnamen gibt es in dieser Runde schon. Nehmt einen anderen.';
  END IF;

  INSERT INTO public.teams (round_id, name, members, token_hash)
  VALUES (v_round.id, v_name, COALESCE(p_members, '[]'::jsonb), p_token_hash)
  RETURNING id INTO v_team_id;

  RETURN QUERY SELECT v_team_id, v_round.code, v_round.title, v_round.status, v_round.started_at, v_round.budget_min;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Diesen Teamnamen gibt es in dieser Runde schon. Nehmt einen anderen.';
END;
$function$;
