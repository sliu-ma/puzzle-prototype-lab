DROP FUNCTION IF EXISTS public.teacher_upsert_station(text, text, integer, text, text, numeric, numeric, text, text, text);
DROP FUNCTION IF EXISTS public.teacher_list_stations(text, text);
DROP FUNCTION IF EXISTS public.teacher_delete_station(text, text, integer);

DROP TABLE IF EXISTS public.round_stations;