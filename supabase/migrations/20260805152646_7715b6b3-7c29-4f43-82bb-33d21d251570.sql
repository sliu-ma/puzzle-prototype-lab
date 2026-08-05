-- 1. Rundenzustände erweitern
ALTER TABLE public.rounds ADD COLUMN IF NOT EXISTS started_at timestamptz;
UPDATE public.rounds SET status = 'lobby' WHERE status = 'open';
ALTER TABLE public.rounds ALTER COLUMN status SET DEFAULT 'lobby';

-- 2. Bestehende Funktionen anpassen
DROP FUNCTION IF EXISTS public.round_lookup(text);
DROP FUNCTION IF EXISTS public.round_join(text, text, jsonb, text);
DROP FUNCTION IF EXISTS public.teacher_list_rounds(text);

CREATE OR REPLACE FUNCTION public.round_lookup(p_code text)
RETURNS TABLE(code text, title text, status text, budget_min integer, started_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT r.code, r.title, r.status, r.budget_min, r.started_at
  FROM public.rounds r
  WHERE r.code = upper(btrim(p_code))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.round_join(p_code text, p_team_name text, p_members jsonb, p_token_hash text)
RETURNS TABLE(team_id uuid, round_code text, round_title text, round_status text, started_at timestamptz, budget_min integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
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
  IF v_round.status NOT IN ('lobby','running','open') THEN
    RAISE EXCEPTION 'Diese Runde ist geschlossen.';
  END IF;

  INSERT INTO public.teams (round_id, name, members, token_hash)
  VALUES (v_round.id, btrim(p_team_name), COALESCE(p_members, '[]'::jsonb), p_token_hash)
  RETURNING id INTO v_team_id;

  RETURN QUERY SELECT v_team_id, v_round.code, v_round.title, v_round.status, v_round.started_at, v_round.budget_min;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_set_round_status(p_password_hash text, p_code text, p_status text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_status NOT IN ('lobby','running','closed') THEN
    RAISE EXCEPTION 'Ungültiger Status.';
  END IF;
  UPDATE public.rounds SET status = p_status WHERE code = upper(btrim(p_code));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_list_rounds(p_password_hash text)
RETURNS TABLE(code text, title text, status text, created_at timestamptz, team_count integer, budget_min integer, started_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  RETURN QUERY
  SELECT r.code, r.title, r.status, r.created_at,
         (SELECT count(*)::integer FROM public.teams t WHERE t.round_id = r.id),
         r.budget_min, r.started_at
  FROM public.rounds r
  ORDER BY r.created_at DESC
  LIMIT 50;
END;
$$;

-- 3. Neue Funktionen
CREATE OR REPLACE FUNCTION public.round_state(p_code text, p_team_id uuid, p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_round public.rounds;
  v_exists boolean := false;
BEGIN
  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  IF p_team_id IS NOT NULL AND p_token_hash IS NOT NULL THEN
    SELECT true INTO v_exists FROM public.teams t
    WHERE t.id = p_team_id AND t.round_id = v_round.id AND t.token_hash = p_token_hash;
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'code', v_round.code,
    'title', v_round.title,
    'status', v_round.status,
    'budgetMin', v_round.budget_min,
    'startedAt', v_round.started_at,
    'teamExists', COALESCE(v_exists, false),
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name) ORDER BY t.created_at)
      FROM public.teams t WHERE t.round_id = v_round.id
    ), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_start_round(p_password_hash text, p_code text)
RETURNS timestamptz
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_started timestamptz;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  UPDATE public.rounds
  SET status = 'running', started_at = COALESCE(started_at, now())
  WHERE code = upper(btrim(p_code))
  RETURNING started_at INTO v_started;
  IF v_started IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  RETURN v_started;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_update_round(p_password_hash text, p_code text, p_title text, p_budget_min integer)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_budget_min IS NOT NULL AND (p_budget_min < 15 OR p_budget_min > 240) THEN
    RAISE EXCEPTION 'Ungültiges Zeitbudget.';
  END IF;
  IF p_title IS NOT NULL AND length(btrim(p_title)) < 1 THEN
    RAISE EXCEPTION 'Titel darf nicht leer sein.';
  END IF;
  UPDATE public.rounds
  SET title = COALESCE(btrim(p_title), title),
      budget_min = COALESCE(p_budget_min, budget_min)
  WHERE code = upper(btrim(p_code));
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_delete_round(p_password_hash text, p_code text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  SELECT id INTO v_id FROM public.rounds WHERE code = upper(btrim(p_code));
  IF v_id IS NULL THEN
    RETURN true;
  END IF;
  DELETE FROM public.score_events WHERE team_id IN (SELECT id FROM public.teams WHERE round_id = v_id);
  DELETE FROM public.teams WHERE round_id = v_id;
  DELETE FROM public.rounds WHERE id = v_id;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_round_report(p_password_hash text, p_code text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_round public.rounds;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
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
    'startedAt', v_round.started_at,
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'name', t.name, 'members', t.members,
        'created_at', t.created_at, 'finished_at', t.finished_at) ORDER BY t.created_at)
      FROM public.teams t WHERE t.round_id = v_round.id
    ), '[]'::jsonb),
    'events', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'team_id', s.team_id, 'event_id', s.event_id, 'type', s.type,
        'payload', s.payload, 'created_at', s.created_at))
      FROM public.score_events s
      JOIN public.teams t ON t.id = s.team_id
      WHERE t.round_id = v_round.id
    ), '[]'::jsonb)
  );
END;
$$;

-- 4. Ausführungsrechte: nur die geprüften Einstiegspunkte
REVOKE ALL ON FUNCTION public.round_lookup(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.round_join(text, text, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.round_state(text, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_start_round(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_update_round(text, text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_delete_round(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_round_report(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_list_rounds(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.teacher_set_round_status(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.round_lookup(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.round_join(text, text, jsonb, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.round_state(text, uuid, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_start_round(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_update_round(text, text, text, integer) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_delete_round(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_round_report(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_list_rounds(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_set_round_status(text, text, text) TO anon, authenticated, service_role;