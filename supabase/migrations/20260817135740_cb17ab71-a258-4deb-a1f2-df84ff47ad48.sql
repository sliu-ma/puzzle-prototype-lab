CREATE TABLE public.round_stations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id uuid NOT NULL REFERENCES public.rounds(id) ON DELETE CASCADE,
  stage_nr integer NOT NULL CHECK (stage_nr BETWEEN 1 AND 5),
  place_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  lat numeric,
  lng numeric,
  note text NOT NULL DEFAULT '',
  photo_path text,
  map_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (round_id, stage_nr)
);

GRANT ALL ON public.round_stations TO service_role;
ALTER TABLE public.round_stations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_round_stations_updated_at
  BEFORE UPDATE ON public.round_stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.teacher_list_stations(p_password_hash text, p_code text)
RETURNS TABLE(
  stage_nr integer,
  place_name text,
  address text,
  lat numeric,
  lng numeric,
  note text,
  photo_path text,
  map_url text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round_id uuid;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  SELECT id INTO v_round_id FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round_id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;

  RETURN QUERY
  SELECT
    rs.stage_nr,
    rs.place_name,
    rs.address,
    rs.lat,
    rs.lng,
    rs.note,
    rs.photo_path,
    rs.map_url
  FROM public.round_stations rs
  WHERE rs.round_id = v_round_id
  ORDER BY rs.stage_nr;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_upsert_station(
  p_password_hash text,
  p_code text,
  p_stage_nr integer,
  p_place_name text,
  p_address text,
  p_lat numeric,
  p_lng numeric,
  p_note text,
  p_photo_path text,
  p_map_url text
)
RETURNS TABLE(
  stage_nr integer,
  place_name text,
  address text,
  lat numeric,
  lng numeric,
  note text,
  photo_path text,
  map_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round_id uuid;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  IF p_stage_nr < 1 OR p_stage_nr > 5 THEN
    RAISE EXCEPTION 'Ungültige Etappennummer.';
  END IF;
  SELECT id INTO v_round_id FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round_id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;

  INSERT INTO public.round_stations (
    round_id, stage_nr, place_name, address, lat, lng, note, photo_path, map_url
  )
  VALUES (
    v_round_id, p_stage_nr, btrim(p_place_name), btrim(p_address), p_lat, p_lng,
    COALESCE(p_note, ''), p_photo_path, p_map_url
  )
  ON CONFLICT (round_id, stage_nr)
  DO UPDATE SET
    place_name = EXCLUDED.place_name,
    address = EXCLUDED.address,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    note = EXCLUDED.note,
    photo_path = COALESCE(EXCLUDED.photo_path, public.round_stations.photo_path),
    map_url = EXCLUDED.map_url
  RETURNING
    public.round_stations.stage_nr,
    public.round_stations.place_name,
    public.round_stations.address,
    public.round_stations.lat,
    public.round_stations.lng,
    public.round_stations.note,
    public.round_stations.photo_path,
    public.round_stations.map_url;
END;
$$;

CREATE OR REPLACE FUNCTION public.teacher_delete_station(p_password_hash text, p_code text, p_stage_nr integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_round_id uuid;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);
  SELECT id INTO v_round_id FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round_id IS NULL THEN
    RETURN true;
  END IF;
  DELETE FROM public.round_stations
  WHERE round_id = v_round_id AND stage_nr = p_stage_nr;
  RETURN true;
END;
$$;