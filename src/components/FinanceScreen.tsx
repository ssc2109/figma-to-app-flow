import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, HandCoins, Layers, Clock } from "lucide-react";
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

type View = "hub" | "transactions" | "fiados" | "categories";
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

/* ---------- the one hero ---------- */
function NetHero({ value, label }: { value: number; label: string }) {
  const positive = value >= 0;
  return (
    <div className="flex flex-col items-center text-center py-[14px]">
      <span className="font-['Geist'] text-[11.5px] font-medium uppercase tracking-[1.8px] text-white/35">
        {label}
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
      <span
        className="mt-[10px] font-['Geist'] text-[12.5px]"
        style={{ color: positive ? "rgba(74,222,128,0.85)" : "rgba(248,113,113,0.85)" }}
      >
        {positive ? "Ganancia neta" : "Pérdida"}
      </span>
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

/* ---------- sub-views ---------- */
function TransactionsView({ onBack }: { onBack: () => void }) {
  const { tx } = useFinance();
  return (
    <SubScreen>
      <SubHeader eyebrow="Todos los movimientos" title="Historial" onBack={onBack} />
      <div className="px-[20px] pt-[6px]">
        <ListGroup>
          {tx.map((t, i) => (
            <div key={t.id}>
              <TxRow tx={t} />
              {i < tx.length - 1 && <div className="h-px bg-white/[0.05] mx-[16px]" />}
            </div>
          ))}
        </ListGroup>
      </div>
    </SubScreen>
  );
}

function FiadosView({ onBack }: { onBack: () => void }) {
  const { fiados, settleFiado, fiadosPending } = useFinance();
  const pending = fiados.filter((f) => !f.settled);
  return (
    <SubScreen>
      <SubHeader eyebrow="Te deben" title="Fiados" onBack={onBack} />
      <div className="px-[20px] pt-[14px] flex flex-col gap-[28px]">
        <div className="text-center">
          <Eyebrow>Total pendiente</Eyebrow>
          <div className="mt-[10px] font-['Bai_Jamjuree'] text-[44px] font-bold text-white tabular-nums tracking-[-1.4px] leading-none">
            <span className="text-white/40 text-[18px] mr-[3px] font-medium">S/</span>
            {fiadosPending.toFixed(0)}
          </div>
        </div>

        {pending.length > 0 ? (
          <div>
            <SectionLabel>Por cobrar · {pending.length}</SectionLabel>
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
            No tienes fiados pendientes.
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
          className="w-full h-[52px] rounded-full bg-white text-black font-['Geist'] text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-30"
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

  const periodData = (() => {
    if (period === "hoy") return { net: f.todayNet, label: "Ganancia · hoy" };
    if (period === "semana") {
      const inc = f.last7Days.reduce((s, d) => s + d.income, 0);
      const exp = f.last7Days.reduce((s, d) => s + d.expense, 0);
      return { net: inc - exp, label: "Ganancia · semana" };
    }
    return { net: f.monthNet, label: "Ganancia · mes" };
  })();

  const back = () => setView("hub");
  const pendingCount = f.fiados.filter((x) => !x.settled).length;

  return (
    <div className="relative w-full">
      <AnimatePresence mode="wait" initial={false}>
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
                  className="h-[40px] w-[40px] rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Registrar movimiento"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </button>
              }
            />

            <div className="px-[20px] pt-[18px]">
              <PeriodSwitch value={period} onChange={setPeriod} />
            </div>

            <div className="px-[20px] pt-[8px]">
              <NetHero value={periodData.net} label={periodData.label} />
            </div>

            <div className="px-[20px] pt-[6px]">
              <NetChart days={f.last7Days} />
            </div>

            <div className="px-[20px] mt-[40px]">
              <ListGroup>
                <PlainRow
                  Icon={HandCoins}
                  label="Fiados"
                  meta={pendingCount > 0 ? `Te deben S/ ${f.fiadosPending.toFixed(0)}` : "Al día"}
                  onClick={() => setView("fiados")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Layers}
                  label="Categorías"
                  meta={f.expensesByCategory[0]?.label ?? "Sin egresos"}
                  onClick={() => setView("categories")}
                />
                <RowDivider />
                <PlainRow
                  Icon={Clock}
                  label="Historial"
                  meta={`${f.tx.length} movimientos`}
                  onClick={() => setView("transactions")}
                />
              </ListGroup>
            </div>

            <FooterMark>La verdad de tu negocio</FooterMark>
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
