
-- Migrate usage_counters to variable-window model
ALTER TABLE public.usage_counters DROP CONSTRAINT IF EXISTS usage_counters_user_id_kind_period_month_key;

ALTER TABLE public.usage_counters
  ADD COLUMN IF NOT EXISTS period_start timestamptz,
  ADD COLUMN IF NOT EXISTS period_end   timestamptz;

-- Backfill any existing rows (treat as current calendar month)
UPDATE public.usage_counters
SET period_start = COALESCE(period_start, date_trunc('month', now())),
    period_end   = COALESCE(period_end,   date_trunc('month', now()) + interval '1 month')
WHERE period_start IS NULL OR period_end IS NULL;

ALTER TABLE public.usage_counters
  ALTER COLUMN period_start SET NOT NULL,
  ALTER COLUMN period_end   SET NOT NULL;

-- period_month becomes optional legacy; drop it
ALTER TABLE public.usage_counters DROP COLUMN IF EXISTS period_month;

CREATE UNIQUE INDEX IF NOT EXISTS usage_counters_user_kind_start_key
  ON public.usage_counters (user_id, kind, period_start);

CREATE INDEX IF NOT EXISTS usage_counters_user_kind_end_idx
  ON public.usage_counters (user_id, kind, period_end DESC);

-- Replace RPC: supports rolling window (seconds) or calendar month when NULL/0
DROP FUNCTION IF EXISTS public.increment_usage_counter(text);
DROP FUNCTION IF EXISTS public.increment_usage_counter(text, integer);

CREATE OR REPLACE FUNCTION public.increment_usage_counter(
  _kind text,
  _window_seconds integer DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

  -- Reuse the latest active window for this (user, kind) if not yet expired
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

  -- No active window: create a new one
  IF _window_seconds IS NULL OR _window_seconds <= 0 THEN
    -- Calendar month window
    _p_start := date_trunc('month', _now);
    _p_end   := _p_start + interval '1 month';
  ELSE
    -- Rolling window from now
    _p_start := _now;
    _p_end   := _now + make_interval(secs => _window_seconds);
  END IF;

  INSERT INTO public.usage_counters (user_id, kind, period_start, period_end, count)
  VALUES (_uid, _kind, _p_start, _p_end, 1)
  RETURNING count INTO _new_count;

  RETURN _new_count;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.increment_usage_counter(text, integer) TO authenticated;
