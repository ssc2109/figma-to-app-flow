
-- 1) Update trigger to use 30 days instead of 14
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'trial', 'trialing', now() + interval '30 days')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- 2) Extend currently-active trials by the 16 extra days so users get the new 30-day trial.
UPDATE public.subscriptions
SET trial_ends_at = trial_ends_at + interval '16 days'
WHERE status = 'trialing' AND trial_ends_at IS NOT NULL AND trial_ends_at > now();
