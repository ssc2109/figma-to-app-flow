import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Send,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  HandCoins,
  Wand2,
  Mic,
  Zap,
} from "lucide-react";
import { useInventory } from "@/data/inventory";
import { useFinance, EXPENSE_CATEGORIES } from "@/data/finance";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  action?: { label: string; detail: string; color?: "green" | "red" | "white" };
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

function respond(
  input: string,
  ctx: { inv: ReturnType<typeof useInventory>; fin: ReturnType<typeof useFinance> },
): { text: string; action?: Msg["action"]; sideEffect?: () => void } {
  const q = input.toLowerCase().trim();
  const expenseMatch = q.match(
    /(?:registra|anota|apunta|gasto|gasté|paga|gasta)[^\d]*([\d.,]+)(?:.*?(?:de|para|en)\s+(.+))?/,
  );
  if (expenseMatch) {
    const amount = parseFloat(expenseMatch[1].replace(",", "."));
    const where = (expenseMatch[2] ?? "otros").trim();
    const cat =
      EXPENSE_CATEGORIES.find(
        (c) => where.includes(c.label.toLowerCase()) || where.includes(c.id),
      ) ?? EXPENSE_CATEGORIES.find((c) => c.id === "servicios") ?? EXPENSE_CATEGORIES[0];
    if (amount > 0) {
      return {
        text: `Listo. Apunté ${fmt(amount)} en ${cat.label}. Hoy ya gastaste ${fmt(ctx.fin.todayExpense + amount)}.`,
        action: { label: "Egreso registrado", detail: `${cat.icon} ${cat.label} · ${fmt(amount)}`, color: "red" },
        sideEffect: () =>
          ctx.fin.addTransaction({
            kind: "egreso",
            amount,
            category: cat.id,
            note: where,
            method: "Efectivo",
          }),
      };
    }
  }
  if (/cobr[éaoé]|pag[óo]|me pag[óo]/.test(q) && /fiado|deuda/.test(q)) {
    const name = q.match(/(?:rosa|julio|marta)/i)?.[0];
    const target = ctx.fin.fiados.find(
      (f) => !f.settled && (!name || f.client.toLowerCase().includes(name.toLowerCase())),
    );
    if (target) {
      return {
        text: `Perfecto. Marqué el fiado de ${target.client} (${fmt(target.amount)}) como cobrado y lo sumé a tus ingresos.`,
        action: { label: "Fiado cobrado", detail: `${target.client} · ${fmt(target.amount)}`, color: "green" },
        sideEffect: () => ctx.fin.settleFiado(target.id),
      };
    }
    return { text: "No encontré un fiado pendiente con ese nombre. ¿Me lo confirmas?" };
  }
  if (/stock|falta|reponer|agotar/.test(q)) {
    if (ctx.inv.lowStock.length === 0) {
      return { text: "Estás bien de stock. Ningún producto crítico ahora mismo. 👌" };
    }
    const list = ctx.inv.lowStock.slice(0, 3).map((i) => `${i.name} (${i.stock} u)`).join(", ");
    return {
      text: `Tienes ${ctx.inv.lowStock.length} producto${ctx.inv.lowStock.length === 1 ? "" : "s"} con stock crítico: ${list}. ¿Quieres que te ayude a hacer el pedido al proveedor?`,
      action: { label: "Stock crítico", detail: `${ctx.inv.lowStock.length} productos`, color: "red" },
    };
  }
  if (/cómo voy|como voy|resumen|día|cómo va|como va|hoy/.test(q)) {
    const net = ctx.fin.todayNet;
    const sign = net >= 0 ? "+" : "-";
    return {
      text: `Hoy llevas ${fmt(ctx.fin.todayIncome)} en ventas y ${fmt(ctx.fin.todayExpense)} en gastos. Tu ganancia neta del día va en ${sign}${fmt(Math.abs(net))}. ${net > 0 ? "Vas bien." : "Aún hay tiempo para revertirlo."}`,
      action: {
        label: "Resumen del día",
        detail: `${sign}${fmt(Math.abs(net))} netos`,
        color: net >= 0 ? "green" : "red",
      },
    };
  }
  if (/mes|mensual|este mes/.test(q)) {
    return {
      text: `Este mes vas con ${fmt(ctx.fin.monthIncome)} de ingresos y ${fmt(ctx.fin.monthExpense)} de gastos. Neto: ${fmt(ctx.fin.monthNet)}. ${ctx.fin.fiadosPending > 0 ? `Te deben ${fmt(ctx.fin.fiadosPending)} en fiados.` : ""}`,
    };
  }
  if (/fiado|deben|deuda/.test(q)) {
    return {
      text: `Te deben ${fmt(ctx.fin.fiadosPending)} en total. ${ctx.fin.fiadosOverdue > 0 ? `Cuidado, ${fmt(ctx.fin.fiadosOverdue)} ya están vencidos.` : "Ningún fiado está vencido todavía."}`,
    };
  }
  return {
    text:
      "Puedo ayudarte a registrar gastos, cobrar fiados, revisar tu stock o decirte cómo va tu día. Prueba con algo como “registra 80 de luz” o “¿cómo voy hoy?”.",
  };
}

