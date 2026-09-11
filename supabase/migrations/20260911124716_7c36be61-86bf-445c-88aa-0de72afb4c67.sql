ALTER TABLE public.rounds
ADD COLUMN IF NOT EXISTS station_descriptions jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.teacher_set_station_descriptions(
  p_password_hash text,
  p_code text,
  p_station_descriptions jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_value jsonb;
  v_text text;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  SELECT * INTO v_round
  FROM public.rounds
  WHERE code = upper(btrim(p_code))
  LIMIT 1;

  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  IF v_round.status <> 'lobby' THEN
    RAISE EXCEPTION 'Ortsbeschreibungen lassen sich nur vor dem Start ändern.';
  END IF;
  IF p_station_descriptions IS NULL OR jsonb_typeof(p_station_descriptions) <> 'object' THEN
    RAISE EXCEPTION 'Ungültige Ortsbeschreibungen.';
  END IF;

  FOR v_value IN SELECT value FROM jsonb_each(p_station_descriptions)
  LOOP
    IF jsonb_typeof(v_value) <> 'array' THEN
      RAISE EXCEPTION 'Ungültige Ortsbeschreibungen.';
    END IF;
    FOR v_text IN SELECT jsonb_array_elements_text(v_value)
    LOOP
      IF length(v_text) > 160 THEN
        RAISE EXCEPTION 'Eine Ortsbeschreibung darf höchstens 160 Zeichen haben.';
      END IF;
    END LOOP;
  END LOOP;

  UPDATE public.rounds
  SET station_descriptions = p_station_descriptions,
      updated_at = now()
  WHERE id = v_round.id;
  RETURN true;
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
  IF v_round.status <> 'lobby' THEN
    RAISE EXCEPTION 'Die Wege lassen sich nach dem Start nicht mehr verändern.';
  END IF;
  v_paths := GREATEST(1, LEAST(4, COALESCE(v_round.path_count, 1)));

  IF v_paths = 1 THEN
    UPDATE public.teams SET variant = 'A' WHERE round_id = v_round.id;
  ELSE
    WITH shuffled AS (
      SELECT t.id, (row_number() OVER (ORDER BY random()))::integer AS rn
      FROM public.teams t WHERE t.round_id = v_round.id
    )
    UPDATE public.teams t
       SET variant = chr((64 + (((s.rn - 1) % v_paths) + 1))::integer)
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

CREATE OR REPLACE FUNCTION public.teacher_set_team_variant(p_password_hash text, p_team_id uuid, p_variant text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_paths integer;
  v_status text;
  v_variant text;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);

  SELECT GREATEST(1, LEAST(4, COALESCE(r.path_count, 1))), r.status
    INTO v_paths, v_status
    FROM public.teams t
    JOIN public.rounds r ON r.id = t.round_id
   WHERE t.id = p_team_id;

  IF v_paths IS NULL THEN
    RAISE EXCEPTION 'Diese Gruppe existiert nicht.';
  END IF;
  IF v_status <> 'lobby' THEN
    RAISE EXCEPTION 'Der Weg lässt sich nach dem Start nicht mehr verändern.';
  END IF;

  v_variant := nullif(upper(btrim(coalesce(p_variant, ''))), '');
  IF v_variant IS NOT NULL THEN
    IF v_variant NOT IN ('A','B','C','D') OR ascii(v_variant) - 64 > v_paths THEN
      RAISE EXCEPTION 'Dieser Weg ist in dieser Runde nicht vorgesehen.';
    END IF;
  END IF;

  UPDATE public.teams SET variant = v_variant, updated_at = now() WHERE id = p_team_id;
  RETURN true;
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

  SELECT count(*)::integer INTO v_assigned
  FROM public.teams t WHERE t.round_id = v_round.id AND t.variant IS NOT NULL;

  IF COALESCE(v_round.path_count, 1) > 1
     AND (v_round.status = 'running' OR v_assigned > 0) THEN
    SELECT l.letter INTO v_variant
    FROM (
      SELECT chr((64 + g)::integer) AS letter
      FROM generate_series(1, COALESCE(v_round.path_count, 1)) g
    ) l
    LEFT JOIN public.teams t
      ON t.round_id = v_round.id AND t.variant = l.letter
    GROUP BY l.letter
    ORDER BY count(t.id), random()
    LIMIT 1;
  ELSIF COALESCE(v_round.path_count, 1) = 1 THEN
    v_variant := 'A';
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
    'stationDescriptions', COALESCE(v_round.station_descriptions, '{}'::jsonb),
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