GRANT SELECT ON public.rounds TO anon, authenticated;
GRANT ALL ON public.rounds TO service_role;

GRANT SELECT (id, round_id, name, members, stages_done, hints_used, badges, started_at, finished_at, created_at, updated_at) ON public.teams TO anon, authenticated;
GRANT ALL ON public.teams TO service_role;