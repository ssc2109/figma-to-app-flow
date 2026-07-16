import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, ClipboardList, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/data/finance";
import { SubHeader, SubScreen } from "./shared";

type CashEvent = {
  id: string;
  date: string;
  title: string;
  meta: string;
  amount: number;
  tone: "in" | "out" | "neutral";
  Icon: typeof Plus;
};

function fmt(n: number) {
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function categoryLabel(catId: string, kind: "ingreso" | "egreso") {
  const list = kind === "ingreso" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.id === catId)?.label ?? (catId || "Movimiento");
}

// Semana ISO (lunes-domingo)
function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // 0 = lunes
  x.setDate(x.getDate() - day);
  return x;
}

function weekKey(d: Date) {
  const s = startOfWeek(d);
  return s.toISOString().slice(0, 10);
}

function weekLabel(startIso: string) {
  const s = new Date(startIso);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  const now = new Date();
  const thisWeek = startOfWeek(now).toISOString().slice(0, 10);
  const lastWeek = (() => {
    const t = startOfWeek(now);
    t.setDate(t.getDate() - 7);
    return t.toISOString().slice(0, 10);
  })();
  if (startIso === thisWeek) return "Esta semana";
  if (startIso === lastWeek) return "Semana pasada";
  const fmtD = (d: Date) => d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
  return `${fmtD(s)} — ${fmtD(e)}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  if (d.getTime() === now.getTime()) return "Hoy";
  if (d.getTime() === y.getTime()) return "Ayer";
  return d.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" });
}

export default function CashActivityView({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CashEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    (async () => {
      const [salesRes, expensesRes, fiadosRes] = await Promise.all([
        supabase
          .from("sales")
          .select("id, total, note, created_at, is_credit")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("expenses")
          .select("id, amount, category, note, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("fiados")
          .select("id, customer_name, amount, created_at, paid, kind")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (salesRes.error) console.error(salesRes.error);
      if (expensesRes.error) console.error(expensesRes.error);
      if (fiadosRes.error) console.error(fiadosRes.error);

      const ev: CashEvent[] = [];
      (salesRes.data ?? [])
        .filter((s) => !s.is_credit)
        .forEach((s) => {
          const isCollection = (s.note ?? "").toLowerCase().includes("cobro");
          ev.push({
            id: `s_${s.id}`,
            date: s.created_at,
            title: isCollection ? "Cobro de fiado" : "Venta registrada",
            meta: s.note || categoryLabel("ventas", "ingreso"),
            amount: Number(s.total),
            tone: "in",
            Icon: Plus,
          });
        });
      (expensesRes.data ?? []).forEach((e) => {
        ev.push({
          id: `e_${e.id}`,
          date: e.created_at,
          title: "Gasto registrado",
          meta: e.note || categoryLabel(e.category || "otros", "egreso"),
          amount: Number(e.amount),
          tone: "out",
          Icon: Minus,
        });
      });
      (fiadosRes.data ?? []).forEach((d) => {
        const payable = d.kind === "pagar";
        ev.push({
          id: `d_${d.id}`,
          date: d.created_at,
          title: payable ? "Cuenta por pagar" : "Fiado registrado",
          meta: `${d.customer_name}${d.paid ? " · saldado" : ""}`,
          amount: Number(d.amount),
          tone: "neutral",
          Icon: payable ? ArrowUpRight : ArrowDownLeft,
        });
      });
      ev.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(ev);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const grouped = useMemo(() => {
    // Agrupa por semana -> día
    const weeks = new Map<
      string,
      { start: string; days: Map<string, { key: string; items: CashEvent[] }>; totalIn: number; totalOut: number }
    >();
    for (const e of events) {
      const wk = weekKey(new Date(e.date));
      if (!weeks.has(wk)) weeks.set(wk, { start: wk, days: new Map(), totalIn: 0, totalOut: 0 });
      const w = weeks.get(wk)!;
      const dk = new Date(e.date).toDateString();
      if (!w.days.has(dk)) w.days.set(dk, { key: dk, items: [] });
      w.days.get(dk)!.items.push(e);
      if (e.tone === "in") w.totalIn += e.amount;
      if (e.tone === "out") w.totalOut += e.amount;
    }
    return Array.from(weeks.values()).sort((a, b) => (a.start < b.start ? 1 : -1));
  }, [events]);

  const totalIn = events.filter((e) => e.tone === "in").reduce((s, e) => s + e.amount, 0);
  const totalOut = events.filter((e) => e.tone === "out").reduce((s, e) => s + e.amount, 0);

  return (
    <SubScreen>
      <SubHeader eyebrow="Caja" title="Historial completo" onBack={onBack} />

      <div className="px-[20px] pt-[6px] pb-[180px]">
        <div
          className="rounded-[20px] p-[16px] mb-[18px]"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="font-['Geist'] text-[10.5px] uppercase tracking-[1.4px] text-white/45">
            Histórico total
          </div>
          <div className="mt-[6px] flex items-baseline gap-[14px]">
            <div>
              <div className="font-['Geist'] text-[10px] uppercase tracking-[1px] text-[#4ADE80]/70">Ingresos</div>
              <div className="font-['Bai_Jamjuree'] text-[22px] font-bold text-[#4ADE80] tabular-nums leading-none mt-[3px]">
                S/ {fmt(totalIn)}
              </div>
            </div>
            <div>
              <div className="font-['Geist'] text-[10px] uppercase tracking-[1px] text-[#F87171]/70">Egresos</div>
              <div className="font-['Bai_Jamjuree'] text-[22px] font-bold text-[#F87171] tabular-nums leading-none mt-[3px]">
                S/ {fmt(totalOut)}
              </div>
            </div>
          </div>
          <div className="mt-[10px] font-['Geist'] text-[12px] text-white/50">
            Neto:{" "}
            <span className="text-white font-medium tabular-nums">
              S/ {fmt(totalIn - totalOut)}
            </span>{" "}
            · {events.length} movimientos
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="text-center py-[60px] font-['Geist'] text-[13px] text-white/40">Cargando historial…</div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center text-center py-[50px]">
            <div
              className="h-[60px] w-[60px] rounded-[18px] grid place-items-center mb-[14px]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <ClipboardList className="h-[24px] w-[24px] text-white/55" strokeWidth={1.5} />
            </div>
            <p className="font-['Geist'] text-[13.5px] text-white/55 max-w-[260px] leading-[1.5]">
              Tus ventas, gastos, cobros y pagos aparecerán aquí cuando registres movimientos.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            {grouped.map((w) => {
              const days = Array.from(w.days.values()).sort((a, b) =>
                a.items[0].date < b.items[0].date ? 1 : -1,
              );
              return (
                <section key={w.start}>
                  <div className="flex items-baseline justify-between px-[4px] mb-[10px]">
                    <div className="font-['Geist'] text-[13px] font-medium text-white/85">
                      {weekLabel(w.start)}
                    </div>
                    <div className="font-['Geist'] text-[11px] tabular-nums text-white/40">
                      <span className="text-[#4ADE80]/80">+S/ {fmt(w.totalIn)}</span>
                      <span className="mx-[6px] text-white/25">·</span>
                      <span className="text-[#F87171]/80">−S/ {fmt(w.totalOut)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-[14px]">
                    {days.map((d) => {
                      const dIn = d.items.filter((x) => x.tone === "in").reduce((s, x) => s + x.amount, 0);
                      const dOut = d.items.filter((x) => x.tone === "out").reduce((s, x) => s + x.amount, 0);
                      return (
                        <div key={d.key}>
                          <div className="flex items-baseline justify-between px-[4px] mb-[6px]">
                            <div className="font-['Geist'] text-[11px] uppercase tracking-[1.1px] text-white/45">
                              {dayLabel(d.items[0].date)}
                            </div>
                            <div className="font-['Geist'] text-[10.5px] tabular-nums text-white/35">
                              {dIn > 0 && <span className="text-[#4ADE80]/70">+{fmt(dIn)}</span>}
                              {dIn > 0 && dOut > 0 && <span className="mx-[4px]">·</span>}
                              {dOut > 0 && <span className="text-[#F87171]/70">−{fmt(dOut)}</span>}
                            </div>
                          </div>
                          <div
                            className="rounded-[16px] overflow-hidden"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            {d.items.map((e, idx) => {
                              const color =
                                e.tone === "in" ? "#4ADE80" : e.tone === "out" ? "#F87171" : "rgba(255,255,255,0.72)";
                              const bg =
                                e.tone === "in"
                                  ? "rgba(74,222,128,0.13)"
                                  : e.tone === "out"
                                    ? "rgba(248,113,113,0.13)"
                                    : "rgba(255,255,255,0.06)";
                              const border =
                                e.tone === "in"
                                  ? "rgba(74,222,128,0.30)"
                                  : e.tone === "out"
                                    ? "rgba(248,113,113,0.30)"
                                    : "rgba(255,255,255,0.10)";
                              const Icon = e.Icon;
                              return (
                                <div key={e.id}>
                                  <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.015, 0.1) }}
                                    className="flex items-center gap-[12px] px-[14px] py-[11px]"
                                  >
                                    <div
                                      className="h-[32px] w-[32px] rounded-full grid place-items-center flex-none"
                                      style={{ background: bg, border: `1px solid ${border}` }}
                                    >
                                      <Icon className="h-[14px] w-[14px]" style={{ color }} strokeWidth={2.3} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-['Geist'] text-[13.5px] text-white truncate">
                                        {e.title}
                                      </div>
                                      <div className="mt-[1px] font-['Geist'] text-[11px] text-white/45 truncate">
                                        {timeLabel(e.date)} · {e.meta}
                                      </div>
                                    </div>
                                    <div
                                      className="font-['Bai_Jamjuree'] font-bold text-[14px] tracking-[-0.2px] whitespace-nowrap tabular-nums"
                                      style={{ color }}
                                    >
                                      {e.tone === "in" ? "+" : e.tone === "out" ? "−" : ""}S/ {fmt(e.amount)}
                                    </div>
                                  </motion.div>
                                  {idx < d.items.length - 1 && <div className="h-px bg-white/[0.05] mx-[14px]" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </SubScreen>
  );
}
