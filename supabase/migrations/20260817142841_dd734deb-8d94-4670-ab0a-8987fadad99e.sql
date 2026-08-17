CREATE OR REPLACE FUNCTION public.teacher_upsert_station(p_password_hash text, p_code text, p_stage_nr integer, p_place_name text, p_address text, p_lat numeric, p_lng numeric, p_note text, p_photo_path text, p_map_url text)
 RETURNS TABLE(stage_nr integer, place_name text, address text, lat numeric, lng numeric, note text, photo_path text, map_url text)
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
  SELECT id INTO v_round_id FROM public.rounds WHERE code = upper(btrim(p_code)) LIMIT 1;
  IF v_round_id IS NULL THEN
    RAISE EXCEPTION 'Diese Runde existiert nicht.';
  END IF;

  RETURN QUERY
  WITH up AS (
    INSERT INTO public.round_stations AS rs (
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
      photo_path = COALESCE(EXCLUDED.photo_path, rs.photo_path),
      map_url = EXCLUDED.map_url
    RETURNING rs.stage_nr AS o_stage_nr, rs.place_name AS o_place_name, rs.address AS o_address,
              rs.lat AS o_lat, rs.lng AS o_lng, rs.note AS o_note,
              rs.photo_path AS o_photo_path, rs.map_url AS o_map_url
  )
  SELECT up.o_stage_nr, up.o_place_name, up.o_address, up.o_lat, up.o_lng, up.o_note, up.o_photo_path, up.o_map_url
  FROM up;
END;
$function$;