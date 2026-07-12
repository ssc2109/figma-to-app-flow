import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSubscription } from "@/lib/api/subscription.functions";
import { limitsFor, trialDaysLeft, type PlanId, type PlanLimits, type SubscriptionStatus } from "@/lib/plans";
import { useAuth } from "@/hooks/useAuth";

export type Subscription = {
  id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_end: string | null;
};

export function usePlan() {
  const { user } = useAuth();
  const fetchSub = useServerFn(getSubscription);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setUsage({});
      setLoading(false);
      return;
    }
    try {
      const res = await fetchSub({});
      setSubscription((res.subscription as Subscription | null) ?? null);
      setUsage(res.usage ?? {});
    } catch (e) {
      console.error("[usePlan]", e);
    } finally {
      setLoading(false);
    }
  }, [user, fetchSub]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const plan: PlanId = subscription?.plan ?? "trial";
  const limits: PlanLimits = limitsFor(plan);
  const daysLeft = subscription?.status === "trialing" ? trialDaysLeft(subscription.trial_ends_at) : 0;
  const isTrialing = subscription?.status === "trialing" && daysLeft > 0;
  const trialExpired = subscription?.status === "trialing" && daysLeft <= 0;

  return {
    loading,
    subscription,
    plan,
    limits,
    usage,
    isTrialing,
    trialExpired,
    daysLeft,
    refresh,
  };
}