const SUGGESTIONS = [
  { icon: TrendingUp, text: "¿Cómo voy hoy?", color: "rgba(74,222,128,0.85)" },
  { icon: Wand2, text: "Registra S/ 50 de luz", color: "rgba(255,255,255,0.85)" },
  { icon: AlertTriangle, text: "¿Qué me falta de stock?", color: "rgba(248,113,113,0.85)" },
  { icon: HandCoins, text: "Cobré fiado de Rosa", color: "rgba(74,222,128,0.85)" },
  { icon: Zap, text: "¿Cuánto neto este mes?", color: "rgba(255,255,255,0.85)" },
];

export default function SociaScreen() {
  const inv = useInventory();
  const fin = useFinance();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const insights = useMemo(() => {
    const list: { Icon: typeof TrendingUp; tone: "green" | "red" | "white"; title: string; meta: string }[] = [];
    list.push({
      Icon: fin.todayNet >= 0 ? TrendingUp : TrendingDown,
      tone: fin.todayNet >= 0 ? "green" : "red",
      title: `${fin.todayNet >= 0 ? "+" : "-"}${fmt(Math.abs(fin.todayNet))} netos hoy`,
      meta: `${fmt(fin.todayIncome)} ventas · ${fmt(fin.todayExpense)} gastos`,
    });
    if (inv.lowStock.length > 0) {
      list.push({
        Icon: AlertTriangle,
        tone: "red",
        title: `${inv.lowStock.length} producto${inv.lowStock.length === 1 ? "" : "s"} por agotarse`,
        meta: inv.lowStock.slice(0, 2).map((i) => i.name).join(", "),
      });
    }
    if (fin.fiadosPending > 0) {
      list.push({
        Icon: HandCoins,
        tone: fin.fiadosOverdue > 0 ? "red" : "white",
        title: `Te deben ${fmt(fin.fiadosPending)}`,
        meta: fin.fiadosOverdue > 0 ? `${fmt(fin.fiadosOverdue)} vencidos` : "Todo dentro de plazo",
      });
    }
    return list;
  }, [fin, inv]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { text: reply, action, sideEffect } = respond(text, { inv, fin });
      sideEffect?.();
      setMsgs((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: reply, action }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const empty = msgs.length === 0;

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* ambient gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] z-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(120,180,255,0.20) 0%, rgba(60,88,243,0.10) 35%, transparent 70%)",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%)",
        }}
      />

      {/* header */}
      <div className="relative z-10 px-[20px] pt-[22px] pb-[12px] flex items-center gap-[12px]">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="h-[44px] w-[44px] rounded-[14px] flex items-center justify-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(180,200,255,0.32), rgba(80,120,255,0.10))",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={1.9} />
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.25) 40deg, transparent 80deg)",
              mixBlendMode: "overlay",
            }}
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.5px] leading-none">
            soc<span style={{ color: "rgba(180,200,255,0.95)" }}>IA</span>
          </div>
          <div className="font-['Geist'] text-[11.5px] text-white/55 flex items-center gap-[6px] mt-[4px]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#4ADE80] trax-breathe" />
            Conectada a tu negocio · {inv.productCount} SKU · {fin.fiados.filter((x) => !x.settled).length} fiados
          </div>
        </div>
      </div>

      {/* insights (only when empty) */}
      <AnimatePresence initial={false}>
        {empty && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 px-[20px] pt-[6px] pb-[10px] flex flex-col gap-[10px]"
          >
            <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/45 px-[2px]">
              Lo que necesitas saber ahora
            </div>
            {insights.map((it, i) => (
              <InsightCard key={i} {...it} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-[16px] pt-[6px] pb-[16px] flex flex-col gap-[10px]">
        {msgs.map((m) => (
          <MsgBubble key={m.id} msg={m} />
        ))}
        {typing && (
          <div
            className="flex items-center gap-[6px] px-[14px] py-[10px] rounded-[18px] self-start"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-[6px] w-[6px] rounded-full bg-white/55"
                animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* suggestions */}
      {empty && (
        <div className="relative z-10 px-[16px] pb-[10px] flex gap-[8px] overflow-x-auto no-scrollbar">
          {SUGGESTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.text}
                type="button"
                onClick={() => send(s.text)}
                className="shrink-0 h-[36px] pl-[10px] pr-[14px] rounded-full flex items-center gap-[6px] active:scale-95"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Icon className="h-[13px] w-[13px]" style={{ color: s.color }} strokeWidth={2} />
                <span className="font-['Geist'] text-[12.5px] text-white/85 whitespace-nowrap">{s.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* composer */}
      <div className="relative z-10 px-[16px] pt-[8px] pb-[28px]">
        <div
          className="flex items-center gap-[8px] h-[52px] pl-[18px] pr-[6px] rounded-full"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pídele algo a socIA…"
            className="flex-1 bg-transparent outline-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/35"
          />
          <button
            type="button"
            className="h-[38px] w-[38px] rounded-full bg-white/[0.06] flex items-center justify-center active:scale-95"
            aria-label="Hablar"
          >
            <Mic className="h-[14px] w-[14px] text-white/75" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim()}
            className="h-[40px] w-[40px] rounded-full bg-white text-black flex items-center justify-center active:scale-95 disabled:opacity-40"
          >
            <Send className="h-[14px] w-[14px]" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  Icon,
  title,
  meta,
  tone,
}: {
  Icon: typeof TrendingUp;
  title: string;
  meta: string;
  tone: "green" | "red" | "white";
}) {
  const palette = {
    green: { bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.22)", icon: "#4ADE80" },
    red: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.22)", icon: "#F87171" },
    white: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.10)", icon: "rgba(255,255,255,0.85)" },
  }[tone];
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="flex items-center gap-[12px] rounded-[18px] p-[12px]"
      style={{ background: palette.bg, border: `1px solid ${palette.border}` }}
    >
      <div
        className="h-[36px] w-[36px] rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <Icon className="h-[15px] w-[15px]" style={{ color: palette.icon }} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[13.5px] font-medium text-white truncate">{title}</div>
        <div className="font-['Geist'] text-[11.5px] text-white/55 truncate">{meta}</div>
      </div>
    </motion.div>
  );
}

function MsgBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  const actionColor = {
    green: { bg: "rgba(74,222,128,0.10)", border: "rgba(74,222,128,0.25)", text: "#4ADE80" },
    red: { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)", text: "#F87171" },
    white: { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.12)", text: "rgba(255,255,255,0.85)" },
  }[msg.action?.color ?? "white"];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`max-w-[84%] ${isUser ? "self-end" : "self-start"} flex flex-col gap-[6px]`}
    >
      <div
        className="px-[14px] py-[10px] rounded-[18px] font-['Geist'] text-[13.5px] leading-[1.5]"
        style={{
          background: isUser ? "rgba(255,255,255,0.94)" : "rgba(255,255,255,0.04)",
          color: isUser ? "#000" : "rgba(255,255,255,0.92)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {msg.text}
      </div>
      {msg.action && (
        <div
          className="self-start rounded-[12px] px-[10px] py-[6px] flex items-center gap-[8px]"
          style={{ background: actionColor.bg, border: `1px solid ${actionColor.border}` }}
        >
          <ArrowDown className="h-[11px] w-[11px]" style={{ color: actionColor.text }} strokeWidth={2.4} />
          <div className="flex flex-col">
            <span
              className="font-['Geist'] text-[9.5px] font-semibold uppercase tracking-[0.6px]"
              style={{ color: actionColor.text }}
            >
              {msg.action.label}
            </span>
            <span className="font-['Geist'] text-[11.5px] text-white/85">{msg.action.detail}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
