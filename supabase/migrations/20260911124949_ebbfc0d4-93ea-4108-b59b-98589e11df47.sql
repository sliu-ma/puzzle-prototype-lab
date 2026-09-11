DROP FUNCTION public.teacher_set_station_descriptions(text, text, jsonb);
DROP FUNCTION public.teacher_create_round(text, text, text, integer, integer, jsonb);

CREATE FUNCTION public.teacher_create_round(
  p_password_hash text,
  p_code text,
  p_title text,
  p_budget_min integer,
  p_path_count integer DEFAULT 1,
  p_branches jsonb DEFAULT '{}'::jsonb,
  p_station_descriptions jsonb DEFAULT '{}'::jsonb
)
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
    code, title, budget_min, path_count, branches, station_descriptions
  )
  VALUES (
    upper(btrim(p_code)), btrim(p_title), p_budget_min, v_paths, v_branches, v_descriptions
  )
  RETURNING rounds.code, rounds.title, rounds.status;
END;
$function$;