-- 1. Interne Konfigurationstabelle (nur via SECURITY DEFINER Funktionen erreichbar)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
-- Absichtlich keine Policies: kein Zugriff für anon/authenticated.

CREATE TRIGGER update_app_config_updated_at
BEFORE UPDATE ON public.app_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Zugriffsschutz auf den Runden-Tabellen (keine Policies -> kein Direktzugriff)
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_events ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.rounds TO service_role;
GRANT ALL ON public.teams TO service_role;
GRANT ALL ON public.score_events TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS rounds_code_key ON public.rounds (code);
CREATE UNIQUE INDEX IF NOT EXISTS score_events_team_event_key ON public.score_events (team_id, event_id);

-- 3. Öffentliche, eng begrenzte Funktionen
CREATE OR REPLACE FUNCTION public.round_lookup(p_code text)
RETURNS TABLE (code text, title text, status text, budget_min integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.code, r.title, r.status, r.budget_min
  FROM public.rounds r
  WHERE r.code = upper(btrim(p_code))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.round_join(
  p_code text,
  p_team_name text,
  p_members jsonb,
  p_token_hash text
)
RETURNS TABLE (team_id uuid, round_code text, round_title text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round public.rounds;
  v_team_id uuid;
BEGIN
  IF p_token_hash IS NULL OR length(p_token_hash) < 32 THEN
    RAISE EXCEPTION 'Ungültiges Team-Token.';
  END IF;
  IF length(btrim(p_team_name)) < 2 OR length(btrim(p_team_name)) > 60 THEN
    RAISE EXCEPTION 'Teamname muss zwischen 2 und 60 Zeichen lang sein.';
  END IF;

  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  IF v_round.status <> 'open' THEN
    RAISE EXCEPTION 'Diese Runde ist geschlossen.';
  END IF;

  INSERT INTO public.teams (round_id, name, members, token_hash)
  VALUES (
    v_round.id,
    btrim(p_team_name),
    COALESCE(p_members, '[]'::jsonb),
    p_token_hash
  )
  RETURNING id INTO v_team_id;

  RETURN QUERY SELECT v_team_id, v_round.code, v_round.title;
END;
$$;

CREATE OR REPLACE FUNCTION public.round_push_events(
  p_team_id uuid,
  p_token_hash text,
  p_events jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_count integer;
BEGIN
  SELECT token_hash INTO v_hash FROM public.teams WHERE id = p_team_id;
  IF v_hash IS NULL OR p_token_hash IS NULL OR v_hash <> p_token_hash THEN
    RAISE EXCEPTION 'Team nicht bekannt.';
  END IF;
  IF p_events IS NULL OR jsonb_typeof(p_events) <> 'array' THEN
    RETURN 0;
  END IF;
  IF jsonb_array_length(p_events) > 200 THEN
    RAISE EXCEPTION 'Zu viele Ereignisse.';
  END IF;

  WITH src AS (
    SELECT
      p_team_id AS team_id,
      e->>'id' AS event_id,
      e->>'type' AS type,
      COALESCE(e - 'id' - 'type', '{}'::jsonb) AS payload
    FROM jsonb_array_elements(p_events) e
    WHERE e->>'id' IS NOT NULL
      AND e->>'type' IN ('stage_solved','badge_earned','hint_revealed','hearing_answer')
  ), ins AS (
    INSERT INTO public.score_events (team_id, event_id, type, payload)
    SELECT team_id, event_id, type, payload FROM src
    ON CONFLICT (team_id, event_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_count FROM ins;

  RETURN COALESCE(v_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.round_finish(p_team_id uuid, p_token_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
BEGIN
  SELECT token_hash INTO v_hash FROM public.teams WHERE id = p_team_id;
  IF v_hash IS NULL OR p_token_hash IS NULL OR v_hash <> p_token_hash THEN
    RAISE EXCEPTION 'Team nicht bekannt.';
  END IF;
  UPDATE public.teams
  SET finished_at = now()
  WHERE id = p_team_id AND finished_at IS NULL;
  RETURN true;
END;
$$;

-- Rangliste: Rundeninfo + Teams + Roh-Ereignisse (Punkteberechnung im Server-Code)
CREATE OR REPLACE FUNCTION public.round_leaderboard_data(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round public.rounds;
BEGIN
  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'code', v_round.code,
    'title', v_round.title,
    'status', v_round.status,
    'budgetMin', v_round.budget_min,
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'finished_at', t.finished_at))
      FROM public.teams t WHERE t.round_id = v_round.id
    ), '[]'::jsonb),
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'team_id', s.team_id, 'event_id', s.event_id, 'type', s.type, 'payload', s.payload))
      FROM public.score_events s
      JOIN public.teams t ON t.id = s.team_id
      WHERE t.round_id = v_round.id
    ), '[]'::jsonb)
  );
END;
$$;

-- 4. Lehrer-Funktionen (Passwort-Hash liegt in app_config)
CREATE OR REPLACE FUNCTION public.assert_teacher(p_password_hash text)
RETURNS void
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expected text;
BEGIN
  SELECT value INTO v_expected FROM public.app_config WHERE key = 'teacher_password_hash';
  IF v_expected IS NULL THEN
    RAISE EXCEPTION 'Lehrer-Passwort ist auf dem Server nicht gesetzt.';
  END IF;
  IF p_password_hash IS NULL OR p_password_hash <> v_expected THEN
    RAISE EXCEPTION 'Passwort falsch.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_list_rounds(p_password_hash text)
RETURNS TABLE (code text, title text, status text, created_at timestamptz, team_count integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  RETURN QUERY
  SELECT r.code, r.title, r.status, r.created_at,
         (SELECT count(*)::integer FROM public.teams t WHERE t.round_id = r.id)
  FROM public.rounds r
  ORDER BY r.created_at DESC
  LIMIT 50;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_create_round(
  p_password_hash text,
  p_code text,
  p_title text,
  p_budget_min integer
)
RETURNS TABLE (code text, title text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_budget_min < 15 OR p_budget_min > 240 THEN
    RAISE EXCEPTION 'Ungültiges Zeitbudget.';
  END IF;
  RETURN QUERY
  INSERT INTO public.rounds (code, title, budget_min)
  VALUES (upper(btrim(p_code)), btrim(p_title), p_budget_min)
  RETURNING rounds.code, rounds.title, rounds.status;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_set_round_status(
  p_password_hash text,
  p_code text,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_status NOT IN ('open','closed') THEN
    RAISE EXCEPTION 'Ungültiger Status.';
  END IF;
  UPDATE public.rounds SET status = p_status WHERE code = upper(btrim(p_code));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_delete_team(p_password_hash text, p_team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  DELETE FROM public.score_events WHERE team_id = p_team_id;
  DELETE FROM public.teams WHERE id = p_team_id;
  RETURN true;
END;
$$;

-- 5. Ausführungsrechte: nur diese Funktionen sind die Türen
REVOKE ALL ON FUNCTION public.assert_teacher(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.round_lookup(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.round_join(text, text, jsonb, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.round_push_events(uuid, text, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.round_finish(uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.round_leaderboard_data(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_list_rounds(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_create_round(text, text, text, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_set_round_status(text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_delete_team(text, uuid) TO anon, authenticated, service_role;