import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { useInventory } from "@/data/inventory";
import { generateBriefing, type Briefing } from "@/lib/api/briefing.functions";

type InsightAction = "chat" | "reponer" | "cobrar_fiado" | "finanzas" | "ventas" | "promo";

export type HomeNavIntent =
  | { kind: "chat"; prompt: string }
  | { kind: "screen"; screen: "negocio" | "crecer" | "yo" | "socia"; subview?: "finanzas" | "hub" }
  | { kind: "sales" }
  | { kind: "reponer"; productHint?: string };

function bucket(n: number, step: number) {
  return Math.floor(n / step);
}

function ToneDot({ tone }: { tone: Briefing["insights"][number]["tone"] }) {
  const color =
    tone === "warning"
      ? "#F87171"
      : tone === "celebration"
        ? "#4ADE80"
        : tone === "opportunity"
          ? "#FCD34D"
          : "rgba(255,255,255,0.55)";
  return (
    <span
      className="inline-block size-[6px] rounded-full"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

function Orb({ size = 36, spinning = false }: { size?: number; spinning?: boolean }) {
  return (
    <div
      className="flex-none relative rounded-full socia-orb"
      data-spinning={spinning ? "true" : "false"}
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 32% 28%, #cfe6ff 0%, #4dc8fd 22%, #1c7cff 48%, #003fc0 78%, #061535 100%)",
      }}
      aria-hidden
    />
  );
}

