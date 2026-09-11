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

  IF COALESCE(v_round.path_count, 1) > 1 AND v_assigned > 0 THEN
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