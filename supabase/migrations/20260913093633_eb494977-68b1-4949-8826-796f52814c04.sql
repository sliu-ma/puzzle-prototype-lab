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

REVOKE ALL ON FUNCTION public.teacher_set_station_descriptions(text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_set_station_descriptions(text, text, jsonb) TO anon, authenticated, service_role;