export default function ProactiveHero({ onIntent }: { onIntent: (i: HomeNavIntent) => void }) {
  const { profile } = useAuth();
  const fin = useFinance();
  const inv = useInventory();

  const ownerFirstName = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
  const now = new Date();
  const hour = now.getHours();
  const weekday = now.toLocaleDateString("es-PE", { weekday: "long" });
  const dateKey = now.toISOString().slice(0, 10);

  // ayer mismo intervalo
  const yesterdayIncome = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return fin.tx
      .filter((t) => t.kind === "ingreso" && new Date(t.date).toDateString() === y.toDateString())
      .reduce((s, t) => s + t.amount, 0);
  }, [fin.tx]);

  const briefingFn = useServerFn(generateBriefing);

  // Cache key: cambia cuando hay un cambio "grande" — bucket evita refetches por cambios menores.
  // Se regenera también cada 30 min naturalmente (staleTime).
  const keySig = [
    dateKey,
    Math.floor(hour / 3), // bloque de 3h
    inv.lowStock.length,
    bucket(fin.fiadosPending, 50),
    bucket(fin.todayIncome, 200),
    fin.fiados.filter((f) => !f.settled && f.dueDate && new Date(f.dueDate) < now).length,
  ].join(":");

  const { data: briefing, isLoading } = useQuery({
    queryKey: ["home-briefing", profile?.id ?? "anon", keySig],
    queryFn: () =>
      briefingFn({
        data: {
          ownerFirstName,
          businessName: profile?.business_name ?? "tu negocio",
          businessType: profile?.business_type ?? null,
          hour,
          weekday,
          todayIncome: fin.todayIncome,
          yesterdayIncome,
          monthIncome: fin.monthIncome,
          fiadosPendingTotal: fin.fiadosPending,
          fiadosPendingCount: fin.fiados.filter((f) => !f.settled).length,
          fiadosOverdueTotal: fin.fiadosOverdue,
          lowStock: inv.lowStock.slice(0, 6).map((p) => ({ name: p.name, units: p.stock })),
          newUser: fin.tx.length === 0 && inv.items.length === 0,
        },
      }),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const handleInsightCta = (insight: Briefing["insights"][number]) => {
    if (!insight.cta) return;
    const a = insight.cta.action as InsightAction;
    if (a === "reponer") onIntent({ kind: "reponer", productHint: insight.cta.payload });
    else if (a === "cobrar_fiado") onIntent({ kind: "screen", screen: "negocio" });
    else if (a === "finanzas") onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" });
    else if (a === "ventas") onIntent({ kind: "sales" });
    else if (a === "promo") onIntent({ kind: "screen", screen: "crecer" });
    else onIntent({ kind: "chat", prompt: insight.text });
  };

  // Skeleton suave mientras genera
  const greeting =
    briefing?.greeting ??
    (hour < 12
      ? { line1: `Buenos días, ${ownerFirstName}`, line2: "Preparando tu briefing…" }
      : hour < 19
        ? { line1: `¿Cómo va la tarde, ${ownerFirstName}?`, line2: "Revisando tu negocio…" }
        : { line1: `Buenas noches, ${ownerFirstName}`, line2: "Cerrando el día contigo…" });

  return (
    <div className="w-full flex flex-col gap-[20px]">
      {/* GREETING */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-[8px] pb-[4px]"
      >
        <h1 className="font-['Geist'] font-medium text-[28px] leading-[34px] tracking-[-0.6px] text-white">
          {greeting.line1}
        </h1>
        <p className="mt-[6px] font-['Geist'] text-[15px] leading-[22px] text-[rgba(255,255,255,0.62)]">
          {greeting.line2}
        </p>
      </motion.div>

      {/* BRIEFING CARD */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative w-full rounded-[28px] overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(28,124,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.03) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* glow superior */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[80px] -left-[40px] h-[180px] w-[260px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, #1c7cff 0%, transparent 70%)", filter: "blur(40px)" }}
        />

        <div className="relative p-[18px]">
          <div className="flex items-center gap-[10px] mb-[14px]">
            <Orb size={28} spinning={isLoading} />
            <div className="flex flex-col">
              <span className="font-['Geist'] text-[11px] font-medium tracking-[1.1px] uppercase text-[rgba(255,255,255,0.7)]">
                socIA preparó esto
              </span>
              <span className="font-['Geist'] text-[11px] text-[rgba(255,255,255,0.4)]">
                {isLoading ? "Revisando tu negocio…" : "actualizado hace un momento"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-[10px]">
            {isLoading && (
              <>
                <div className="h-[44px] rounded-[16px] bg-white/[0.04] animate-pulse" />
                <div className="h-[44px] rounded-[16px] bg-white/[0.03] animate-pulse" />
              </>
            )}

            {!isLoading &&
              briefing?.insights.map((ins, i) => (
                <motion.button
                  key={ins.id ?? i}
                  type="button"
                  onClick={() => handleInsightCta(ins)}
                  whileTap={{ scale: 0.985 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="w-full text-left flex items-start gap-[12px] p-[12px] rounded-[16px] transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-[18px] leading-[24px] flex-none">{ins.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[6px] mb-[2px]">
                      <ToneDot tone={ins.tone} />
                      <span className="font-['Geist'] text-[10.5px] uppercase tracking-[0.6px] text-[rgba(255,255,255,0.45)]">
                        {ins.tone === "warning"
                          ? "Atención"
                          : ins.tone === "opportunity"
                            ? "Oportunidad"
                            : ins.tone === "celebration"
                              ? "Logro"
                              : "Nota"}
                      </span>
                    </div>
                    <p className="font-['Geist'] text-[14.5px] leading-[20px] text-white/95">
                      {ins.text}
                    </p>
                  </div>
                  {ins.cta && (
                    <span className="flex-none self-center inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-full text-[12px] font-medium font-['Geist'] text-black bg-white">
                      {ins.cta.label}
                      <ArrowUpRight className="h-[12px] w-[12px]" strokeWidth={2.2} />
                    </span>
                  )}
                </motion.button>
              ))}
          </div>

          {/* Sales note discreta */}
          {briefing?.salesNote && (
            <button
              type="button"
              onClick={() => onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" })}
              className="mt-[14px] w-full text-left font-['Geist'] text-[12.5px] text-[rgba(255,255,255,0.55)] hover:text-white/80 transition-colors"
            >
              {briefing.salesNote}
            </button>
          )}
        </div>
      </motion.div>

      {/* LAUNCHER socIA */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="w-full flex flex-col gap-[10px]"
      >
        <button
          type="button"
          onClick={() => onIntent({ kind: "chat", prompt: "" })}
          className="w-full flex items-center gap-[12px] px-[14px] py-[13px] rounded-full transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Orb size={22} />
          <span className="flex-1 text-left font-['Geist'] text-[14.5px] text-[rgba(255,255,255,0.55)]">
            Pregúntale algo a socIA…
          </span>
          <Sparkles className="h-[16px] w-[16px] text-white/60" strokeWidth={1.8} />
        </button>

        {briefing?.quickPrompts && briefing.quickPrompts.length > 0 && (
          <div className="flex gap-[8px] overflow-x-auto no-scrollbar -mx-[2px] px-[2px] py-[2px]">
            {briefing.quickPrompts.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onIntent({ kind: "chat", prompt: p })}
                className="flex-none px-[14px] py-[8px] rounded-full font-['Geist'] text-[12.5px] text-white/80 hover:text-white transition-colors"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
