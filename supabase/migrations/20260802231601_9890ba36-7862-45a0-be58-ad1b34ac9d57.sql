REVOKE ALL ON FUNCTION public.get_round_by_code(text) FROM anon, authenticated, PUBLIC;
REVOKE ALL ON FUNCTION public.get_leaderboard_by_code(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_round_by_code(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_by_code(text) TO service_role;