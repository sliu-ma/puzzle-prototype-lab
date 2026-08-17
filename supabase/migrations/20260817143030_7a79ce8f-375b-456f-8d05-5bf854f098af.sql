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
SET search_path TO 'public'
AS $function$
DECLARE
  v_round_id uuid;
BEGIN
  PERFORM public.assert_teacher(p_password_hash);

  IF p_stage_nr < 1 OR p_stage_nr > 5 THEN
    RAISE EXCEPTION 'Ungültige Etappennummer.';
  END IF;

  SELECT r.id
  INTO v_round_id
  FROM public.rounds AS r
  WHERE r.code = upper(btrim(p_code))
  LIMIT 1;

  IF v_round_id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;

  RETURN QUERY
  WITH upserted AS (
    INSERT INTO public.round_stations AS rs (
      round_id, stage_nr, place_name, address, lat, lng, note, photo_path, map_url
    )
    VALUES (
      v_round_id,
      p_stage_nr,
      btrim(p_place_name),
      btrim(p_address),
      p_lat,
      p_lng,
      COALESCE(p_note, ''),
      p_photo_path,
      p_map_url
    )
    ON CONFLICT ON CONSTRAINT round_stations_round_id_stage_nr_key
    DO UPDATE SET
      place_name = EXCLUDED.place_name,
      address = EXCLUDED.address,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      note = EXCLUDED.note,
      photo_path = COALESCE(EXCLUDED.photo_path, rs.photo_path),
      map_url = EXCLUDED.map_url
    RETURNING
      rs.stage_nr AS saved_stage_nr,
      rs.place_name AS saved_place_name,
      rs.address AS saved_address,
      rs.lat AS saved_lat,
      rs.lng AS saved_lng,
      rs.note AS saved_note,
      rs.photo_path AS saved_photo_path,
      rs.map_url AS saved_map_url
  )
  SELECT
    u.saved_stage_nr,
    u.saved_place_name,
    u.saved_address,
    u.saved_lat,
    u.saved_lng,
    u.saved_note,
    u.saved_photo_path,
    u.saved_map_url
  FROM upserted AS u;
END;
$function$;