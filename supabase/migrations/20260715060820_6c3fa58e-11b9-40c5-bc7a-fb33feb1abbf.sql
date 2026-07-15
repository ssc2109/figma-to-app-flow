
-- Trigger functions are invoked by triggers, not via the API. Revoke direct execute.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_subscription() FROM PUBLIC, anon, authenticated;

-- increment_usage_counter is called via RPC. Switch to SECURITY INVOKER so it runs
-- as the caller; RLS on usage_counters already scopes rows to auth.uid() = user_id.
CREATE OR REPLACE FUNCTION public.increment_usage_counter(_kind text, _window_seconds integer DEFAULT NULL::integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _now timestamptz := now();
  _p_start timestamptz;
  _p_end timestamptz;
  _existing_id uuid;
  _new_count integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT id, period_start, period_end
    INTO _existing_id, _p_start, _p_end
  FROM public.usage_counters
  WHERE user_id = _uid AND kind = _kind AND period_end > _now
  ORDER BY period_end DESC
  LIMIT 1;

  IF _existing_id IS NOT NULL THEN
    UPDATE public.usage_counters
       SET count = count + 1, updated_at = _now
     WHERE id = _existing_id
     RETURNING count INTO _new_count;
    RETURN _new_count;
  END IF;

  IF _window_seconds IS NULL OR _window_seconds <= 0 THEN
    _p_start := date_trunc('month', _now);
    _p_end   := _p_start + interval '1 month';
  ELSE
    _p_start := _now;
    _p_end   := _now + make_interval(secs => _window_seconds);
  END IF;

  INSERT INTO public.usage_counters (user_id, kind, period_start, period_end, count)
  VALUES (_uid, _kind, _p_start, _p_end, 1)
  RETURNING count INTO _new_count;

  RETURN _new_count;
END;
$function$;

-- Also ensure usage_counters has needed grants for the invoker path
GRANT SELECT, INSERT, UPDATE ON public.usage_counters TO authenticated;
