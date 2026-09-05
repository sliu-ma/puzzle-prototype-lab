-- 1) Anmeldeversuche der Lehrperson (Brute-Force-Bremse)
CREATE TABLE IF NOT EXISTS public.teacher_login_attempts (
  bucket text PRIMARY KEY,
  fails integer NOT NULL DEFAULT 0,
  blocked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.teacher_login_attempts TO service_role;
ALTER TABLE public.teacher_login_attempts ENABLE ROW LEVEL SECURITY;
-- Keine Policies: der Zugriff läuft ausschliesslich über die geprüften
-- SECURITY-DEFINER-Funktionen unten.

CREATE OR REPLACE FUNCTION public.teacher_login_gate(p_bucket text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_until timestamptz;
BEGIN
  IF p_bucket IS NULL OR length(p_bucket) = 0 THEN
    RETURN 0;
  END IF;
  DELETE FROM public.teacher_login_attempts
   WHERE updated_at < now() - interval '1 day';
  SELECT blocked_until INTO v_until
    FROM public.teacher_login_attempts WHERE bucket = p_bucket;
  IF v_until IS NOT NULL AND v_until > now() THEN
    RETURN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_until - now())))::integer);
  END IF;
  RETURN 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_login_result(p_bucket text, p_ok boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fails integer;
BEGIN
  IF p_bucket IS NULL OR length(p_bucket) = 0 THEN
    RETURN;
  END IF;
  IF p_ok THEN
    DELETE FROM public.teacher_login_attempts WHERE bucket = p_bucket;
    RETURN;
  END IF;
  INSERT INTO public.teacher_login_attempts (bucket, fails, updated_at)
  VALUES (p_bucket, 1, now())
  ON CONFLICT (bucket) DO UPDATE
    SET fails = public.teacher_login_attempts.fails + 1,
        updated_at = now()
  RETURNING fails INTO v_fails;

  IF v_fails >= 5 THEN
    UPDATE public.teacher_login_attempts
       SET blocked_until = now() + (LEAST(v_fails - 4, 10) * interval '30 seconds')
     WHERE bucket = p_bucket;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.teacher_login_gate(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.teacher_login_result(text, boolean) TO anon, authenticated, service_role;

-- 2) Passwortprüfung zeitunabhängig
CREATE OR REPLACE FUNCTION public.assert_teacher(p_password_hash text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expected text;
  v_diff integer := 0;
  i integer;
BEGIN
  SELECT value INTO v_expected FROM public.app_config WHERE key = 'teacher_password_hash';
  IF v_expected IS NULL THEN
    RAISE EXCEPTION 'Lehrer-Zugang ist nicht konfiguriert.';
  END IF;
  IF p_password_hash IS NULL THEN
    RAISE EXCEPTION 'Passwort falsch.';
  END IF;
  IF length(p_password_hash) <> length(v_expected) THEN
    RAISE EXCEPTION 'Passwort falsch.';
  END IF;
  FOR i IN 1..length(v_expected) LOOP
    IF substr(p_password_hash, i, 1) <> substr(v_expected, i, 1) THEN
      v_diff := v_diff + 1;
    END IF;
  END LOOP;
  IF v_diff <> 0 THEN
    RAISE EXCEPTION 'Passwort falsch.';
  END IF;
END;
$$;

-- 3) Neue Ereignisarten: Hilferuf und Lesebestätigung
CREATE OR REPLACE FUNCTION public.round_push_events(p_team_id uuid, p_token_hash text, p_events jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      AND e->>'type' IN ('stage_solved','badge_earned','hint_revealed','hearing_answer','stage_scanned','hearing_attempt','help_requested','message_ack')
  ), ins AS (
    INSERT INTO public.score_events (team_id, event_id, type, payload)
    SELECT team_id, event_id, type, payload FROM src
    ON CONFLICT (team_id, event_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*)::integer INTO v_count FROM ins;

  RETURN COALESCE(v_count, 0);
END;
$$;

-- 4) Eigene Ereignisse einer Gruppe zurückholen (Wiedereinstieg)
CREATE OR REPLACE FUNCTION public.round_events(p_team_id uuid, p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash text;
  v_events jsonb;
BEGIN
  SELECT token_hash INTO v_hash FROM public.teams WHERE id = p_team_id;
  IF v_hash IS NULL OR p_token_hash IS NULL OR v_hash <> p_token_hash THEN
    RAISE EXCEPTION 'Team nicht bekannt.';
  END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'event_id', s.event_id,
           'type', s.type,
           'payload', s.payload,
           'created_at', s.created_at
         ) ORDER BY s.created_at), '[]'::jsonb)
    INTO v_events
    FROM public.score_events s
   WHERE s.team_id = p_team_id;
  RETURN jsonb_build_object('events', v_events);
END;
$$;

GRANT EXECUTE ON FUNCTION public.round_events(uuid, text) TO anon, authenticated, service_role;