import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, ArrowDown } from "lucide-react";
import { useInventory } from "@/data/inventory";
import { useFinance, EXPENSE_CATEGORIES } from "@/data/finance";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  action?: {
    label: string;
    detail: string;
    color?: "green" | "red" | "white";
  };
};

const QUICK = [
  "¿Cómo voy hoy?",
  "Registrar S/ 50 de luz",
  "¿Qué me falta de stock?",
  "Cobré fiado de Rosa",
];

function fmt(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

/* ---------- intent engine (mock pero conectado a datos) ---------- */

function respond(
  input: string,
  ctx: {
    inv: ReturnType<typeof useInventory>;
    fin: ReturnType<typeof useFinance>;
  },
): { text: string; action?: Msg["action"]; sideEffect?: () => void } {
  const q = input.toLowerCase().trim();

  // Registrar egreso: "registra/anota/apunta S/ X de/para CATEGORIA"
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

  // Cobrar fiado
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

  // Stock
  if (/stock|falta|reponer|agotar/.test(q)) {
    if (ctx.inv.lowStock.length === 0) {
      return { text: "Estás bien de stock. Ningún producto crítico ahora mismo. 👌" };
    }
    const list = ctx.inv.lowStock
      .slice(0, 3)
      .map((i) => `${i.name} (${i.stock} u)`)
      .join(", ");
    return {
      text: `Tienes ${ctx.inv.lowStock.length} producto${ctx.inv.lowStock.length === 1 ? "" : "s"} con stock crítico: ${list}. ¿Quieres que te ayude a hacer el pedido al proveedor?`,
      action: { label: "Stock crítico", detail: `${ctx.inv.lowStock.length} productos`, color: "red" },
    };
  }

  // ¿Cómo voy? / resumen
  if (/cómo voy|como voy|resumen|día|cómo va|como va|hoy/.test(q)) {
    const net = ctx.fin.todayNet;
    const sign = net >= 0 ? "+" : "-";
    return {
      text: `Hoy llevas ${fmt(ctx.fin.todayIncome)} en ventas y ${fmt(ctx.fin.todayExpense)} en gastos. Tu ganancia neta del día va en ${sign}${fmt(Math.abs(net))}. ${
        net > 0 ? "Vas bien." : "Aún hay tiempo para revertirlo."
      }`,
      action: {
        label: "Resumen del día",
        detail: `${sign}${fmt(Math.abs(net))} netos`,
        color: net >= 0 ? "green" : "red",
      },
    };
  }

  // Mes
  if (/mes|mensual|este mes/.test(q)) {
    return {
      text: `Este mes vas con ${fmt(ctx.fin.monthIncome)} de ingresos y ${fmt(ctx.fin.monthExpense)} de gastos. Neto: ${fmt(ctx.fin.monthNet)}. ${
        ctx.fin.fiadosPending > 0 ? `Te deben ${fmt(ctx.fin.fiadosPending)} en fiados.` : ""
      }`,
    };
  }

  // Fiados
  if (/fiado|deben|deuda/.test(q)) {
    return {
      text: `Te deben ${fmt(ctx.fin.fiadosPending)} en total. ${
        ctx.fin.fiadosOverdue > 0
          ? `Cuidado, ${fmt(ctx.fin.fiadosOverdue)} ya están vencidos.`
          : "Ningún fiado está vencido todavía."
      }`,
    };
  }

  // Default
  return {
    text:
      "Puedo ayudarte a registrar gastos, cobrar fiados, revisar tu stock o decirte cómo va tu día. Prueba con algo como “registra 80 de luz” o “¿cómo voy hoy?”.",
  };
}

/* ---------- UI ---------- */

export default function AIChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inv = useInventory();
  const fin = useFinance();
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "m0",
      role: "assistant",
      text: "Hola Alberto 👋 Soy Trax. Pídeme cualquier cosa de tu bodega: registra gastos, cobra fiados, revisa stock o pregúntame cómo va tu día.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { text: reply, action, sideEffect } = respond(text, { inv, fin });
      sideEffect?.();
      setMsgs((m) => [
        ...m,
        { id: `a${Date.now()}`, role: "assistant", text: reply, action },
      ]);
      setTyping(false);
    }, 650 + Math.random() * 500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative w-full max-w-[430px] h-[85vh] flex flex-col rounded-t-[28px] overflow-hidden"
            style={{
              background: "rgba(14,14,16,0.96)",
              backdropFilter: "blur(40px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* header */}
            <div className="px-[20px] pt-[16px] pb-[14px] border-b border-white/[0.05]">
              <div className="mx-auto h-[4px] w-[44px] rounded-full bg-white/15 mb-[12px]" />
              <div className="flex items-center gap-[12px]">
                <div
                  className="h-[40px] w-[40px] rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.04))",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white tracking-[-0.3px]">
                    Trax AI
                  </div>
                  <div className="font-['Geist'] text-[11px] text-white/55 flex items-center gap-[5px]">
                    <span className="h-[5px] w-[5px] rounded-full bg-[#4ADE80] trax-breathe" />
                    Conectado a tu negocio
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[34px] w-[34px] rounded-full bg-white/[0.06] flex items-center justify-center active:scale-95"
                >
                  <X className="h-[14px] w-[14px] text-white/70" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-[16px] py-[16px] flex flex-col gap-[10px]">
              {msgs.map((m) => (
                <MsgBubble key={m.id} msg={m} />
              ))}
              {typing && (
                <div className="flex items-center gap-[6px] px-[14px] py-[10px] rounded-[18px] self-start"
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

            {/* quick chips */}
            {msgs.length <= 2 && (
              <div className="px-[16px] pb-[8px] flex gap-[6px] overflow-x-auto no-scrollbar">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => send(q)}
                    className="shrink-0 h-[32px] px-[12px] rounded-full bg-white/[0.05] border border-white/[0.08] font-['Geist'] text-[12px] text-white/75 active:scale-95"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <div className="px-[16px] pt-[10px] pb-[24px] border-t border-white/[0.05]">
              <div
                className="flex items-center gap-[8px] h-[48px] pl-[16px] pr-[6px] rounded-full"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Pregúntame o pídeme algo…"
                  className="flex-1 bg-transparent outline-none font-['Geist'] text-[14px] text-white placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="h-[36px] w-[36px] rounded-full bg-white text-black flex items-center justify-center active:scale-95 disabled:opacity-40"
                >
                  <Send className="h-[14px] w-[14px]" strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
      className={`max-w-[82%] ${isUser ? "self-end" : "self-start"} flex flex-col gap-[6px]`}
    >
      <div
        className="px-[14px] py-[10px] rounded-[18px] font-['Geist'] text-[13.5px] leading-[1.5]"
        style={{
          background: isUser ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.04)",
          color: isUser ? "#000" : "rgba(255,255,255,0.92)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {msg.text}
      </div>
      {msg.action && (
        <div
          className="self-start rounded-[12px] px-[10px] py-[6px] flex items-center gap-[8px]"
          style={{
            background: actionColor.bg,
            border: `1px solid ${actionColor.border}`,
          }}
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
