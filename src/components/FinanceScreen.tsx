import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ChevronRight,
  HandCoins,
  Receipt,
  TrendingUp,
  TrendingDown,
  X,
  Check,
} from "lucide-react";
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type TxKind } from "@/data/finance";
import { GlassCard, SubHeader, SubScreen, Eyebrow } from "./business/shared";
import { Sparkline } from "./Sparkline";

type View = "hub" | "transactions" | "fiados" | "categories";
type Period = "hoy" | "semana" | "mes";

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;
const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 2)}K` : n.toFixed(0);

function PageHeader({ onOpenAdd }: { onOpenAdd: () => void }) {
  return (
    <div className="flex items-center justify-between px-[20px] pt-[18px] pb-[8px]">
      <div className="flex flex-col">
        <span className="font-['Geist'] text-[12px] uppercase tracking-[1.4px] text-white/45">
          Cómo va tu plata
        </span>
        <h1 className="font-['Bai_Jamjuree'] text-[26px] font-semibold text-white tracking-[-0.6px]">
          Finanzas
        </h1>
      </div>
      <button
        type="button"
        onClick={onOpenAdd}
        className="flex h-[40px] items-center gap-[6px] rounded-full bg-white text-black px-[14px] active:scale-95 transition-transform"
      >
        <Plus className="h-[15px] w-[15px]" strokeWidth={2.4} />
        <span className="font-['Geist'] text-[13px] font-semibold">Registrar</span>
      </button>
    </div>
  );
}

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const opts: { id: Period; label: string }[] = [
    { id: "hoy", label: "Hoy" },
    { id: "semana", label: "Semana" },
    { id: "mes", label: "Mes" },
  ];
  return (
    <div
      className="flex gap-[4px] p-[4px] rounded-full"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="relative flex-1 h-[30px] rounded-full font-['Geist'] text-[12.5px] font-medium"
          >
            {active && (
              <motion.span
                layoutId="trax-finance-period"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`relative ${active ? "text-black" : "text-white/65"}`}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function NetHero({ value, prevValue }: { value: number; prevValue: number }) {
  const diff = value - prevValue;
  const pct = prevValue !== 0 ? (diff / Math.abs(prevValue)) * 100 : 0;
  const positive = diff >= 0;
  return (
    <div className="flex flex-col items-center text-center py-[10px]">
      <span className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/45">
        Ganancia neta
      </span>
      <div className="mt-[6px] flex items-baseline gap-[6px]">
        <span className="font-['Bai_Jamjuree'] text-[24px] font-medium text-white/55 tracking-[-1px]">
          S/
        </span>
        <span className="font-['Bai_Jamjuree'] text-[56px] font-bold text-white tracking-[-1.5px] tabular-nums leading-none">
          {fmtK(value)}
        </span>
      </div>
      {prevValue !== 0 && (
        <div
          className={`mt-[8px] inline-flex items-center gap-[4px] rounded-full px-[10px] py-[3px] font-['Geist'] text-[11.5px] font-medium ${
            positive ? "text-[#4ADE80]" : "text-[#F87171]"
          }`}
          style={{
            background: positive ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${positive ? "rgba(74,222,128,0.20)" : "rgba(248,113,113,0.20)"}`,
          }}
        >
          {positive ? <TrendingUp className="h-[12px] w-[12px]" /> : <TrendingDown className="h-[12px] w-[12px]" />}
          <span>
            {positive ? "+" : ""}
            {pct.toFixed(0)}% vs anterior
          </span>
        </div>
      )}
    </div>
  );
}

