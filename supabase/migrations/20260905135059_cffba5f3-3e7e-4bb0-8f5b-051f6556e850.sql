CREATE OR REPLACE FUNCTION public.teacher_list_messages(p_password_hash text, p_code text)
RETURNS TABLE(id uuid, team_id uuid, team_name text, body text, created_at timestamptz)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  RETURN QUERY
  SELECT m.id, m.team_id, t.name, m.body, m.created_at
  FROM public.round_messages m
  JOIN public.rounds r ON r.id = m.round_id
  LEFT JOIN public.teams t ON t.id = m.team_id
  WHERE r.code = upper(btrim(p_code))
  ORDER BY m.created_at DESC
  LIMIT 300;
END;
$$;