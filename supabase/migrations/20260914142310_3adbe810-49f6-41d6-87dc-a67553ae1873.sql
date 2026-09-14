DROP FUNCTION IF EXISTS public.teacher_list_rounds(text);

CREATE OR REPLACE FUNCTION public.teacher_list_rounds(p_password_hash text)
 RETURNS TABLE(code text, title text, status text, created_at timestamp with time zone, team_count integer, budget_min integer, started_at timestamp with time zone, path_count integer, branches jsonb, station_descriptions jsonb)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  RETURN QUERY
  SELECT r.code, r.title, r.status, r.created_at,
         (SELECT count(*)::integer FROM public.teams t WHERE t.round_id = r.id),
         r.budget_min, r.started_at, r.path_count, r.branches, r.station_descriptions
  FROM public.rounds r
  ORDER BY r.created_at DESC
  LIMIT 50;
END;
$function$;