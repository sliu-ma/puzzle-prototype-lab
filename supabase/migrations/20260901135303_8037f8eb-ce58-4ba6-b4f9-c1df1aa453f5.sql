CREATE OR REPLACE FUNCTION public.round_push_events(p_team_id uuid, p_token_hash text, p_events jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  IF jsonb_array_length(p_events) > 400 THEN
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
      AND e->>'type' IN ('stage_solved','badge_earned','hint_revealed','hearing_answer','stage_scanned','hearing_attempt')
  ), ins AS (
    INSERT INTO public.score_events (team_id, event_id, type, payload)
    SELECT team_id, event_id, type, payload FROM src
    ON CONFLICT (team_id, event_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_count FROM ins;

  RETURN COALESCE(v_count, 0);
END;
$function$;