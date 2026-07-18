import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, HandCoins, Layers } from "lucide-react";
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type TxKind } from "@/data/finance";
import {
  PageHeader,
  SectionLabel,
  ListGroup,
  PlainRow,
  RowDivider,
  SubHeader,
  SubScreen,
  FooterMark,
  Eyebrow,
} from "./business/shared";
import { Sparkline } from "./Sparkline";

type View = "hub" | "deudas" | "categories";
type DeudaTab = "cobrar" | "pagar";
type ActivityRange = "hoy" | "semana" | "mes";
type Period = "hoy" | "semana" | "mes";

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;
const fmtK = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : n.toFixed(0);

/* ---------- period switcher (quiet text) ---------- */
function PeriodSwitch({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const opts: { id: Period; label: string }[] = [
    { id: "hoy", label: "Hoy" },
    { id: "semana", label: "Semana" },
    { id: "mes", label: "Mes" },
  ];
  return (
    <div className="flex items-center justify-center gap-[24px]">
      {opts.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className="relative font-['Geist'] text-[13px] font-medium transition-colors pb-[6px]"
            style={{ color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)" }}
          >
            {o.label}
            {active && (
              <motion.span
                layoutId="fin-period-underline"
                className="absolute -bottom-[1px] left-[10%] right-[10%] h-[1.5px] bg-white rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- capital hero ---------- */
function CapitalHero({ value }: { value: number }) {
  return (
    <div className="flex flex-col items-center text-center py-[14px]">
      <span className="font-['Geist'] text-[11.5px] font-medium uppercase tracking-[1.8px] text-white/35">
        Capital
      </span>
      <div className="mt-[12px] flex items-baseline justify-center gap-[6px]">
        <span className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white/40 tracking-[-0.8px]">
          S/
        </span>
        <span
          className="font-['Bai_Jamjuree'] text-[68px] font-bold text-white tracking-[-2.4px] tabular-nums leading-none"
        >
          {fmtK(Math.abs(value))}
        </span>
      </div>
      <span className="mt-[10px] font-['Geist'] text-[12.5px] text-white/40">
        Saldo acumulado
      </span>
    </div>
  );
}

/* ---------- KPI tile ---------- */
function KpiTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "pos" | "neg";
}) {
  const color =
    tone === "pos" ? "#4ADE80" : tone === "neg" ? "#F87171" : "rgba(255,255,255,0.95)";
  return (
    <div
      className="flex-1 min-w-0 rounded-[20px] px-[14px] py-[14px]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="font-['Geist'] text-[10.5px] font-medium uppercase tracking-[1.4px] text-white/40 truncate">
        {label}
      </div>
      <div
        className="mt-[10px] font-['Bai_Jamjuree'] text-[22px] font-bold tabular-nums tracking-[-0.8px] leading-none"
        style={{ color }}
      >
        <span className="text-white/35 text-[12px] mr-[2px] font-medium">S/</span>
        {fmtK(Math.abs(value))}
      </div>
    </div>
  );
}

/* ---------- one chart ---------- */
function NetChart({ days }: { days: { day: string; income: number; expense: number }[] }) {
  const netSeries = days.map((d) => d.income - d.expense);
  return (
    <div className="px-[8px] pt-[8px] pb-[4px]">
      <Sparkline data={netSeries} />
      <div className="mt-[10px] flex justify-between font-['Geist'] text-[10.5px] text-white/30 tabular-nums px-[2px]">
        {days.map((d, i) => (
          <span key={i}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- recent tx row ---------- */
function TxRow({ tx }: { tx: ReturnType<typeof useFinance>["tx"][number] }) {
  const pos = tx.kind === "ingreso";
  const cat =
    (pos ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find((c) => c.id === tx.category) ??
    { icon: "•", label: tx.category };
  const d = new Date(tx.date);
  const now = new Date();
  const same = d.toDateString() === now.toDateString();
  const time = same
    ? d.toLocaleTimeString("es-PE", { hour: "numeric", minute: "2-digit" })
    : d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
  return (
    <div className="flex items-center gap-[14px] px-[16px] py-[13px]">
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[14.5px] text-white truncate">
          {tx.note ?? cat.label}
        </div>
        <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px]">
          {time}
          {tx.method && <span> · {tx.method}</span>}
        </div>
      </div>
      <div
        className="font-['Bai_Jamjuree'] text-[14.5px] font-medium tabular-nums"
        style={{ color: pos ? "#4ADE80" : "#F87171" }}
      >
        {pos ? "+" : "-"}
        {fmt(tx.amount)}
      </div>
    </div>
  );
}

/* ---------- activity list (Hoy / Semana / Mes) ---------- */
function relTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d
      .toLocaleTimeString("es-PE", { hour: "numeric", minute: "2-digit" })
      .toLowerCase();
  }
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Ayer";
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString("es-PE", { weekday: "long" });
  }
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function ActivityRow({ tx }: { tx: ReturnType<typeof useFinance>["tx"][number] }) {
  const pos = tx.kind === "ingreso";
  const cat =
    (pos ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).find((c) => c.id === tx.category) ?? {
      icon: "•",
      label: tx.category,
    };
  return (
    <div className="flex items-center gap-[14px] py-[12px]">
      <div
        className="h-[44px] w-[44px] rounded-full shrink-0 flex items-center justify-center text-[18px]"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
        aria-hidden
      >
        <span style={{ filter: "saturate(0) brightness(1.5)" }}>{cat.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[14.5px] font-medium text-white truncate">
          {tx.note ?? cat.label}
        </div>
        <div className="font-['Geist'] text-[12px] text-white/45 mt-[2px] truncate">
          {cat.label}
          {tx.method && <span> · {tx.method}</span>}
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <div
          className="font-['Bai_Jamjuree'] text-[15px] font-semibold tabular-nums"
          style={{ color: pos ? "#4ADE80" : "#F87171" }}
        >
          {pos ? "+" : "-"}
          {fmt(tx.amount)}
        </div>
        <div className="font-['Geist'] text-[11.5px] text-white/40 mt-[2px] capitalize">
          {relTime(tx.date)}
        </div>
      </div>
    </div>
  );
}

function ActivityList() {
  const { tx } = useFinance();
  const [range, setRange] = useState<ActivityRange>("hoy");

  const now = new Date();
  const filtered = tx.filter((t) => {
    const d = new Date(t.date);
    if (range === "hoy") return d.toDateString() === now.toDateString();
    const diff = (now.getTime() - d.getTime()) / 86400000;
    if (range === "semana") return diff < 7;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const opts: { id: ActivityRange; label: string }[] = [
    { id: "hoy", label: "Hoy" },
    { id: "semana", label: "Última semana" },
    { id: "mes", label: "Último mes" },
  ];

  return (
    <div>
      <div className="flex items-baseline justify-between mb-[14px]">
        <h3 className="font-['Bai_Jamjuree'] text-[17px] font-semibold text-white tracking-[-0.3px]">
          Actividad reciente
        </h3>
        <span className="font-['Geist'] text-[11.5px] text-white/35 tabular-nums">
          {filtered.length} mov.
        </span>
      </div>

      <div className="flex items-center gap-[6px] mb-[8px] -mx-[2px]">
        {opts.map((o) => {
          const active = o.id === range;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setRange(o.id)}
              className="h-[30px] px-[12px] rounded-full font-['Geist'] text-[12px] font-medium transition-colors"
              style={{
                background: active ? "rgba(255,255,255,0.10)" : "transparent",
                color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)",
                border: `1px solid ${active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={range}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {filtered.length === 0 ? (
            <div className="text-center font-['Geist'] text-[13px] text-white/35 py-[28px]">
              Sin movimientos en este rango.
            </div>
          ) : (
            <div className="flex flex-col">
              {filtered.map((t, i) => (
                <div key={t.id}>
                  <ActivityRow tx={t} />
                  {i < filtered.length - 1 && (
                    <div className="h-px bg-white/[0.05]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DeudasView({ onBack }: { onBack: () => void }) {
  const { fiados, settleFiado, fiadosPending } = useFinance();
  const [tab, setTab] = useState<DeudaTab>("cobrar");
  const pending = fiados.filter((f) => !f.settled);
  // "Por pagar" no existe aún en el modelo de datos — empty state.
  const porPagar: { id: string; supplier: string; amount: number; dueDate?: string }[] = [];
  const totalPagar = porPagar.reduce((s, x) => s + x.amount, 0);

  const total = tab === "cobrar" ? fiadosPending : totalPagar;
  const totalColor = tab === "cobrar" ? "#4ADE80" : "#F87171";
  const totalLabel = tab === "cobrar" ? "Total por cobrar" : "Total por pagar";

  return (
    <SubScreen>
      <SubHeader eyebrow="Cuentas abiertas" title="Deudas" onBack={onBack} />

      {/* Tab switch */}
      <div className="px-[20px] pt-[6px]">
        <div className="flex items-center justify-center gap-[28px]">
          {([
            { id: "cobrar", label: "Por cobrar" },
            { id: "pagar", label: "Por pagar" },
          ] as { id: DeudaTab; label: string }[]).map((o) => {
            const active = tab === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setTab(o.id)}
                className="relative font-['Geist'] text-[13px] font-medium transition-colors pb-[6px]"
                style={{ color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)" }}
              >
                {o.label}
                {active && (
                  <motion.span
                    layoutId="deudas-tab-underline"
                    className="absolute -bottom-[1px] left-[10%] right-[10%] h-[1.5px] bg-white rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-[20px] pt-[18px] flex flex-col gap-[28px]">
        <div className="text-center">
          <Eyebrow>{totalLabel}</Eyebrow>
          <div
            className="mt-[10px] font-['Bai_Jamjuree'] text-[44px] font-bold tabular-nums tracking-[-1.4px] leading-none"
            style={{ color: total > 0 ? totalColor : "rgba(255,255,255,0.95)" }}
          >
            <span className="text-white/40 text-[18px] mr-[3px] font-medium">S/</span>
            {total.toFixed(0)}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {tab === "cobrar" ? (
            <motion.div
              key="cobrar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {pending.length > 0 ? (
                <div>
                  <SectionLabel>{pending.length} pendiente{pending.length === 1 ? "" : "s"}</SectionLabel>
                  <ListGroup>
                    {pending.map((f, i) => {
                      const overdue = f.dueDate && new Date(f.dueDate) < new Date();
                      return (
                        <div key={f.id}>
                          <div className="flex items-center gap-[14px] px-[16px] py-[13px]">
                            <div className="flex-1 min-w-0">
                              <div className="font-['Geist'] text-[14.5px] text-white truncate">{f.client}</div>
                              <div className="font-['Geist'] text-[11.5px] mt-[2px]" style={{ color: overdue ? "#F87171" : "rgba(255,255,255,0.40)" }}>
                                {fmt(f.amount)}{overdue ? " · vencido" : ""}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => settleFiado(f.id)}
                              className="h-[30px] px-[14px] rounded-full font-['Geist'] text-[12.5px] font-medium text-white active:scale-95 transition-transform"
                              style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                            >
                              Cobrar
                            </button>
                          </div>
                          {i < pending.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
                        </div>
                      );
                    })}
                  </ListGroup>
                </div>
              ) : (
                <div className="text-center font-['Geist'] text-[13px] text-white/40 py-[24px]">
                  No tienes cuentas por cobrar.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pagar"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {porPagar.length > 0 ? (
                <div>
                  <SectionLabel>{porPagar.length} pendiente{porPagar.length === 1 ? "" : "s"}</SectionLabel>
                  <ListGroup>
                    {porPagar.map((p, i) => (
                      <div key={p.id}>
                        <div className="flex items-center gap-[14px] px-[16px] py-[13px]">
                          <div className="flex-1 min-w-0">
                            <div className="font-['Geist'] text-[14.5px] text-white truncate">{p.supplier}</div>
                            <div className="font-['Geist'] text-[11.5px] mt-[2px] text-white/40">{fmt(p.amount)}</div>
                          </div>
                        </div>
                        {i < porPagar.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
                      </div>
                    ))}
                  </ListGroup>
                </div>
              ) : (
                <div className="text-center font-['Geist'] text-[13px] text-white/40 py-[24px]">
                  No tienes cuentas por pagar.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SubScreen>
  );
}

function CategoriesView({ onBack }: { onBack: () => void }) {
  const { expensesByCategory, monthExpense } = useFinance();
  return (
    <SubScreen>
      <SubHeader eyebrow="Egresos del mes" title="Categorías" onBack={onBack} />
      <div className="px-[20px] pt-[14px] flex flex-col gap-[28px]">
        <div className="text-center">
          <Eyebrow>Total gastado</Eyebrow>
          <div className="mt-[10px] font-['Bai_Jamjuree'] text-[44px] font-bold text-white tabular-nums tracking-[-1.4px] leading-none">
            <span className="text-white/40 text-[18px] mr-[3px] font-medium">S/</span>
            {monthExpense.toFixed(0)}
          </div>
        </div>

        <div className="flex flex-col gap-[18px]">
          {expensesByCategory.length === 0 && (
            <div className="text-center font-['Geist'] text-[13px] text-white/40 py-[18px]">
              Aún no tienes egresos este mes.
            </div>
          )}
          {expensesByCategory.map((c) => (
            <div key={c.id} className="px-[6px]">
              <div className="flex items-baseline justify-between">
                <span className="font-['Geist'] text-[14px] text-white">{c.label}</span>
                <span className="font-['Bai_Jamjuree'] text-[13.5px] font-semibold text-white tabular-nums">
                  {fmt(c.total)}
                </span>
              </div>
              <div className="mt-[8px] h-[3px] w-full rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.pct}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-white/55 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </SubScreen>
  );
}

/* ---------- add sheet ---------- */
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
        className="relative w-full max-w-[430px] rounded-t-[28px] pb-[32px] pt-[18px] px-[24px]"
        style={{
          background: "rgba(14,14,16,0.97)",
          backdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto h-[4px] w-[40px] rounded-full bg-white/15 mb-[18px]" />
        <div className="flex items-center justify-between mb-[24px]">
          <h2 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.4px]">
            Registrar movimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-[32px] w-[32px] rounded-full flex items-center justify-center active:bg-white/[0.05]"
            aria-label="Cerrar"
          >
            <X className="h-[16px] w-[16px] text-white/55" strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex justify-center gap-[28px] mb-[24px]">
          {(["egreso", "ingreso"] as TxKind[]).map((k) => {
            const active = kind === k;
            const color = k === "egreso" ? "#F87171" : "#4ADE80";
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  setCategory(k === "egreso" ? "mercaderia" : "ventas");
                }}
                className="relative font-['Geist'] text-[14px] font-medium pb-[6px]"
                style={{ color: active ? color : "rgba(255,255,255,0.40)" }}
              >
                {k === "egreso" ? "Egreso" : "Ingreso"}
                {active && (
                  <motion.span
                    layoutId="add-tab-underline"
                    className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] rounded-full"
                    style={{ background: color }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-end justify-center gap-[6px] mb-[24px]">
          <span className="font-['Bai_Jamjuree'] text-[22px] font-medium text-white/45 mb-[10px]">
            S/
          </span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-[200px] bg-transparent outline-none text-center font-['Bai_Jamjuree'] text-[56px] font-bold text-white tracking-[-2px] tabular-nums placeholder:text-white/15"
          />
        </div>

        <div className="-mx-[24px] overflow-x-auto no-scrollbar mb-[16px]">
          <div className="flex gap-[8px] px-[24px]">
            {cats.map((c) => {
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className="shrink-0 h-[34px] px-[14px] rounded-full font-['Geist'] text-[12.5px] font-medium transition-colors"
                  style={{
                    background: active ? "rgba(255,255,255,0.95)" : "transparent",
                    color: active ? "#000" : "rgba(255,255,255,0.70)",
                    border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  {c.label}
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
          className="w-full h-[46px] px-[16px] rounded-full bg-transparent border border-white/[0.10] outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/30 mb-[18px]"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!amount}
          className="w-full h-[52px] rounded-full bg-[#3b82f6] text-white font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-30"
        >
          Guardar
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------- screen ---------- */
export default function FinanceScreen() {
  const [view, setView] = useState<View>("hub");
  const [period, setPeriod] = useState<Period>("mes");
  const [addOpen, setAddOpen] = useState(false);
  const f = useFinance();

  useEffect(() => {
    if (view !== "hub") {
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    }
  }, [view]);

  const openView = (next: View) => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setView(next);
  };

  const capital = f.tx.reduce(
    (s, t) => s + (t.kind === "ingreso" ? t.amount : -t.amount),
    0,
  );

  const kpis = (() => {
    if (period === "hoy") {
      return { income: f.todayIncome, expense: f.todayExpense, net: f.todayNet };
    }
    if (period === "semana") {
      const income = f.last7Days.reduce((s, d) => s + d.income, 0);
      const expense = f.last7Days.reduce((s, d) => s + d.expense, 0);
      return { income, expense, net: income - expense };
    }
    return { income: f.monthIncome, expense: f.monthExpense, net: f.monthNet };
  })();

  const back = () => setView("hub");
  const pendingCount = f.fiados.filter((x) => !x.settled).length;

  return (
    <div className="relative w-full">
      <>
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <PageHeader
              eyebrow="Cómo va tu plata"
              title="Finanzas"
              action={
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="h-[40px] w-[40px] rounded-full bg-[#3b82f6] text-white flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Registrar movimiento"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </button>
              }
            />

            <div className="px-[20px] pt-[8px]">
              <CapitalHero value={capital} />
            </div>

            <div className="px-[20px] pt-[6px]">
              <NetChart days={f.last7Days} />
            </div>

            <div className="px-[20px] pt-[28px]">
              <PeriodSwitch value={period} onChange={setPeriod} />
            </div>

            <div className="px-[20px] pt-[16px] flex gap-[10px]">
              <KpiTile label="Ingresos" value={kpis.income} tone="pos" />
              <KpiTile label="Egresos" value={kpis.expense} tone="neg" />
              <KpiTile label="Ganancia" value={kpis.net} tone={kpis.net >= 0 ? "neutral" : "neg"} />
            </div>

            <div className="px-[20px] mt-[32px]">
              <ListGroup>
                <PlainRow
                  Icon={HandCoins}
                  label="Deudas"
                  meta={pendingCount > 0 ? `Te deben S/ ${f.fiadosPending.toFixed(0)}` : "Al día"}
                  onClick={() => openView("deudas")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Layers}
                  label="Categorías"
                  meta={f.expensesByCategory[0]?.label ?? "Sin egresos"}
                  onClick={() => openView("categories")}
                />
              </ListGroup>
            </div>

            <div className="px-[20px] mt-[36px]">
              <ActivityList />
            </div>

            <FooterMark>La verdad de tu negocio</FooterMark>
          </motion.div>
        )}

        
        {view === "deudas" && <DeudasView key="de" onBack={back} />}
        {view === "categories" && <CategoriesView key="cat" onBack={back} />}
      </>

      <AnimatePresence>{addOpen && <AddSheet onClose={() => setAddOpen(false)} />}</AnimatePresence>
    </div>
  );
}
