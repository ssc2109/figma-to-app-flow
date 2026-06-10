import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp,
  Camera,
  Mic,
  Search,
  Sparkles,
  ScanLine,
  TrendingUp,
  Plus,
  History,
  Trash2,
  X,
  Square,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInventory } from "@/data/inventory";
import { useFinance } from "@/data/finance";
import {
  listThreads,
  createThread,
  deleteThread,
  getThreadMessages,
} from "@/lib/api/chat.functions";
import ShaderOrb from "./socia/ShaderOrb";

type FeatureKey = "foto" | "voz" | "analisis" | "mercado" | "escanear";

const FEATURES: Array<{
  key: FeatureKey;
  icon: typeof Camera;
  title: string;
  subtitle: string;
  hue: number;
  prompt?: string;
}> = [
  {
    key: "foto",
    icon: Camera,
    title: "Foto a libreta",
    subtitle: "Foto y extraigo ventas/gastos",
    hue: 0.62,
  },
  {
    key: "voz",
    icon: Mic,
    title: "Dictado por voz",
    subtitle: "Hablame y lo registro",
    hue: 0.05,
  },
  {
    key: "analisis",
    icon: TrendingUp,
    title: "Análisis del día",
    subtitle: "Resumen e insights inteligentes",
    hue: 0.4,
    prompt: "Hazme un análisis completo de cómo va mi negocio hoy: ventas, gastos, fiados y stock crítico. Dame insights y 3 sugerencias accionables.",
  },
  {
    key: "mercado",
    icon: Search,
    title: "Investigación",
    subtitle: "Precios y competencia",
    hue: 0.78,
    prompt: "Necesito que me ayudes a investigar precios de mercado para los productos top de mi negocio. ¿Qué información necesitas de mí?",
  },
  {
    key: "escanear",
    icon: ScanLine,
    title: "Escanear producto",
    subtitle: "Foto al producto y lo añado",
    hue: 0.85,
  },
];

const QUICK_PROMPTS = [
  "¿Cómo voy hoy?",
  "Registra 50 de luz",
  "¿Qué me falta de stock?",
  "¿Cuánto gané este mes?",
];

type DbMessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: unknown;
  created_at: string;
};

function rowsToUIMessages(rows: DbMessageRow[]): UIMessage[] {
  return rows
    .filter((r) => r.role === "user" || r.role === "assistant")
    .map((r) => ({
      id: r.id,
      role: r.role as "user" | "assistant",
      parts: (Array.isArray(r.parts) ? r.parts : []) as UIMessage["parts"],
    }));
}

