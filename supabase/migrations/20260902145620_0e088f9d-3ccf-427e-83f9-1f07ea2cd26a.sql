CREATE TABLE public.round_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX round_messages_round_idx ON public.round_messages (round_id, created_at DESC);

GRANT ALL ON public.round_messages TO service_role;

ALTER TABLE public.round_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.teacher_send_message(p_password_hash text, p_code text, p_team_id uuid, p_body text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_round_id uuid;
  v_body text;
  v_id uuid;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  v_body := btrim(p_body);
  IF length(v_body) < 1 THEN
    RAISE EXCEPTION 'Nachricht darf nicht leer sein.';
  END IF;
  IF length(v_body) > 300 THEN
    v_body := left(v_body, 300);
  END IF;
  SELECT id INTO v_round_id FROM public.rounds WHERE code = upper(btrim(p_code));
  IF v_round_id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;
  IF p_team_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.teams t WHERE t.id = p_team_id AND t.round_id = v_round_id
  ) THEN
    RAISE EXCEPTION 'Diese Gruppe gehört nicht zu dieser Runde.';
  END IF;

  INSERT INTO public.round_messages (round_id, team_id, body)
  VALUES (v_round_id, p_team_id, v_body)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

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
  LIMIT 20;
END;
$$;

CREATE OR REPLACE FUNCTION public.round_state(p_code text, p_team_id uuid, p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_round public.rounds;
  v_exists boolean := false;
BEGIN
  SELECT * INTO v_round FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round.id IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  IF p_team_id IS NOT NULL AND p_token_hash IS NOT NULL THEN
    SELECT true INTO v_exists FROM public.teams t
    WHERE t.id = p_team_id AND t.round_id = v_round.id AND t.token_hash = p_token_hash;
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'code', v_round.code,
    'title', v_round.title,
    'status', v_round.status,
    'budgetMin', v_round.budget_min,
    'startedAt', v_round.started_at,
    'teamExists', COALESCE(v_exists, false),
    'teams', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', t.id, 'name', t.name) ORDER BY t.created_at)
      FROM public.teams t WHERE t.round_id = v_round.id
    ), '[]'::jsonb),
    'messages', COALESCE((
      SELECT jsonb_agg(x ORDER BY x->>'createdAt')
      FROM (
        SELECT jsonb_build_object('id', m.id, 'body', m.body, 'createdAt', m.created_at) AS x
        FROM public.round_messages m
        WHERE m.round_id = v_round.id
          AND (m.team_id IS NULL OR (COALESCE(v_exists, false) AND m.team_id = p_team_id))
        ORDER BY m.created_at DESC
        LIMIT 20
      ) sub
    ), '[]'::jsonb)
  );
END;
$$;