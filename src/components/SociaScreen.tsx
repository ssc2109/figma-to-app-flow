import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, ArrowUp } from "lucide-react";
import { useInventory } from "@/data/inventory";
import { useFinance, EXPENSE_CATEGORIES } from "@/data/finance";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const fmt = (n: number) => `S/ ${n.toFixed(2)}`;

function respond(
  input: string,
  ctx: { inv: ReturnType<typeof useInventory>; fin: ReturnType<typeof useFinance> },
): { text: string; sideEffect?: () => void } {
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
        sideEffect: () => ctx.fin.settleFiado(target.id),
      };
    }
    return { text: "No encontré un fiado pendiente con ese nombre. ¿Me lo confirmas?" };
  }
  if (/stock|falta|reponer|agotar/.test(q)) {
    if (ctx.inv.lowStock.length === 0) {
      return { text: "Estás bien de stock. Ningún producto crítico ahora mismo." };
    }
    const list = ctx.inv.lowStock.slice(0, 3).map((i) => `${i.name} (${i.stock} u)`).join(", ");
    return {
      text: `Tienes ${ctx.inv.lowStock.length} producto${ctx.inv.lowStock.length === 1 ? "" : "s"} con stock crítico: ${list}.`,
    };
  }
  if (/cómo voy|como voy|resumen|día|cómo va|como va|hoy/.test(q)) {
    const net = ctx.fin.todayNet;
    const sign = net >= 0 ? "+" : "-";
    return {
      text: `Hoy: ${fmt(ctx.fin.todayIncome)} en ventas, ${fmt(ctx.fin.todayExpense)} en gastos. Neto ${sign}${fmt(Math.abs(net))}.`,
    };
  }
  if (/mes|mensual|este mes/.test(q)) {
    return {
      text: `Este mes: ${fmt(ctx.fin.monthIncome)} de ingresos, ${fmt(ctx.fin.monthExpense)} de gastos. Neto ${fmt(ctx.fin.monthNet)}.`,
    };
  }
  if (/fiado|deben|deuda/.test(q)) {
    return {
      text: `Te deben ${fmt(ctx.fin.fiadosPending)} en total.`,
    };
  }
  return {
    text: "Puedo registrar gastos, cobrar fiados, revisar tu stock o decirte cómo va tu día.",
  };
}

const SUGGESTIONS = [
  "¿Cómo voy hoy?",
  "Registra 50 de luz",
  "¿Qué me falta de stock?",
  "¿Cuánto neto este mes?",
];

export default function SociaScreen() {
  const inv = useInventory();
  const fin = useFinance();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días, Alberto.";
    if (h < 19) return "Buenas tardes, Alberto.";
    return "Buenas noches, Alberto.";
  }, []);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    setMsgs((m) => [...m, { id: `u${Date.now()}`, role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const { text: reply, sideEffect } = respond(text, { inv, fin });
      sideEffect?.();
      setMsgs((m) => [...m, { id: `a${Date.now()}`, role: "assistant", text: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 300);
  };

  const empty = msgs.length === 0;

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* header — barely there */}
      <div className="relative z-10 px-[24px] pt-[28px] pb-[16px] flex items-center justify-between">
        <div>
          <div className="font-['Geist'] text-[11px] font-medium uppercase tracking-[1.6px] text-white/35">
            Asistente
          </div>
          <h1 className="mt-[4px] font-['Bai_Jamjuree'] text-[22px] font-semibold text-white tracking-[-0.5px] leading-none">
            soc<span className="text-white/55">IA</span>
          </h1>
        </div>
        <div className="flex items-center gap-[6px] font-['Geist'] text-[11px] text-white/40">
          <span className="h-[6px] w-[6px] rounded-full bg-white/40" />
          Conectada
        </div>
      </div>

      {/* empty state — single greeting, nothing else */}
      <AnimatePresence initial={false}>
        {empty && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex-1 flex flex-col items-center justify-center px-[28px] text-center"
          >
            <h2 className="font-['Bai_Jamjuree'] text-[28px] font-semibold text-white tracking-[-0.8px] leading-[1.2] max-w-[300px]">
              {greeting}
            </h2>
            <p className="mt-[14px] font-['Geist'] text-[14px] text-white/45 leading-[1.5] max-w-[280px]">
              ¿En qué te ayudo con la bodega hoy?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* messages */}
      {!empty && (
        <div
          ref={scrollRef}
          className="relative z-10 flex-1 overflow-y-auto px-[20px] pt-[8px] pb-[20px] flex flex-col gap-[14px]"
        >
          {msgs.map((m) => (
            <MsgBubble key={m.id} msg={m} />
          ))}
          {typing && (
            <div className="self-start flex items-center gap-[5px] px-[2px] py-[8px]">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-[6px] w-[6px] rounded-full bg-white/35"
                  animate={{ opacity: [0.25, 0.9, 0.25] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* suggestions */}
      {empty && (
        <div className="relative z-10 px-[20px] pb-[12px] flex gap-[8px] overflow-x-auto no-scrollbar">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="shrink-0 h-[36px] px-[14px] rounded-full font-['Geist'] text-[12.5px] text-white/75 active:scale-95 transition-transform"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* composer */}
      <div className="relative z-10 px-[20px] pt-[6px] pb-[28px]">
        <div
          className="flex items-center gap-[6px] h-[52px] pl-[20px] pr-[6px] rounded-full"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Pregúntame algo…"
            className="flex-1 bg-transparent outline-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/30"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim()}
            className="h-[40px] w-[40px] rounded-full bg-white text-black flex items-center justify-center active:scale-95 disabled:opacity-25 transition-opacity"
            aria-label="Enviar"
          >
            <ArrowUp className="h-[16px] w-[16px]" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MsgBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="max-w-[80%] self-end px-[16px] py-[10px] rounded-[20px] bg-white text-black font-['Geist'] text-[14px] leading-[1.45]"
      >
        {msg.text}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="max-w-[88%] self-start font-['Geist'] text-[14.5px] text-white/90 leading-[1.55] px-[2px]"
    >
      {msg.text}
    </motion.div>
  );
}
