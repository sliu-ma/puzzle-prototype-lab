CREATE OR REPLACE FUNCTION public.teacher_start_round(p_password_hash text, p_code text)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_round public.rounds;
  v_started timestamptz;
  v_paths integer;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  SELECT * INTO v_round
  FROM public.rounds
  WHERE code = upper(btrim(p_code))
  LIMIT 1
  FOR UPDATE;

  IF v_round.id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  IF v_round.status <> 'lobby' THEN
    RAISE EXCEPTION 'Diese Runde wurde bereits gestartet.';
  END IF;

  v_paths := GREATEST(1, LEAST(4, COALESCE(v_round.path_count, 1)));
  IF v_paths = 1 THEN
    UPDATE public.teams
    SET variant = 'A', updated_at = now()
    WHERE round_id = v_round.id;
  ELSE
    WITH shuffled AS (
      SELECT t.id, (row_number() OVER (ORDER BY random()))::integer AS rn
      FROM public.teams t
      WHERE t.round_id = v_round.id
    )
    UPDATE public.teams t
    SET variant = chr((64 + (((s.rn - 1) % v_paths) + 1))::integer),
        updated_at = now()
    FROM shuffled s
    WHERE t.id = s.id;
  END IF;

  UPDATE public.rounds
  SET status = 'running', started_at = COALESCE(started_at, now())
  WHERE id = v_round.id
  RETURNING started_at INTO v_started;

  RETURN v_started;
END;
$function$;