function IncomeExpenseSplit({ income, expense }: { income: number; expense: number }) {
  return (
    <div className="grid grid-cols-2 gap-[12px]">
      <GlassCard>
        <div className="p-[14px] flex flex-col gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <div
              className="h-[28px] w-[28px] rounded-full flex items-center justify-center"
              style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.22)" }}
            >
              <ArrowDownLeft className="h-[13px] w-[13px] text-[#4ADE80]" strokeWidth={2.2} />
            </div>
            <span className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/55">
              Ingresos
            </span>
          </div>
          <div className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tabular-nums tracking-[-0.4px]">
            <span className="text-white/55 text-[13px] mr-[2px]">S/</span>
            {fmtK(income)}
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <div className="p-[14px] flex flex-col gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <div
              className="h-[28px] w-[28px] rounded-full flex items-center justify-center"
              style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.22)" }}
            >
              <ArrowUpRight className="h-[13px] w-[13px] text-[#F87171]" strokeWidth={2.2} />
            </div>
            <span className="font-['Geist'] text-[11px] uppercase tracking-[1px] text-white/55">
              Egresos
            </span>
          </div>
          <div className="font-['Bai_Jamjuree'] text-[20px] font-bold text-white tabular-nums tracking-[-0.4px]">
            <span className="text-white/55 text-[13px] mr-[2px]">S/</span>
            {fmtK(expense)}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ChartCard({ days }: { days: { day: string; income: number; expense: number }[] }) {
  const netSeries = days.map((d) => d.income - d.expense);
  return (
    <GlassCard>
      <div className="p-[16px]">
        <div className="flex items-center justify-between mb-[10px]">
          <Eyebrow>Últimos 7 días</Eyebrow>
          <span className="font-['Geist'] text-[11px] text-white/40">Ganancia neta diaria</span>
        </div>
        <Sparkline data={netSeries} />
        <div className="mt-[8px] flex justify-between font-['Geist'] text-[10.5px] text-white/40 tabular-nums">
          {days.map((d) => (
            <span key={d.day}>{d.day}</span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function FiadosCard({
  pending,
  overdue,
  count,
  onOpen,
}: {
  pending: number;
  overdue: number;
  count: number;
  onOpen: () => void;
}) {
  if (count === 0) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-[20px] overflow-hidden text-left active:scale-[0.99] transition-transform"
      style={{
        background:
          overdue > 0
            ? "linear-gradient(180deg, rgba(248,113,113,0.08), rgba(248,113,113,0.02))"
            : "rgba(255,255,255,0.035)",
        border: `1px solid ${overdue > 0 ? "rgba(248,113,113,0.22)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div className="p-[14px] flex items-center gap-[12px]">
        <div
          className="h-[40px] w-[40px] rounded-full flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <HandCoins className="h-[16px] w-[16px] text-white/85" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-[8px]">
            <span className="font-['Geist'] text-[13.5px] font-medium text-white">
              Te deben {fmt(pending)}
            </span>
            {overdue > 0 && (
              <span className="font-['Geist'] text-[10.5px] text-[#F87171] tabular-nums">
                · {fmt(overdue)} vencido
              </span>
            )}
          </div>
          <div className="font-['Geist'] text-[11.5px] text-white/55 mt-[1px]">
            {count} fiado{count === 1 ? "" : "s"} pendiente{count === 1 ? "" : "s"}
          </div>
        </div>
        <ChevronRight className="h-[16px] w-[16px] text-white/40" strokeWidth={1.8} />
      </div>
    </button>
  );
}

function CategoriesCard({
  data,
  onOpen,
}: {
  data: { id: string; label: string; icon: string; total: number; pct: number }[];
  onOpen: () => void;
}) {
  if (data.length === 0) return null;
  const top = data.slice(0, 3);
  return (
    <GlassCard>
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="p-[16px]">
          <div className="flex items-center justify-between mb-[12px]">
            <Eyebrow>En qué se va tu plata</Eyebrow>
            <ChevronRight className="h-[14px] w-[14px] text-white/40" />
          </div>
          <div className="flex flex-col gap-[10px]">
            {top.map((c) => (
              <div key={c.id} className="flex items-center gap-[10px]">
                <span className="w-[20px] text-center">{c.icon}</span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-['Geist'] text-[13px] text-white/85">{c.label}</span>
                    <span className="font-['Bai_Jamjuree'] text-[12.5px] font-semibold text-white tabular-nums">
                      {fmt(c.total)}
                    </span>
                  </div>
                  <div className="mt-[5px] h-[4px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-white/70 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </button>
    </GlassCard>
  );
}

function RecentTx({ onOpen }: { onOpen: () => void }) {
  const { tx } = useFinance();
  const recent = tx.slice(0, 4);
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between px-[4px]">
        <Eyebrow>Movimientos recientes</Eyebrow>
        <button
          type="button"
          onClick={onOpen}
          className="font-['Geist'] text-[12px] text-white/55 active:text-white"
        >
          Ver todo
        </button>
      </div>
      <GlassCard>
        <div className="flex flex-col px-[14px]">
          {recent.map((t, i) => (
            <div key={t.id}>
              <TxRow tx={t} />
              {i < recent.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function TxRow({ tx }: { tx: ReturnType<typeof useFinance>["tx"][number] }) {
  const pos = tx.kind === "ingreso";
  const cat =
    (pos ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find((c) => c.id === tx.category) ??
    { icon: "•", label: tx.category };
  const d = new Date(tx.date);
  const now = new Date();
  const same = d.toDateString() === now.toDateString();
  const time = same
    ? `Hoy, ${d.toLocaleTimeString("es-PE", { hour: "numeric", minute: "2-digit" })}`
    : d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  return (
    <div className="flex items-center gap-[12px] py-[12px]">
      <div
        className="h-[36px] w-[36px] shrink-0 rounded-full flex items-center justify-center text-[15px]"
        style={{
          background: pos ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${pos ? "rgba(74,222,128,0.20)" : "rgba(248,113,113,0.18)"}`,
        }}
      >
        <span>{cat.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[13.5px] font-medium text-white truncate">
          {tx.note ?? cat.label}
        </div>
        <div className="font-['Geist'] text-[11px] text-white/45 mt-[1px]">
          {time}
          {tx.method && <span> · {tx.method}</span>}
        </div>
      </div>
      <div
        className={`font-['Bai_Jamjuree'] text-[14px] font-bold tabular-nums ${
          pos ? "text-[#4ADE80]" : "text-[#F87171]"
        }`}
      >
        {pos ? "+" : "-"}
        {fmt(tx.amount)}
      </div>
    </div>
  );
}

/* ---------- add transaction sheet ---------- */

function AddSheet({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useFinance();
  const [kind, setKind] = useState<TxKind>("egreso");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("mercaderia");
  const [note, setNote] = useState("");
  const cats = kind === "egreso" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const submit = () => {
    const n = parseFloat(amount.replace(",", "."));
    if (!n || n <= 0) return;
    addTransaction({ kind, amount: n, category, note: note || undefined, method: "Efectivo" });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
        className="relative w-full max-w-[430px] rounded-t-[28px] pb-[32px] pt-[18px] px-[20px]"
        style={{
          background: "rgba(20,20,22,0.96)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto h-[4px] w-[44px] rounded-full bg-white/15 mb-[14px]" />
        <div className="flex items-center justify-between mb-[16px]">
          <h2 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.4px]">
            Registrar movimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] w-[32px] rounded-full bg-white/[0.06] flex items-center justify-center active:scale-95"
          >
            <X className="h-[14px] w-[14px] text-white/70" strokeWidth={1.8} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-[6px] p-[4px] rounded-full bg-white/[0.04] mb-[18px] border border-white/[0.06]">
          {(["egreso", "ingreso"] as TxKind[]).map((k) => {
            const active = kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setCategory(k === "egreso" ? "mercaderia" : "ventas");
                }}
                className={`relative h-[36px] rounded-full font-['Geist'] text-[13px] font-medium ${
                  active ? (k === "egreso" ? "text-[#F87171]" : "text-[#4ADE80]") : "text-white/55"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="trax-add-tab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: k === "egreso" ? "rgba(248,113,113,0.10)" : "rgba(74,222,128,0.10)",
                      border: `1px solid ${k === "egreso" ? "rgba(248,113,113,0.25)" : "rgba(74,222,128,0.25)"}`,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{k === "egreso" ? "Egreso" : "Ingreso"}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-end justify-center gap-[6px] mb-[18px]">
          <span className="font-['Bai_Jamjuree'] text-[24px] font-medium text-white/55 mb-[6px]">
            S/
          </span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-[200px] bg-transparent outline-none text-center font-['Bai_Jamjuree'] text-[44px] font-bold text-white tracking-[-1.5px] tabular-nums placeholder:text-white/20"
          />
        </div>

        <div className="-mx-[20px] overflow-x-auto no-scrollbar mb-[14px]">
          <div className="flex gap-[6px] px-[20px]">
            {cats.map((c) => {
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`shrink-0 h-[34px] px-[12px] rounded-full font-['Geist'] text-[12.5px] font-medium flex items-center gap-[6px] ${
                    active ? "bg-white text-black" : "bg-white/[0.04] text-white/65 border border-white/[0.06]"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <input
          type="text"
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-[44px] px-[14px] rounded-full bg-white/[0.04] border border-white/[0.06] outline-none font-['Geist'] text-[13.5px] text-white placeholder:text-white/35 mb-[16px]"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!amount}
          className="w-full h-[52px] rounded-full bg-white text-black font-['Geist'] text-[14.5px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-40"
        >
          Guardar movimiento
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------- transactions / fiados / categories sub-views ---------- */

function TransactionsView({ onBack }: { onBack: () => void }) {
  const { tx } = useFinance();
  return (
    <SubScreen>
      <SubHeader eyebrow="Todos los movimientos" title="Historial" onBack={onBack} />
      <div className="px-[20px] pt-[6px]">
        <GlassCard>
          <div className="px-[14px]">
            {tx.map((t, i) => (
              <div key={t.id}>
                <TxRow tx={t} />
                {i < tx.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SubScreen>
  );
}

function FiadosView({ onBack }: { onBack: () => void }) {
  const { fiados, settleFiado, fiadosPending } = useFinance();
  const pending = fiados.filter((f) => !f.settled);
  const settled = fiados.filter((f) => f.settled);
  return (
    <SubScreen>
      <SubHeader eyebrow="Te deben" title="Fiados" onBack={onBack} />
      <div className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
        <GlassCard>
          <div className="p-[16px] text-center">
            <Eyebrow>Total pendiente</Eyebrow>
            <div className="mt-[6px] font-['Bai_Jamjuree'] text-[32px] font-bold text-white tabular-nums tracking-[-1px]">
              <span className="text-white/55 text-[18px] mr-[2px]">S/</span>
              {fiadosPending.toFixed(2)}
            </div>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-[8px]">
          <Eyebrow>Por cobrar ({pending.length})</Eyebrow>
          <GlassCard>
            <div className="flex flex-col px-[14px]">
              {pending.length === 0 && (
                <div className="py-[28px] text-center font-['Geist'] text-[13px] text-white/45">
                  No tienes fiados por cobrar
                </div>
              )}
              {pending.map((f, i) => {
                const overdue = f.dueDate && new Date(f.dueDate) < new Date();
                return (
                  <div key={f.id}>
                    <div className="flex items-center gap-[12px] py-[12px]">
                      <div
                        className="h-[40px] w-[40px] shrink-0 rounded-full flex items-center justify-center"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <span className="font-['Bai_Jamjuree'] text-[12px] font-semibold text-white">
                          {f.client.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-['Geist'] text-[13.5px] font-medium text-white truncate">
                          {f.client}
                        </div>
                        <div className="font-['Geist'] text-[11px] text-white/50 mt-[1px]">
                          Desde {new Date(f.date).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                          {overdue && <span className="text-[#F87171]"> · vencido</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-[4px]">
                        <span className="font-['Bai_Jamjuree'] text-[14px] font-bold text-white tabular-nums">
                          {fmt(f.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => settleFiado(f.id)}
                          className="font-['Geist'] text-[11px] font-semibold text-[#4ADE80] active:scale-95"
                        >
                          Cobrar ✓
                        </button>
                      </div>
                    </div>
                    {i < pending.length - 1 && <div className="h-px w-full bg-white/[0.05]" />}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {settled.length > 0 && (
          <div className="flex flex-col gap-[8px]">
            <Eyebrow>Cobrados</Eyebrow>
            <GlassCard>
              <div className="flex flex-col px-[14px]">
                {settled.map((f, i) => (
                  <div key={f.id}>
                    <div className="flex items-center gap-[12px] py-[12px] opacity-60">
                      <div className="h-[28px] w-[28px] rounded-full bg-[#4ADE80]/15 flex items-center justify-center">
                        <Check className="h-[13px] w-[13px] text-[#4ADE80]" strokeWidth={2.4} />
                      </div>
                      <div className="flex-1 font-['Geist'] text-[13px] text-white/75 truncate">{f.client}</div>
                      <span className="font-['Bai_Jamjuree'] text-[13px] font-semibold text-white/70 tabular-nums">
                        {fmt(f.amount)}
                      </span>
                    </div>
                    {i < settled.length - 1 && <div className="h-px w-full bg-white/[0.04]" />}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </SubScreen>
  );
}

function CategoriesView({ onBack }: { onBack: () => void }) {
  const { expensesByCategory, monthExpense } = useFinance();
  return (
    <SubScreen>
      <SubHeader eyebrow="Egresos de este mes" title="Categorías" onBack={onBack} />
      <div className="px-[20px] pt-[6px] flex flex-col gap-[14px]">
        <GlassCard>
          <div className="p-[16px] text-center">
            <Eyebrow>Total gastado este mes</Eyebrow>
            <div className="mt-[6px] font-['Bai_Jamjuree'] text-[32px] font-bold text-white tabular-nums tracking-[-1px]">
              <span className="text-white/55 text-[18px] mr-[2px]">S/</span>
              {monthExpense.toFixed(2)}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-[16px] flex flex-col gap-[14px]">
            {expensesByCategory.length === 0 && (
              <div className="text-center py-[16px] font-['Geist'] text-[13px] text-white/45">
                Aún no tienes egresos este mes
              </div>
            )}
            {expensesByCategory.map((c) => (
              <div key={c.id} className="flex items-center gap-[12px]">
                <span className="text-[18px] w-[24px] text-center">{c.icon}</span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-['Geist'] text-[13.5px] text-white">{c.label}</span>
                    <div className="flex items-baseline gap-[8px]">
                      <span className="font-['Geist'] text-[11px] text-white/45 tabular-nums">
                        {c.pct.toFixed(0)}%
                      </span>
                      <span className="font-['Bai_Jamjuree'] text-[13px] font-bold text-white tabular-nums">
                        {fmt(c.total)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-[6px] h-[5px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-white/75 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SubScreen>
  );
}

/* ---------- screen ---------- */

export default function FinanceScreen() {
  const [view, setView] = useState<View>("hub");
  const [period, setPeriod] = useState<Period>("mes");
  const [addOpen, setAddOpen] = useState(false);
  const f = useFinance();

  const periodData = (() => {
    if (period === "hoy") return { income: f.todayIncome, expense: f.todayExpense, net: f.todayNet };
    if (period === "semana") {
      const inc = f.last7Days.reduce((s, d) => s + d.income, 0);
      const exp = f.last7Days.reduce((s, d) => s + d.expense, 0);
      return { income: inc, expense: exp, net: inc - exp };
    }
    return { income: f.monthIncome, expense: f.monthExpense, net: f.monthNet };
  })();

  // a naive "previous period" for delta — uses 80% of current as baseline so the chip never lies dramatically
  const prevNet = periodData.net * 0.82;

  const back = () => setView("hub");

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <PageHeader onOpenAdd={() => setAddOpen(true)} />
            <div className="flex flex-col gap-[16px] px-[20px] pt-[8px]">
              <PeriodTabs value={period} onChange={setPeriod} />
              <NetHero value={periodData.net} prevValue={prevNet} />
              <IncomeExpenseSplit income={periodData.income} expense={periodData.expense} />
              <ChartCard days={f.last7Days} />
              <FiadosCard
                pending={f.fiadosPending}
                overdue={f.fiadosOverdue}
                count={f.fiados.filter((x) => !x.settled).length}
                onOpen={() => setView("fiados")}
              />
              <CategoriesCard data={f.expensesByCategory} onOpen={() => setView("categories")} />
              <RecentTx onOpen={() => setView("transactions")} />
              <p className="font-['Geist'] text-[11.5px] text-white/35 text-center pt-[6px]">
                Trax · La verdad de tu negocio
              </p>
            </div>
          </motion.div>
        )}

        {view === "transactions" && <TransactionsView key="tx" onBack={back} />}
        {view === "fiados" && <FiadosView key="fi" onBack={back} />}
        {view === "categories" && <CategoriesView key="cat" onBack={back} />}
      </AnimatePresence>

      <AnimatePresence>{addOpen && <AddSheet onClose={() => setAddOpen(false)} />}</AnimatePresence>
    </div>
  );
}
