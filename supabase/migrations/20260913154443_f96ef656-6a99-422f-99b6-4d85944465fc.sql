-- 1. Neue Runden starten in Planung
CREATE OR REPLACE FUNCTION public.teacher_create_round(p_password_hash text, p_code text, p_title text, p_budget_min integer, p_path_count integer DEFAULT 1, p_branches jsonb DEFAULT '{}'::jsonb, p_station_descriptions jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(code text, title text, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_paths integer;
  v_branches jsonb;
  v_descriptions jsonb;
  v_value jsonb;
  v_text text;
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
  v_descriptions := COALESCE(p_station_descriptions, '{}'::jsonb);
  IF jsonb_typeof(v_descriptions) <> 'object' THEN
    RAISE EXCEPTION 'Ungültige Ortsbeschreibungen.';
  END IF;
  FOR v_value IN SELECT value FROM jsonb_each(v_descriptions)
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

  RETURN QUERY
  INSERT INTO public.rounds (
    code, title, budget_min, path_count, branches, station_descriptions, status
  )
  VALUES (
    upper(btrim(p_code)), btrim(p_title), p_budget_min, v_paths, v_branches, v_descriptions, 'planning'
  )
  RETURNING rounds.code, rounds.title, rounds.status;
END;
$function$;

-- 2. Beitritt in Planung sperren
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
  IF v_round.status = 'planning' THEN
    RAISE EXCEPTION 'Diese Runde ist noch nicht offen.';
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

-- 3. Status: planning nur ohne Gruppen
CREATE OR REPLACE FUNCTION public.teacher_set_round_status(p_password_hash text, p_code text, p_status text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_teams integer := 0;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_status NOT IN ('planning','lobby','running','closed') THEN
    RAISE EXCEPTION 'Ungültiger Status.';
  END IF;

  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;

  IF p_status = 'planning' THEN
    SELECT count(*)::integer INTO v_teams FROM public.teams t WHERE t.round_id = v_round.id;
    IF v_teams > 0 THEN
      RAISE EXCEPTION 'Es sind schon Gruppen angemeldet. Die Runde kann nicht zurück in die Planung.';
    END IF;
    IF v_round.started_at IS NOT NULL THEN
      RAISE EXCEPTION 'Diese Runde wurde schon gestartet.';
    END IF;
  END IF;

  UPDATE public.rounds SET status = p_status, updated_at = now() WHERE id = v_round.id;
  RETURN true;
END;
$function$;

-- 4. Wege und Orte in der Planung ändern
CREATE OR REPLACE FUNCTION public.teacher_set_round_paths(p_password_hash text, p_code text, p_path_count integer, p_branches jsonb, p_station_descriptions jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_paths integer;
  v_branches jsonb;
  v_descriptions jsonb;
  v_value jsonb;
  v_text text;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);

  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  IF v_round.status <> 'planning' THEN
    RAISE EXCEPTION 'Wege lassen sich nur in der Planung ändern.';
  END IF;

  v_paths := COALESCE(p_path_count, 1);
  IF v_paths < 1 OR v_paths > 4 THEN
    RAISE EXCEPTION 'Anzahl Wege muss zwischen 1 und 4 liegen.';
  END IF;
  v_branches := COALESCE(p_branches, '{}'::jsonb);
  IF jsonb_typeof(v_branches) <> 'object' THEN
    RAISE EXCEPTION 'Ungültige Verzweigungen.';
  END IF;
  v_descriptions := COALESCE(p_station_descriptions, '{}'::jsonb);
  IF jsonb_typeof(v_descriptions) <> 'object' THEN
    RAISE EXCEPTION 'Ungültige Ortsbeschreibungen.';
  END IF;
  FOR v_value IN SELECT value FROM jsonb_each(v_descriptions)
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
  SET path_count = v_paths,
      branches = v_branches,
      station_descriptions = v_descriptions,
      updated_at = now()
  WHERE id = v_round.id;

  RETURN true;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.teacher_set_round_paths(text, text, integer, jsonb, jsonb) TO anon, authenticated, service_role;