ALTER TABLE public.rounds
  ADD COLUMN IF NOT EXISTS path_count integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS branches jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS variant text;

-- Rückgabetyp ändert sich: alte Signaturen entfernen.
DROP FUNCTION IF EXISTS public.round_join(text, text, jsonb, text);
DROP FUNCTION IF EXISTS public.round_lookup(text);
DROP FUNCTION IF EXISTS public.teacher_create_round(text, text, text, integer);
DROP FUNCTION IF EXISTS public.teacher_list_rounds(text);

CREATE OR REPLACE FUNCTION public.round_lookup(p_code text)
 RETURNS TABLE(code text, title text, status text, budget_min integer, started_at timestamp with time zone, path_count integer, branches jsonb)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT r.code, r.title, r.status, r.budget_min, r.started_at, r.path_count, r.branches
  FROM public.rounds r
  WHERE r.code = upper(btrim(p_code))
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.teacher_create_round(p_password_hash text, p_code text, p_title text, p_budget_min integer, p_path_count integer DEFAULT 1, p_branches jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(code text, title text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_paths integer;
  v_branches jsonb;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_budget_min < 15 OR p_budget_min > 240 THEN
    RAISE EXCEPTION 'Ungültiges Zeitbudget.';
  END IF;
  v_paths := COALESCE(p_path_count, 1);
  IF v_paths < 1 OR v_paths > 4 THEN
    RAISE EXCEPTION 'Anzahl Wege muss zwischen 1 und 4 liegen.';
  END IF;
  v_branches := COALESCE(p_branches, '{}'::jsonb);
  IF jsonb_typeof(v_branches) <> 'object' THEN
    RAISE EXCEPTION 'Ungültige Verzweigungen.';
  END IF;

  RETURN QUERY
  INSERT INTO public.rounds (code, title, budget_min, path_count, branches)
  VALUES (upper(btrim(p_code)), btrim(p_title), p_budget_min, v_paths, v_branches)
  RETURNING rounds.code, rounds.title, rounds.status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.teacher_list_rounds(p_password_hash text)
 RETURNS TABLE(code text, title text, status text, created_at timestamp with time zone, team_count integer, budget_min integer, started_at timestamp with time zone, path_count integer, branches jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  RETURN QUERY
  SELECT r.code, r.title, r.status, r.created_at,
         (SELECT count(*)::integer FROM public.teams t WHERE t.round_id = r.id),
         r.budget_min, r.started_at, r.path_count, r.branches
  FROM public.rounds r
  ORDER BY r.created_at DESC
  LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.round_join(p_code text, p_team_name text, p_members jsonb, p_token_hash text)
 RETURNS TABLE(team_id uuid, round_code text, round_title text, round_status text, started_at timestamp with time zone, budget_min integer, path_count integer, branches jsonb, variant text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_team_id uuid;
  v_name text;
  v_variant text;
  v_assigned integer := 0;
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

  -- Buchstabe nur, wenn die Wege in dieser Runde schon verteilt wurden.
  SELECT count(*)::integer INTO v_assigned
    FROM public.teams t WHERE t.round_id = v_round.id AND t.variant IS NOT NULL;

  IF COALESCE(v_round.path_count, 1) > 1 AND v_assigned > 0 THEN
    SELECT l.letter INTO v_variant
      FROM (
        SELECT chr(64 + g) AS letter
        FROM generate_series(1, COALESCE(v_round.path_count, 1)) g
      ) l
      LEFT JOIN public.teams t
        ON t.round_id = v_round.id AND t.variant = l.letter
     GROUP BY l.letter
     ORDER BY count(t.id), random()
     LIMIT 1;
  END IF;

  INSERT INTO public.teams (round_id, name, members, token_hash, variant)
  VALUES (v_round.id, v_name, COALESCE(p_members, '[]'::jsonb), p_token_hash, v_variant)
  RETURNING id INTO v_team_id;

  RETURN QUERY SELECT v_team_id, v_round.code, v_round.title, v_round.status,
                      v_round.started_at, v_round.budget_min,
                      COALESCE(v_round.path_count, 1), COALESCE(v_round.branches, '{}'::jsonb),
                      v_variant;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Diesen Teamnamen gibt es in dieser Runde schon. Nehmt einen anderen.';
END;
$function$;

CREATE OR REPLACE FUNCTION public.teacher_assign_variants(p_password_hash text, p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_paths integer;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  v_paths := GREATEST(1, LEAST(4, COALESCE(v_round.path_count, 1)));

  IF v_paths = 1 THEN
    UPDATE public.teams SET variant = 'A' WHERE round_id = v_round.id;
  ELSE
    WITH shuffled AS (
      SELECT t.id, row_number() OVER (ORDER BY random()) AS rn
      FROM public.teams t WHERE t.round_id = v_round.id
    )
    UPDATE public.teams t
       SET variant = chr(64 + (((s.rn - 1) % v_paths) + 1))
      FROM shuffled s
     WHERE t.id = s.id;
  END IF;

  RETURN jsonb_build_object(
    'pathCount', v_paths,
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'variant', t.variant)
                       ORDER BY t.created_at)
      FROM public.teams t WHERE t.round_id = v_round.id
    ), '[]'::jsonb)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.round_state(p_code text, p_team_id uuid, p_token_hash text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_exists boolean := false;
  v_variant text;
BEGIN
  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  IF p_team_id IS NOT NULL AND p_token_hash IS NOT NULL THEN
    SELECT true, t.variant INTO v_exists, v_variant FROM public.teams t
    WHERE t.id = p_team_id AND t.round_id = v_round.id AND t.token_hash = p_token_hash;
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'code', v_round.code,
    'title', v_round.title,
    'status', v_round.status,
    'budgetMin', v_round.budget_min,
    'startedAt', v_round.started_at,
    'pathCount', COALESCE(v_round.path_count, 1),
    'branches', COALESCE(v_round.branches, '{}'::jsonb),
    'variant', v_variant,
    'teamExists', COALESCE(v_exists, false),
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name, 'variant', t.variant) ORDER BY t.created_at)
      FROM public.teams t WHERE t.round_id = v_round.id
    ), '[]'::jsonb),
    'messages', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'createdAt')
      FROM (
        SELECT jsonb_build_object('id', m.id, 'body', m.body, 'createdAt', m.created_at) AS x
        FROM public.round_messages m
        WHERE m.round_id = v_round.id
          AND (m.team_id IS NULL OR (COALESCE(v_exists, false) AND m.team_id = p_team_id))
        ORDER BY m.created_at DESC
        LIMIT 20
      ) sub
    ), '[]'::jsonb)
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.teacher_round_report(p_password_hash text, p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'pathCount', COALESCE(v_round.path_count, 1),
    'branches', COALESCE(v_round.branches, '{}'::jsonb),
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'name', t.name, 'members', t.members, 'variant', t.variant,
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
$function$;