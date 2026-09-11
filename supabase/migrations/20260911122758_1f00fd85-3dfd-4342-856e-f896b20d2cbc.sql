CREATE OR REPLACE FUNCTION public.teacher_set_team_variant(p_password_hash text, p_team_id uuid, p_variant text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_paths integer;
  v_variant text;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);

  SELECT GREATEST(1, LEAST(4, COALESCE(r.path_count, 1)))
    INTO v_paths
    FROM public.teams t
    JOIN public.rounds r ON r.id = t.round_id
   WHERE t.id = p_team_id;

  IF v_paths IS NULL THEN
    RAISE EXCEPTION 'Diese Gruppe existiert nicht.';
  END IF;

  v_variant := nullif(upper(btrim(coalesce(p_variant, ''))), '');

  IF v_variant IS NOT NULL THEN
    IF v_variant NOT IN ('A','B','C','D')
       OR ascii(v_variant) - 64 > v_paths THEN
      RAISE EXCEPTION 'Dieser Weg ist in dieser Runde nicht vorgesehen.';
    END IF;
  END IF;

  UPDATE public.teams SET variant = v_variant, updated_at = now() WHERE id = p_team_id;
  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.teacher_set_team_variant(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teacher_set_team_variant(text, uuid, text) TO service_role;