function uiMessageText(m: UIMessage): string {
  return (m.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}

export default function SociaScreen() {
  const inv = useInventory();
  const fin = useFinance();
  const qc = useQueryClient();

  // ---------- threads ----------
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);
  const getMessagesFn = useServerFn(getThreadMessages);

  const { data: threadsData } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => listFn(),
  });
  const threads = threadsData?.threads ?? [];

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Load initial messages for active thread
  const { data: threadMessages } = useQuery({
    queryKey: ["chat-messages", activeThreadId],
    queryFn: () =>
      activeThreadId
        ? getMessagesFn({ data: { threadId: activeThreadId } })
        : Promise.resolve({ messages: [] }),
    enabled: !!activeThreadId,
  });

  // ---------- chat ----------
  const [bearer, setBearer] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setBearer(data.session?.access_token ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setBearer(s?.access_token ?? null),
    );
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Build context for the model: live snapshot of business data
  const liveContext = useMemo(
    () => ({
      hoy: {
        ventas: fin.todayIncome,
        gastos: fin.todayExpense,
        neto: fin.todayNet,
      },
      mes: {
        ventas: fin.monthIncome,
        gastos: fin.monthExpense,
        neto: fin.monthNet,
      },
      fiados: {
        pendientes_total: fin.fiadosPending,
        cuenta_pendientes: fin.fiados.filter((f) => !f.settled).length,
      },
      stock_critico: inv.lowStock.slice(0, 8).map((p) => ({
        nombre: p.name,
        unidades: p.stock,
      })),
      total_productos: inv.productCount,
    }),
    [fin.todayIncome, fin.todayExpense, fin.todayNet, fin.monthIncome, fin.monthExpense, fin.monthNet, fin.fiadosPending, fin.fiados, inv.lowStock, inv.productCount],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            threadId: activeThreadId,
            context: liveContext,
          },
        }),
      }),
    [activeThreadId, liveContext],
  );

  const initialMessages = useMemo(
    () => (threadMessages ? rowsToUIMessages(threadMessages.messages as DbMessageRow[]) : []),
    [threadMessages],
  );

  const chatKey = activeThreadId ?? "new";
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    id: chatKey,
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("La IA no pudo responder. Intenta de nuevo.");
    },
    onFinish: async () => {
      // Server may have created a thread; reflect that in the list
      qc.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });

  // Adopt initial messages when thread changes
  useEffect(() => {
    if (initialMessages.length) setMessages(initialMessages);
    else setMessages([]);
  }, [chatKey, initialMessages, setMessages]);

  // Adopt threadId from response header (when a new thread was auto-created)
  useEffect(() => {
    if (activeThreadId || !bearer) return;
    if (messages.length === 0 || status !== "ready") return;
    // refresh thread list to pick up the new one
    qc.invalidateQueries({ queryKey: ["chat-threads"] });
  }, [messages.length, status, activeThreadId, bearer, qc]);

  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoMode = useRef<"foto" | "escanear">("foto");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus textarea on mount / after send / after thread switch
  useEffect(() => {
    taRef.current?.focus();
  }, [chatKey, status]);

  useEffect(() => {
    if (status === "streaming" || status === "submitted") return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, status]);

  const isLoading = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t || isLoading) return;
    setInput("");
    sendMessage({ text: t });
  };

  const handleFeature = (f: typeof FEATURES[number]) => {
    if (f.key === "foto" || f.key === "escanear") {
      photoMode.current = f.key;
      fileInputRef.current?.click();
      return;
    }
    if (f.key === "voz") {
      startVoiceDictation();
      return;
    }
    if (f.prompt) send(f.prompt);
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const intent =
      photoMode.current === "escanear"
        ? "Te paso una foto de un producto. Identifícalo, dame nombre, una categoría sugerida y un precio estimado en soles. Devuelve la propuesta lista para añadir al stock."
        : "Te paso una foto de mi libreta de ventas/gastos. Extrae cada línea con: tipo (ingreso/egreso), monto, descripción y fecha si aparece. Devuelve también el total.";
    sendMessage({
      role: "user",
      parts: [
        { type: "text", text: intent },
        { type: "file", url: dataUrl, mediaType: file.type },
      ],
    });
  };

  // Voice via WebSpeech API (browser-specific, untyped)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const startVoiceDictation = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Tu navegador no soporta dictado por voz.");
      return;
    }
    const rec = new SR();
    rec.lang = "es-PE";
    rec.continuous = false;
    rec.interimResults = true;
    let finalText = "";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput(finalText + interim);
    };
    rec.onend = () => {
      setListening(false);
      if (finalText.trim()) send(finalText.trim());
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };
  const stopVoiceDictation = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const onNewThread = async () => {
    setActiveThreadId(null);
    setMessages([]);
    setHistoryOpen(false);
    setTimeout(() => taRef.current?.focus(), 50);
  };

  const onDeleteThread = async (id: string) => {
    await deleteFn({ data: { id } });
    if (activeThreadId === id) {
      setActiveThreadId(null);
      setMessages([]);
    }
    qc.invalidateQueries({ queryKey: ["chat-threads"] });
  };

  const onPickThread = (id: string) => {
    setActiveThreadId(id);
    setHistoryOpen(false);
  };

  // Orb intensity reacts to chat state
  const orbIntensity = isLoading ? 1.0 : empty ? 0.35 : 0.55;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  return (
    <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden">
      {/* hidden file input for photo features */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {/* HEADER */}
      <div className="relative z-30 px-[20px] pt-[22px] pb-[10px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="h-[36px] w-[36px] rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          aria-label="Historial"
        >
          <History className="h-[15px] w-[15px] text-white/70" strokeWidth={1.8} />
        </button>
        <div className="text-center min-h-[36px] flex flex-col justify-center">
          {empty ? (
            <>
              <div className="font-['Geist'] text-[10px] font-medium uppercase tracking-[1.8px] text-white/35">
                Asistente
              </div>
              <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.4px] leading-none mt-[3px]">
                soc<span className="text-white/55">IA</span>
              </div>
            </>
          ) : (
            <div className="h-[36px] w-[36px]" />
          )}
        </div>
        <button
          type="button"
          onClick={onNewThread}
          className="h-[36px] w-[36px] rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          aria-label="Nueva conversación"
        >
          <Plus className="h-[16px] w-[16px] text-white/70" strokeWidth={1.8} />
        </button>
      </div>

      {/* MAIN AREA */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* GREETING — top, completely separate from the orb */}
        <AnimatePresence>
          {empty && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 px-[24px] pt-[24px] text-center pointer-events-none"
            >
              <div className="font-['Bai_Jamjuree'] text-[32px] font-semibold text-white tracking-[-0.7px] leading-[1.05]">
                {greeting},<br />Alberto.
              </div>
              <div className="mt-[14px] font-['Geist'] text-[13.5px] text-white/45 max-w-[300px] mx-auto leading-[1.45]">
                Soy socIA. Puedo analizar, registrar y aconsejarte sobre tu negocio.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO-STYLE BACKGROUND — subtle grid + giant bottom dome with bright rim */}
        <AnimatePresence>
          {empty && (
            <motion.div
              key="hero-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            >
              {/* Grid background */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                  backgroundSize: "64px 64px",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at 50% 30%, black 0%, black 35%, transparent 75%)",
                  maskImage:
                    "radial-gradient(ellipse at 50% 30%, black 0%, black 35%, transparent 75%)",
                }}
              />

              {/* Atmospheric blue glow halo */}
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                style={{
                  bottom: "-10%",
                  width: "160%",
                  aspectRatio: "1 / 1",
                  background:
                    "radial-gradient(circle at 50% 35%, rgba(99,140,255,0.55) 0%, rgba(70,100,230,0.35) 18%, rgba(120,80,220,0.22) 35%, rgba(30,50,160,0.12) 55%, transparent 72%)",
                  filter: "blur(80px)",
                  opacity: 0.9,
                }}
              />

              {/* Giant dome — raised, multi-tone blue */}
              <div
                aria-hidden
                className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
                style={{
                  bottom: "-40%",
                  width: "150%",
                  aspectRatio: "1 / 1",
                  background:
                    "radial-gradient(circle at 50% 28%, #1a2a6c 0%, #0d1850 18%, #070d35 38%, #03061c 60%, #000 80%)",
                  boxShadow:
                    "0 -1px 0 0.5px rgba(180,200,255,0.9), 0 -22px 100px -10px rgba(120,160,255,0.55), 0 -80px 200px -40px rgba(140,110,255,0.35)",
                }}
              />

              {/* Soft pulsing glow above the rim */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  bottom: "30%",
                  width: "140%",
                  height: "45%",
                  background:
                    "radial-gradient(ellipse at 50% 100%, rgba(160,190,255,0.45) 0%, rgba(130,100,230,0.22) 28%, rgba(80,60,200,0.1) 50%, transparent 72%)",
                  filter: "blur(50px)",
                }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Top vignette */}
              <div
                className="absolute inset-x-0 top-0 h-[40%] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>




        {/* MINI ORB in header during chat */}
        <AnimatePresence>
          {!empty && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 -translate-x-1/2 top-[14px] z-30 pointer-events-none"
            >
              <ShaderOrb size={56} intensity={orbIntensity} />
            </motion.div>
          )}
        </AnimatePresence>


        {/* MESSAGES — full-screen chat once started (ChatGPT style) */}
        {!empty && (
          <div
            ref={scrollRef}
            className="relative z-10 flex-1 overflow-y-auto px-[20px] pt-[80px] pb-[180px] flex flex-col gap-[16px]"
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {isLoading && status === "submitted" && (
              <div className="self-start flex items-center gap-[6px] px-[2px] py-[6px]">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-[6px] w-[6px] rounded-full bg-white/50"
                    animate={{ opacity: [0.25, 0.95, 0.25] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOTTOM CONTROL ZONE (composer + cards) */}
        <div
          className={`absolute left-0 right-0 z-20 ${
            empty ? "top-[62%]" : "bottom-0 pb-[110px]"
          }`}
        >
          {/* gradient mask so messages fade behind the controls */}
          {!empty && (
            <div className="pointer-events-none absolute inset-x-0 -top-[60px] h-[60px] bg-gradient-to-b from-transparent to-black" />
          )}

          {/* CHAT BAR */}
          <div className="px-[18px]">
            <div
              className="flex items-end gap-[6px] min-h-[54px] pl-[18px] pr-[6px] py-[6px] rounded-[28px] backdrop-blur-xl"
              style={{
                background: "rgba(8,12,26,0.72)",
                border: "1px solid rgba(140,170,255,0.16)",
                boxShadow:
                  "0 12px 44px rgba(30,70,200,0.28), inset 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            >
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 140) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={listening ? "Escuchando…" : "Pregúntame algo…"}
                className="flex-1 bg-transparent outline-none resize-none font-['Geist'] text-[14.5px] text-white placeholder:text-white/35 py-[10px] leading-[1.4]"
                style={{ maxHeight: 140 }}
              />
              {listening ? (
                <button
                  type="button"
                  onClick={stopVoiceDictation}
                  className="h-[42px] w-[42px] rounded-full bg-[#F87171] text-white flex items-center justify-center active:scale-95"
                  aria-label="Detener"
                >
                  <Square className="h-[14px] w-[14px]" fill="currentColor" />
                </button>
              ) : isLoading ? (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="h-[42px] w-[42px] rounded-full bg-white/15 text-white flex items-center justify-center active:scale-95"
                  aria-label="Detener"
                >
                  <Square className="h-[12px] w-[12px]" fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => send()}
                  disabled={!input.trim()}
                  className="h-[42px] w-[42px] rounded-full bg-white text-black flex items-center justify-center active:scale-95 disabled:opacity-25 transition-opacity"
                  aria-label="Enviar"
                >
                  <ArrowUp className="h-[17px] w-[17px]" strokeWidth={2.4} />
                </button>
              )}
            </div>
          </div>

          {/* FEATURE CARDS — only in empty state, below chat bar */}
          {empty && (
            <div className="mt-[14px] pl-[18px]">
              <div className="flex gap-[10px] overflow-x-auto no-scrollbar pr-[18px] pb-[2px]">
                {FEATURES.map((f) => (
                  <FeatureCard
                    key={f.key}
                    icon={f.icon}
                    title={f.title}
                    subtitle={f.subtitle}
                    onClick={() => handleFeature(f)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* THREAD HISTORY SHEET */}
      <AnimatePresence>
        {historyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setHistoryOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 w-[82%] max-w-[340px] bg-black flex flex-col"
              style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="px-[20px] pt-[24px] pb-[14px] flex items-center justify-between">
                <div className="font-['Bai_Jamjuree'] text-[16px] font-semibold text-white">
                  Conversaciones
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="h-[32px] w-[32px] rounded-full flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X className="h-[16px] w-[16px] text-white/60" />
                </button>
              </div>
              <button
                type="button"
                onClick={onNewThread}
                className="mx-[16px] mb-[12px] h-[44px] rounded-[14px] flex items-center justify-center gap-[8px] font-['Geist'] text-[13px] text-white"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <Plus className="h-[14px] w-[14px]" />
                Nueva conversación
              </button>
              <div className="flex-1 overflow-y-auto px-[10px] pb-[20px]">
                {threads.length === 0 && (
                  <div className="text-center text-white/35 font-['Geist'] text-[12px] py-[40px]">
                    Aún no hay conversaciones guardadas.
                  </div>
                )}
                {threads.map((t) => (
                  <div
                    key={t.id}
                    className={`group flex items-center gap-[6px] mb-[2px] rounded-[12px] ${
                      activeThreadId === t.id ? "bg-white/06" : ""
                    }`}
                    style={
                      activeThreadId === t.id
                        ? { background: "rgba(255,255,255,0.06)" }
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      onClick={() => onPickThread(t.id)}
                      className="flex-1 text-left px-[12px] py-[12px] font-['Geist'] text-[13px] text-white/85 truncate"
                    >
                      {t.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteThread(t.id)}
                      className="h-[32px] w-[32px] rounded-full flex items-center justify-center mr-[4px] text-white/30 hover:text-[#F87171]"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-[13px] w-[13px]" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof Camera;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 w-[148px] h-[112px] rounded-[20px] p-[14px] flex flex-col justify-between text-left active:scale-[0.97] transition-transform"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="h-[32px] w-[32px] rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <Icon className="h-[15px] w-[15px] text-white/85" strokeWidth={1.7} />
      </div>
      <div>
        <div className="font-['Geist'] text-[12.5px] font-medium text-white leading-[1.2]">
          {title}
        </div>
        <div className="font-['Geist'] text-[10.5px] text-white/40 leading-[1.3] mt-[3px]">
          {subtitle}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === "user";
  const text = uiMessageText(msg);
  const files = (msg.parts ?? []).filter(
    (p): p is { type: "file"; url: string; mediaType: string } => p.type === "file",
  );

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="max-w-[82%] self-end flex flex-col items-end gap-[6px]"
      >
        {files.map((f, i) => (
          <img
            key={i}
            src={f.url}
            alt="adjunto"
            className="max-w-[200px] rounded-[14px]"
          />
        ))}
        {text && (
          <div className="px-[16px] py-[10px] rounded-[20px] bg-white text-black font-['Geist'] text-[14px] leading-[1.45]">
            {text}
          </div>
        )}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="max-w-[92%] self-start font-['Geist'] text-[14.5px] text-white/90 leading-[1.6] px-[2px] prose-socia"
    >
      {text ? (
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="m-0 mb-[6px] last:mb-0">{children}</p>,
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="my-[6px] pl-[16px] list-disc marker:text-white/40">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-[6px] pl-[18px] list-decimal marker:text-white/40">{children}</ol>
            ),
            code: ({ children }) => (
              <code className="px-[5px] py-[1px] rounded bg-white/8 text-[13px] font-['Geist']">
                {children}
              </code>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      ) : (
        <Loader2 className="h-[14px] w-[14px] animate-spin text-white/50" />
      )}
    </motion.div>
  );
}

function fileToDataUrl(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(f);
  });
}
