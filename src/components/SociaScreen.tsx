import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowUp,
  Camera,
  Mic,
  Search,
  ScanLine,
  TrendingUp,
  Plus,
  History,
  Trash2,
  X,
  Square,
  Loader2,
  ChevronRight,
  ArrowRight,
  Settings2,
  AudioLines,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCw,
  Share2,
  MoreHorizontal,
  Volume2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

import { useInventory } from "@/data/inventory";
import { useFinance } from "@/data/finance";
import {
  listThreads,
  createThread,
  deleteThread,
  getThreadMessages,
} from "@/lib/api/chat.functions";

type FeatureKey = "foto" | "voz" | "analisis" | "mercado" | "escanear";

const FEATURES: Array<{
  key: FeatureKey;
  icon: typeof Camera;
  title: string;
  subtitle: string;
  prompt?: string;
}> = [
  {
    key: "foto",
    icon: Camera,
    title: "Foto a libreta",
    subtitle: "Saca una foto y extraigo ventas y gastos al instante",
  },
  {
    key: "voz",
    icon: Mic,
    title: "Dictado por voz",
    subtitle: "Háblame con naturalidad y lo registro por ti",
  },
  {
    key: "analisis",
    icon: TrendingUp,
    title: "Análisis del día",
    subtitle: "Tu resumen de ventas, margen y alertas en segundos",
    prompt:
      "Hazme un análisis completo de cómo va mi negocio hoy: ventas, gastos, fiados y stock crítico. Dame insights y 3 sugerencias accionables.",
  },
  {
    key: "mercado",
    icon: Search,
    title: "Investigación",
    subtitle: "Precios y competencia del mercado",
    prompt:
      "Necesito que me ayudes a investigar precios de mercado para los productos top de mi negocio. ¿Qué información necesitas de mí?",
  },
  {
    key: "escanear",
    icon: ScanLine,
    title: "Escanear producto",
    subtitle: "Foto al producto y lo añado al stock",
  },
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
  const { profile } = useAuth();
  const firstName = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";


  // ---------- threads ----------
  const listFn = useServerFn(listThreads);
  const _createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);
  const getMessagesFn = useServerFn(getThreadMessages);
  void _createFn;

  const { data: threadsData } = useQuery({
    queryKey: ["chat-threads"],
    queryFn: () => listFn(),
  });
  const threads = threadsData?.threads ?? [];

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [voiceCfgOpen, setVoiceCfgOpen] = useState(false);
  const [voiceCfg, setVoiceCfg] = useState<VoiceConfig>(() => loadVoiceCfg());
  useEffect(() => {
    try { localStorage.setItem(VOICE_CFG_KEY, JSON.stringify(voiceCfg)); } catch {}
  }, [voiceCfg]);

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

  const liveContext = useMemo(
    () => ({
      hoy: { ventas: fin.todayIncome, gastos: fin.todayExpense, neto: fin.todayNet },
      mes: { ventas: fin.monthIncome, gastos: fin.monthExpense, neto: fin.monthNet },
      fiados: {
        pendientes_total: fin.fiadosPending,
        cuenta_pendientes: fin.fiados.filter((f) => !f.settled).length,
      },
      stock_critico: inv.lowStock.slice(0, 8).map((p) => ({
        nombre: p.name,
        unidades: p.stock,
      })),
      total_productos: inv.productCount,
      voz_ia: voiceCfg,
    }),
    [fin.todayIncome, fin.todayExpense, fin.todayNet, fin.monthIncome, fin.monthExpense, fin.monthNet, fin.fiadosPending, fin.fiados, inv.lowStock, inv.productCount, voiceCfg],
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
          body: { ...body, messages, threadId: activeThreadId, context: liveContext },
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
      qc.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });

  useEffect(() => {
    if (initialMessages.length) setMessages(initialMessages);
    else setMessages([]);
  }, [chatKey, initialMessages, setMessages]);

  useEffect(() => {
    if (activeThreadId || !bearer) return;
    if (messages.length === 0 || status !== "ready") return;
    qc.invalidateQueries({ queryKey: ["chat-threads"] });
  }, [messages.length, status, activeThreadId, bearer, qc]);

  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoMode = useRef<"foto" | "escanear">("foto");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();


  // Orb tweak values from design spec (HTML export)
  const orbStyle = {
    "--orb-peak": "39%",
    "--orb-bottom": "74%",
    "--orb-size": "750px",
    "--orb-intensity": "1.1",
    "--orb-haze": "1.2",
    "--greet-top": "25.4dvh",
    "--stack-top": "52.6dvh",
    "--c-core": "220, 235, 255",
    "--c-mid": "0, 120, 255",
    "--c-deep": "0, 60, 180",
  } as React.CSSProperties;

  return (
    <div
      className="socia-screen relative w-full h-[100dvh] flex flex-col overflow-hidden bg-black"
      style={orbStyle}
    >
      <style>{SOCIA_CSS}</style>

      {/* hidden file input */}
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

      {/* ORB BG (only in empty state) */}
      {empty && (
        <>
          <div className="orb-layer">
            <div className="orb-ambient" />
            <div className="orb" />
            <div className="orb-rim" />
          </div>
          <div className="fade-top" />
          <div className="fade-bottom" />
          <div className="grain" />
        </>
      )}

      {/* UI */}
      <div className="relative z-30 flex-1 flex flex-col min-h-0">
        <div className="statusbar" />

        {/* TOP BAR */}
        <div className="topbar flex items-center justify-between px-[22px] pt-[14px]">
          <button
            type="button"
            onClick={() => setVoiceCfgOpen(true)}
            className="circ-btn small"
            aria-label="Configurar voz IA"
          >
            <Settings2 className="h-[15px] w-[15px]" strokeWidth={1.7} />
          </button>
          <div className="text-center leading-[1.1]">
            <div className="font-['Geist'] text-[10px] font-medium uppercase tracking-[1.8px] text-white/35">
              Asistente
            </div>
            <div className="font-['Bai_Jamjuree'] text-[19px] font-semibold text-white tracking-[-0.4px] mt-[3px]">
              soc<span className="text-white/40 font-semibold">IA</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="circ-btn"
            aria-label="Historial"
          >
            <History className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
        </div>

        {/* EMPTY STATE — exact replication of HTML export */}
        {empty ? (
          <div className="empty-ui">
            <div className="greet">
              <h1>{`${greeting},\u00A0${firstName}.`}</h1>
              <DynamicSubtitle />
            </div>

            <div className="midstack">
              <div className="composer">
                <ChatBar
                  taRef={taRef}
                  input={input}
                  setInput={setInput}
                  send={send}
                  isLoading={isLoading}
                  listening={listening}
                  stop={stop}
                  stopVoiceDictation={stopVoiceDictation}
                  startVoiceDictation={startVoiceDictation}
                  onPlus={() => { photoMode.current = "foto"; fileInputRef.current?.click(); }}
                />
              </div>

              <div className="cards-head">
                <span className="lbl">Atajos rápidos</span>
                <span className="swipe">
                  Desliza
                  <ArrowRight className="h-[13px] w-[13px]" strokeWidth={1.7} />
                </span>
              </div>

              <div className="cards">
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
          </div>
        ) : (
          /* CHAT STATE — full screen messages + bottom composer */
          <>
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto px-[18px] pt-[18px] pb-[260px] flex flex-col gap-[18px]"
            >
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                const lastUser = [...messages].slice(0, i).reverse().find((mm) => mm.role === "user");
                return (
                  <MessageBubble
                    key={m.id}
                    msg={m}
                    isLast={isLast}
                    isStreaming={isLoading && isLast && m.role === "assistant"}
                    onRegenerate={
                      isLast && m.role === "assistant" && !isLoading && lastUser
                        ? () => send(uiMessageText(lastUser))
                        : undefined
                    }
                  />
                );
              })}
              {isLoading && status === "submitted" && <TypingIndicator />}
            </div>
            <div className="absolute left-0 right-0 bottom-0 pb-[110px] z-20">
              <div className="pointer-events-none absolute inset-x-0 -top-[60px] h-[60px] bg-gradient-to-b from-transparent to-black" />
              <div className="px-[18px]">
                <ChatBar
                  taRef={taRef}
                  input={input}
                  setInput={setInput}
                  send={send}
                  isLoading={isLoading}
                  listening={listening}
                  stop={stop}
                  stopVoiceDictation={stopVoiceDictation}
                  startVoiceDictation={startVoiceDictation}
                  onPlus={() => { photoMode.current = "foto"; fileInputRef.current?.click(); }}
                />
              </div>
            </div>
          </>
        )}
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
                    className="group flex items-center gap-[6px] mb-[2px] rounded-[12px]"
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

      {/* VOICE CONFIG SHEET */}
      <VoiceConfigSheet
        open={voiceCfgOpen}
        cfg={voiceCfg}
        onChange={setVoiceCfg}
        onClose={() => setVoiceCfgOpen(false)}
      />
    </div>
  );
}

function ChatBar({
  taRef,
  input,
  setInput,
  send,
  isLoading,
  listening,
  stop,
  stopVoiceDictation,
  startVoiceDictation,
  onPlus,
}: {
  taRef: React.RefObject<HTMLTextAreaElement | null>;
  input: string;
  setInput: (v: string) => void;
  send: (t?: string) => void;
  isLoading: boolean;
  listening: boolean;
  stop: () => void;
  stopVoiceDictation: () => void;
  startVoiceDictation: () => void;
  onPlus: () => void;
}) {
  const hasText = input.trim().length > 0;
  return (
    <div className="chatbar">
      <button
        type="button"
        onClick={onPlus}
        className="plus-btn"
        aria-label="Adjuntar"
      >
        <Plus className="h-[20px] w-[20px]" strokeWidth={1.8} />
      </button>
      <textarea
        ref={taRef}
        rows={1}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          const el = e.target as HTMLTextAreaElement;
          el.style.height = "auto";
          el.style.height = Math.min(el.scrollHeight, 120) + "px";
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={listening ? "Escuchando…" : "Pregúntame algo…"}
        className="chatbar-ta"
      />
      {listening ? (
        <button type="button" onClick={stopVoiceDictation} className="icon-btn" aria-label="Detener">
          <Square className="h-[16px] w-[16px]" fill="currentColor" />
        </button>
      ) : (
        <button type="button" onClick={startVoiceDictation} className="icon-btn" aria-label="Voz">
          <Mic className="h-[19px] w-[19px]" strokeWidth={1.7} />
        </button>
      )}
      {isLoading ? (
        <button type="button" onClick={stop} className="pill-btn send" aria-label="Detener">
          <Square className="h-[14px] w-[14px]" fill="currentColor" />
        </button>
      ) : hasText ? (
        <button
          type="button"
          onClick={() => send()}
          className="pill-btn send"
          aria-label="Enviar"
        >
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      ) : (
        <button
          type="button"
          onClick={startVoiceDictation}
          className="pill-btn voice-mode"
          aria-label="Modo voz"
        >
          <AudioLines className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      )}
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
    <button type="button" onClick={onClick} className="card">
      <div className="row">
        <div className="ic">
          <Icon className="h-[21px] w-[21px]" strokeWidth={1.7} />
        </div>
        <div className="chev">
          <ChevronRight className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </div>
      </div>
      <div className="txt">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </button>
  );
}

/**
 * SocIA logo: blue energy orb with concentric inset shadows.
 * Spins when `spinning` (model is generating), static otherwise.
 * Inspired by the "ai-loader" component (without the text).
 */
function AssistantAvatar({
  size = 28,
  spinning = false,
}: {
  size?: number;
  spinning?: boolean;
}) {
  return (
    <div
      className="flex-none relative rounded-full socia-orb"
      data-spinning={spinning ? "true" : "false"}
      style={{
        width: size,
        height: size,
        // Layered radial bg + inset blue glows mimic the loader's depth
        background:
          "radial-gradient(circle at 32% 28%, #cfe6ff 0%, #4dc8fd 22%, #1c7cff 48%, #003fc0 78%, #061535 100%)",
      }}
      aria-hidden
    />
  );
}

/**
 * Claude-style "doing now" status. Rotates through phrases adapted
 * to the bodega/business context so it doesn't feel generic.
 */
const THINKING_PHRASES = [
  "Pensando",
  "Revisando tus ventas del día",
  "Analizando tu stock",
  "Cruzando datos del negocio",
  "Calculando márgenes",
  "Buscando patrones",
  "Redactando respuesta",
];

function TypingIndicator() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % THINKING_PHRASES.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="self-start flex items-center gap-[10px] mt-[-2px]">
      <AssistantAvatar size={26} spinning />
      <div className="flex items-baseline gap-[6px]">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className="font-['Geist'] text-[13px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,.4), rgba(255,255,255,1), rgba(255,255,255,.4))",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "socShimmer 2.2s linear infinite",
          }}
        >
          {THINKING_PHRASES[idx]}
        </motion.span>
        <span className="text-white/40 font-['Geist'] text-[13px]">…</span>
      </div>
    </div>
  );
}

/** Small icon action button used in the message action bar. */
function MsgAction({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: typeof Copy;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="h-[28px] w-[28px] rounded-[8px] flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.06] transition-colors"
      style={active ? { color: "#fff", background: "rgba(255,255,255,.08)" } : undefined}
    >
      <Icon className="h-[14px] w-[14px]" strokeWidth={1.7} />
    </button>
  );
}

/** Chat-app style action row (copy / like / dislike / regenerate / TTS). */
function MessageActions({
  text,
  onRegenerate,
  variant,
}: {
  text: string;
  onRegenerate?: () => void;
  variant: "user" | "assistant";
}) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "es-PE";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <div
      className={`flex items-center gap-[2px] ${
        variant === "user" ? "justify-end opacity-0 group-hover:opacity-100" : "opacity-80"
      } transition-opacity`}
    >
      <MsgAction icon={copied ? Check : Copy} label={copied ? "Copiado" : "Copiar"} onClick={copy} />
      {variant === "assistant" && (
        <>
          <MsgAction icon={Volume2} label="Leer en voz alta" onClick={speak} />
          <MsgAction
            icon={ThumbsUp}
            label="Buena respuesta"
            active={vote === "up"}
            onClick={() => setVote(vote === "up" ? null : "up")}
          />
          <MsgAction
            icon={ThumbsDown}
            label="No me sirvió"
            active={vote === "down"}
            onClick={() => setVote(vote === "down" ? null : "down")}
          />
          {onRegenerate && (
            <MsgAction icon={RotateCw} label="Regenerar" onClick={onRegenerate} />
          )}
          <MsgAction icon={Share2} label="Compartir" />
          <MsgAction icon={MoreHorizontal} label="Más" />
        </>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  isStreaming = false,
  onRegenerate,
}: {
  msg: UIMessage;
  isLast?: boolean;
  isStreaming?: boolean;
  onRegenerate?: () => void;
}) {
  const isUser = msg.role === "user";
  const text = uiMessageText(msg);
  const files = (msg.parts ?? []).filter(
    (p): p is { type: "file"; url: string; mediaType: string } => p.type === "file",
  );

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.3, 1] }}
        className="max-w-[84%] self-end flex flex-col items-end gap-[6px] group"
      >
        {files.map((f, i) => (
          <img
            key={i}
            src={f.url}
            alt="adjunto"
            className="max-w-[220px] rounded-[16px] border border-white/10"
          />
        ))}
        {text && (
          <div
            className="px-[16px] py-[11px] rounded-[22px] rounded-br-[8px] font-['Geist'] text-[14px] leading-[1.45] text-white"
            style={{
              background: "linear-gradient(135deg, #0a2a6b 0%, #1849c7 55%, #1c7cff 100%)",
              border: "1px solid rgba(120,190,255,.22)",
              boxShadow:
                "0 6px 22px -10px rgba(28,124,255,.6), inset 0 1px 0 rgba(255,255,255,.14)",
            }}
          >
            {text}
          </div>
        )}
        {text && (
          <div className="mt-[2px] w-full">
            <MessageActions text={text} variant="user" />
          </div>
        )}
      </motion.div>
    );
  }



  // Group parts: render text+tools inline in order
  const parts = msg.parts ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
      className="max-w-[94%] self-start flex gap-[10px] group"
    >
      <div className="pt-[2px]">
        <AssistantAvatar spinning={isStreaming} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[8px] mb-[6px]">
          <span className="font-['Bai_Jamjuree'] text-[12px] font-semibold tracking-[-.2px] text-white/85">
            socIA
          </span>
          <span className="h-[3px] w-[3px] rounded-full bg-white/20" />
          <span className="font-['Geist'] text-[10.5px] text-white/35 uppercase tracking-[.8px]">
            asistente
          </span>
        </div>

        {/* Render parts in order — text blocks get the gray bubble,
            tool calls render as their own card */}
        <div className="flex flex-col gap-[8px]">
          {parts.map((p, i) => {
            if (p.type === "text") {
              const t = (p as { text: string }).text;
              if (!t) return null;
              return (
                <div
                  key={i}
                  className="assistant-bubble font-['Geist'] text-[14.5px] text-white/92 leading-[1.6] prose-socia select-text"
                  style={{ userSelect: "text" }}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="m-0 mb-[8px] last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="text-white font-semibold">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="my-[8px] pl-[18px] list-disc marker:text-white/35 space-y-[3px]">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="my-[8px] pl-[20px] list-decimal marker:text-white/35 space-y-[3px]">
                          {children}
                        </ol>
                      ),
                      code: ({ children }) => (
                        <code className="px-[6px] py-[1px] rounded-[6px] bg-white/[0.08] border border-white/[0.06] text-[12.5px] text-white/90">
                          {children}
                        </code>
                      ),
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#7dc4ff] underline underline-offset-2 decoration-white/20 hover:decoration-[#7dc4ff]"
                        >
                          {children}
                        </a>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-white/15 pl-[10px] my-[6px] text-white/70 italic">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {t}
                  </ReactMarkdown>
                  {isStreaming && i === parts.length - 1 && (
                    <span
                      className="inline-block w-[7px] h-[14px] align-[-2px] ml-[2px] rounded-[1px] bg-white/70"
                      style={{ animation: "socCaret 1s steps(1) infinite" }}
                    />
                  )}
                </div>
              );
            }
            if (typeof p.type === "string" && p.type.startsWith("tool-")) {
              return <ToolPart key={i} part={p as ToolPartShape} />;
            }
            return null;
          })}
          {!text && isStreaming && (
            <span className="inline-flex items-center gap-[6px] text-white/45 text-[13px]">
              <Loader2 className="h-[12px] w-[12px] animate-spin" />
              redactando…
            </span>
          )}
        </div>

        {!isStreaming && text && (
          <div className="mt-[8px]">
            <MessageActions text={text} variant="assistant" onRegenerate={onRegenerate} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

type ToolPartShape = {
  type: string; // "tool-xxx"
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const TOOL_LABELS: Record<string, { label: string; icon: typeof Search }> = {
  "tool-consultarStock": { label: "Consultando stock", icon: Search },
  "tool-actualizarStock": { label: "Actualizando stock", icon: ScanLine },
  "tool-registrarVenta": { label: "Registrando venta", icon: TrendingUp },
  "tool-registrarGasto": { label: "Registrando gasto", icon: TrendingUp },
  "tool-registrarFiado": { label: "Anotando fiado", icon: TrendingUp },
  "tool-marcarFiadoPagado": { label: "Marcando fiado pagado", icon: Check },
  "tool-analizarNegocio": { label: "Analizando tu negocio", icon: TrendingUp },
};

function ToolPart({ part }: { part: ToolPartShape }) {
  const meta = TOOL_LABELS[part.type] ?? { label: part.type.replace("tool-", ""), icon: Loader2 };
  const Icon = meta.icon;
  const running = part.state === "input-streaming" || part.state === "input-available";
  const ok = part.state === "output-available";
  const err = part.state === "output-error";
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-[14px] px-[12px] py-[10px] text-[12.5px] font-['Geist']"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-[8px] text-left"
      >
        <span
          className="h-[22px] w-[22px] rounded-[7px] grid place-items-center flex-none"
          style={{
            background: ok ? "rgba(74,222,128,.14)" : err ? "rgba(248,113,113,.14)" : "rgba(125,196,255,.14)",
            color: ok ? "#4ADE80" : err ? "#F87171" : "#7dc4ff",
          }}
        >
          {running ? <Loader2 className="h-[12px] w-[12px] animate-spin" /> : <Icon className="h-[12px] w-[12px]" />}
        </span>
        <span className="text-white/80 flex-1 truncate">
          {meta.label}
          {running && "…"}
        </span>
        <ChevronRight
          className="h-[13px] w-[13px] text-white/35 transition-transform"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="mt-[8px] pt-[8px] border-t border-white/[0.06] space-y-[6px]">
          {part.input !== undefined && (
            <pre className="text-[11px] text-white/55 whitespace-pre-wrap break-words">
              {JSON.stringify(part.input, null, 2)}
            </pre>
          )}
          {ok && part.output !== undefined && (
            <pre className="text-[11px] text-white/70 whitespace-pre-wrap break-words">
              {typeof part.output === "string" ? part.output : JSON.stringify(part.output, null, 2)}
            </pre>
          )}
          {err && (
            <div className="text-[11px] text-[#F87171]">{part.errorText ?? "Error en la herramienta"}</div>
          )}
        </div>
      )}
    </div>
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

const SUBTITLES = [
  "Soy socIA. Puedo analizar, registrar y aconsejarte.",
  "¿Sabías que registrar a diario mejora tu margen hasta 12%?",
  "Pídeme un resumen del día y te lo armo en segundos.",
  "Una foto a tu libreta y extraigo ventas y gastos al instante.",
  "Puedo detectar productos con stock crítico antes que se acaben.",
  "Háblame con naturalidad, te entiendo en peruano.",
  "Tus fiados pendientes están a un mensaje de distancia.",
  "Compárate con el mercado: precios, márgenes y oportunidades.",
];

function DynamicSubtitle() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const full = SUBTITLES[idx];

  useEffect(() => {
    setTyped("");
    let i = 0;
    const typer = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(typer);
    }, 28);
    const next = setTimeout(() => {
      setIdx((p) => (p + 1) % SUBTITLES.length);
    }, 5000);
    return () => {
      clearInterval(typer);
      clearTimeout(next);
    };
  }, [idx, full]);

  return (
    <p aria-live="polite">
      {typed}
      <span className="caret" />
    </p>
  );
}


// ===== Voice Config =====
type VoiceConfig = {
  tone: "amigable" | "formal" | "peruano" | "directo";
  length: "corto" | "normal" | "detallado";
  emoji: boolean;
  proactivo: boolean;
  formato: "texto" | "listas" | "mixto";
};
const VOICE_CFG_KEY = "trax.socia.voice.v1";
const DEFAULT_VOICE: VoiceConfig = {
  tone: "amigable",
  length: "normal",
  emoji: true,
  proactivo: true,
  formato: "mixto",
};
function loadVoiceCfg(): VoiceConfig {
  if (typeof window === "undefined") return DEFAULT_VOICE;
  try {
    const raw = localStorage.getItem(VOICE_CFG_KEY);
    if (raw) return { ...DEFAULT_VOICE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_VOICE;
}

function VoiceConfigSheet({
  open,
  cfg,
  onChange,
  onClose,
}: {
  open: boolean;
  cfg: VoiceConfig;
  onChange: (c: VoiceConfig) => void;
  onClose: () => void;
}) {
  const set = <K extends keyof VoiceConfig>(k: K, v: VoiceConfig[K]) =>
    onChange({ ...cfg, [k]: v });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[61] mx-auto w-full max-w-[430px] rounded-t-[28px] bg-[#0b0b10] flex flex-col"
            style={{ border: "1px solid rgba(255,255,255,0.08)", maxHeight: "88dvh" }}
          >
            <div className="flex items-center justify-between px-[22px] pt-[20px] pb-[10px]">
              <div>
                <div className="font-['Geist'] text-[10px] uppercase tracking-[1.8px] text-white/35">
                  Asistente
                </div>
                <div className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.3px] mt-[2px]">
                  Cómo habla socIA
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-[34px] w-[34px] rounded-full flex items-center justify-center bg-white/5 border border-white/10"
                aria-label="Cerrar"
              >
                <X className="h-[15px] w-[15px] text-white/70" />
              </button>
            </div>
            <div className="overflow-y-auto px-[18px] pb-[28px] pt-[6px] flex flex-col gap-[18px]">
              <VCSection label="Tono">
                <VCRow
                  options={[
                    { v: "amigable", l: "Amigable" },
                    { v: "peruano", l: "Peruano casual" },
                    { v: "formal", l: "Formal" },
                    { v: "directo", l: "Directo" },
                  ]}
                  value={cfg.tone}
                  onPick={(v) => set("tone", v as VoiceConfig["tone"])}
                />
              </VCSection>
              <VCSection label="Largo de respuesta">
                <VCRow
                  options={[
                    { v: "corto", l: "Corto" },
                    { v: "normal", l: "Normal" },
                    { v: "detallado", l: "Detallado" },
                  ]}
                  value={cfg.length}
                  onPick={(v) => set("length", v as VoiceConfig["length"])}
                />
              </VCSection>
              <VCSection label="Formato">
                <VCRow
                  options={[
                    { v: "texto", l: "Solo texto" },
                    { v: "listas", l: "Con listas" },
                    { v: "mixto", l: "Mixto" },
                  ]}
                  value={cfg.formato}
                  onPick={(v) => set("formato", v as VoiceConfig["formato"])}
                />
              </VCSection>
              <VCToggle
                label="Usar emojis"
                hint="Pequeños emojis para hacer más cálida la conversación."
                value={cfg.emoji}
                onChange={(v) => set("emoji", v)}
              />
              <VCToggle
                label="Modo proactivo"
                hint="socIA te dará tips y avisos aunque no preguntes."
                value={cfg.proactivo}
                onChange={(v) => set("proactivo", v)}
              />
              <button
                type="button"
                onClick={onClose}
                className="mt-[6px] h-[50px] rounded-[16px] bg-white text-black font-['Geist'] text-[14px] font-semibold"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function VCSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="font-['Geist'] text-[10px] uppercase tracking-[1.6px] text-white/35 px-[2px]">
        {label}
      </div>
      {children}
    </div>
  );
}

function VCRow({
  options,
  value,
  onPick,
}: {
  options: { v: string; l: string }[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[8px]">
      {options.map((o) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onPick(o.v)}
            className="px-[14px] h-[38px] rounded-[12px] font-['Geist'] text-[13px] flex items-center gap-[6px] transition-colors"
            style={
              active
                ? { background: "#fff", color: "#0b0b10", borderColor: "#fff" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.10)" }
            }
          >
            {active && <Check className="h-[13px] w-[13px]" strokeWidth={2.4} />}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}

function VCToggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center justify-between gap-[14px] text-left rounded-[16px] p-[14px]"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex flex-col">
        <span className="font-['Geist'] text-[14px] text-white">{label}</span>
        {hint && <span className="font-['Geist'] text-[11.5px] text-white/45 mt-[2px]">{hint}</span>}
      </div>
      <span
        className="relative w-[42px] h-[24px] rounded-full transition-colors flex-none"
        style={{ background: value ? "#fff" : "rgba(255,255,255,0.14)" }}
      >
        <span
          className="absolute top-[2px] h-[20px] w-[20px] rounded-full transition-all"
          style={{
            left: value ? "20px" : "2px",
            background: value ? "#0b0b10" : "#fff",
          }}
        />
      </span>
    </button>
  );
}




const SOCIA_CSS = `
.socia-screen{ font-family:'Geist', system-ui, sans-serif; -webkit-font-smoothing:antialiased; }

.socia-screen .circ-btn{
  width:46px; height:46px; border-radius:50%;
  display:grid; place-items:center;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.09);
  color:#cfcfd4;
}
.socia-screen .circ-btn.small{
  width:38px; height:38px;
  background:rgba(255,255,255,.04);
  border-color:rgba(255,255,255,.08);
  color:rgba(255,255,255,.65);
}
.socia-screen .statusbar{ height:14px; flex:none; }
.socia-screen .topbar{ position:relative; z-index:6; flex:none; }

/* ORB */
.socia-screen .orb-layer{
  position:absolute; inset:0; z-index:1; pointer-events:none;
  transform-origin:50% var(--orb-peak);
  animation:socOrbBreathe 11s ease-in-out infinite alternate;
}
@keyframes socOrbBreathe{ from{transform:scale(1)} to{transform:scale(1.012)} }

.socia-screen .orb{
  position:absolute; left:50%; top:var(--orb-peak);
  width:var(--orb-size); height:var(--orb-size);
  transform:translateX(-50%); border-radius:50%;
  background:
    radial-gradient(circle closest-side at 50% 50%,
      transparent 0%,
      transparent 44%,
      rgba(var(--c-deep), calc(.10 * var(--orb-intensity))) 54%,
      rgba(var(--c-deep), calc(.26 * var(--orb-intensity))) 62%,
      rgba(var(--c-mid),  calc(.46 * var(--orb-intensity))) 70%,
      rgba(var(--c-mid),  calc(.72 * var(--orb-intensity))) 77%,
      rgba(var(--c-mid),  calc(.92 * var(--orb-intensity))) 82%,
      rgba(var(--c-core), calc(.98 * var(--orb-intensity))) 87%,
      rgba(var(--c-core), calc(1   * var(--orb-intensity))) 89%,
      rgba(var(--c-core), calc(.82 * var(--orb-intensity))) 91%,
      rgba(var(--c-mid),  calc(.36 * var(--orb-intensity))) 94%,
      rgba(var(--c-mid),  calc(.12 * var(--orb-intensity))) 97%,
      transparent 99.5%);
}
.socia-screen .orb-rim{
  position:absolute; left:50%; top:var(--orb-peak);
  width:var(--orb-size); height:var(--orb-size);
  transform:translateX(-50%); border-radius:50%;
  opacity:calc(.55 * var(--orb-intensity));
  background:
    radial-gradient(circle closest-side at 50% 50%,
      transparent 87.4%,
      rgba(var(--c-core), .50) 88.6%,
      rgba(var(--c-core), .90) 89.2%,
      rgba(var(--c-core), .50) 89.8%,
      transparent 91.2%);
}
.socia-screen .orb-ambient{
  position:absolute; inset:0; opacity:var(--orb-haze);
  background:radial-gradient(150% 48% at 50% 55%,
    rgba(var(--c-mid),  .22) 0%,
    rgba(var(--c-mid),  .13) 34%,
    rgba(var(--c-deep), .05) 62%,
    transparent 82%);
}

/* FADES */
.socia-screen .fade-top{
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background:linear-gradient(to bottom,
    #000 0%, #000 26%,
    rgba(0,0,0,.5) 38%,
    rgba(0,0,0,0) 45%);
}
.socia-screen .fade-bottom{
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background:linear-gradient(to bottom,
    rgba(0,0,0,0) calc(var(--orb-bottom) - 9%),
    rgba(0,0,0,.45) calc(var(--orb-bottom) - 3%),
    rgba(0,0,0,.9) var(--orb-bottom),
    #000 calc(var(--orb-bottom) + 4%));
}
.socia-screen .grain{
  position:absolute; inset:0; z-index:2; pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:160px 160px; mix-blend-mode:overlay; opacity:.35;
}

/* GREET */
.socia-screen .empty-ui{ position:fixed; inset:0; z-index:4; pointer-events:none; }
.socia-screen .greet{
  position:absolute; left:0; right:0; top:var(--greet-top);
  text-align:center; padding:0 24px;
  pointer-events:auto;
  -webkit-user-select:text; user-select:text;
}
.socia-screen .greet h1{
  font-family:'Bai Jamjuree', sans-serif;
  display:inline-block;
  font-size:clamp(32px, 8.4vw, 40px); font-weight:600; letter-spacing:-0.6px;
  line-height:1.12;
  white-space:nowrap;
  background:linear-gradient(180deg, #ffffff 58%, rgba(255,255,255,.72) 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  -webkit-user-select:text; user-select:text;
}
.socia-screen .greet p{
  font-size:13.5px; font-weight:400; line-height:1.5;
  color:rgba(255,255,255,.45);
  margin-top:12px; max-width:280px; margin-inline:auto;
  min-height:2.2em;
  -webkit-user-select:text; user-select:text;
}
.socia-screen .greet p .caret{
  display:inline-block; width:1.5px; height:1em;
  background:rgba(255,255,255,.55); margin-left:2px;
  vertical-align:-2px;
  animation:socCaret 1s steps(1) infinite;
}
@keyframes socCaret{ 50%{opacity:0} }


.socia-screen .midstack{ position:absolute; left:50%; right:auto; top:var(--stack-top); width:100%; max-width:430px; transform:translateX(-50%); z-index:5; padding-bottom:0; pointer-events:auto; }

/* COMPOSER */
.socia-screen .composer{ padding:0 18px; }
.socia-screen .chatbar{
  display:flex; align-items:center; gap:6px;
  min-height:60px; padding:6px 6px 6px 8px;
  border-radius:32px;
  background:rgba(14,16,24,.55);
  backdrop-filter: blur(36px) saturate(160%);
  -webkit-backdrop-filter: blur(36px) saturate(160%);
  border:1px solid rgba(255,255,255,.10);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 12px 40px -16px rgba(0,0,0,.85);
}
.socia-screen .chatbar-ta{
  flex:1; background:transparent; outline:none; resize:none;
  color:#fff; font-family:'Geist', system-ui, sans-serif;
  font-size:14.5px; line-height:1.4; padding:14px 4px;
  max-height:120px;
}
.socia-screen .chatbar-ta::placeholder{ color:rgba(255,255,255,.42) }

.socia-screen .plus-btn{
  width:42px; height:42px; border-radius:50%; flex:none;
  display:grid; place-items:center;
  background:transparent; color:rgba(255,255,255,.78);
  transition:transform .12s, background .15s;
}
.socia-screen .plus-btn:hover{ background:rgba(255,255,255,.06); }
.socia-screen .plus-btn:active{ transform:scale(.92) }

.socia-screen .icon-btn{
  width:38px; height:42px; flex:none;
  display:grid; place-items:center;
  background:transparent; color:rgba(255,255,255,.7);
  transition:transform .12s, color .15s;
}
.socia-screen .icon-btn:hover{ color:#fff; }
.socia-screen .icon-btn:active{ transform:scale(.9) }

.socia-screen .pill-btn{
  width:44px; height:44px; border-radius:50%; flex:none;
  display:grid; place-items:center;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.10);
  color:#e5e5ec; transition:transform .12s;
}
.socia-screen .pill-btn:active{ transform:scale(.94) }
.socia-screen .pill-btn.send{
  background:linear-gradient(180deg, #4dc8fd 0%, #1c7cff 60%, #003fc0 100%);
  border-color:rgba(120,190,255,.55); color:#fff;
  box-shadow: 0 6px 18px -6px rgba(28,124,255,.65), inset 0 1px 0 rgba(255,255,255,.25);
}
.socia-screen .pill-btn.voice-mode{
  background:linear-gradient(180deg, #ffffff, #e6efff);
  border-color:rgba(255,255,255,.5); color:#0a1f55;
}

/* assistant subtle bubble — like Gemini's grey card */
.socia-screen .assistant-bubble{
  background: rgba(255,255,255,0.045);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  border-top-left-radius: 6px;
  padding: 14px 16px;
}

/* CARDS — alineadas con la chatbar */
.socia-screen .cards-head{
  display:flex; align-items:center; gap:8px;
  padding:20px 22px 0;
}
.socia-screen .cards-head .lbl{
  font-size:11px; font-weight:600; letter-spacing:1.6px; text-transform:uppercase;
  color:rgba(255,255,255,.4);
}
.socia-screen .cards-head .swipe{
  margin-left:auto; font-size:11px; font-weight:500; letter-spacing:.2px;
  color:rgba(255,255,255,.28);
  display:flex; align-items:center; gap:4px;
}
.socia-screen .cards{
  display:flex; gap:13px; margin-top:12px;
  padding:4px 22px 4px;
  overflow-x:auto; scrollbar-width:none;
  scroll-snap-type:x mandatory;
}
.socia-screen .cards::-webkit-scrollbar{ display:none }
.socia-screen .card{
  position:relative; flex:0 0 184px; height:144px;
  border-radius:22px; padding:18px; overflow:hidden;
  scroll-snap-align:start;
  background:rgba(255,255,255,.045);
  border:1px solid rgba(255,255,255,.09);
  display:flex; flex-direction:column; justify-content:space-between;
  text-align:left; color:#fff; cursor:pointer;
  transition:transform .25s cubic-bezier(.2,.7,.3,1), background .25s, border-color .25s;
}
.socia-screen .card:hover{
  transform:translateY(-3px);
  background:rgba(255,255,255,.07);
  border-color:rgba(255,255,255,.16);
}
.socia-screen .card:active{ transform:scale(.97) }
.socia-screen .card .row{ display:flex; align-items:flex-start; justify-content:space-between; }
.socia-screen .card .ic{
  width:42px; height:42px; border-radius:13px;
  display:grid; place-items:center; color:#e9e7f5;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.10);
}
.socia-screen .card .chev{
  color:rgba(255,255,255,.3);
  transition:transform .25s, color .25s;
}
.socia-screen .card:hover .chev{ transform:translateX(2px); color:rgba(255,255,255,.55); }
.socia-screen .card h3{
  font-family:'Bai Jamjuree', sans-serif;
  font-size:15px; font-weight:600; color:#f4f3f8;
  margin-bottom:3px; letter-spacing:-.2px;
}
.socia-screen .card p{
  font-size:11px; font-weight:400; color:rgba(255,255,255,.42); line-height:1.35;
}

/* SocIA orb logo — blue energy sphere with layered inset glow.
   Static when idle, spins smoothly while generating. */
.socia-orb{
  box-shadow:
    inset 0 4px 8px 0 #38bdf8,
    inset 0 8px 14px 0 #005dff,
    inset 0 22px 22px 0 #1e40af,
    0 0 2px 1px rgba(56,189,248,.35),
    0 0 8px 2px rgba(0,93,255,.25);
  transition: box-shadow .4s ease;
}
.socia-orb[data-spinning="true"]{
  animation: socOrbSpin 4.5s linear infinite;
}
@keyframes socOrbSpin{
  0%{
    transform: rotate(0deg);
    box-shadow:
      inset 0 4px 8px 0 #38bdf8,
      inset 0 8px 14px 0 #005dff,
      inset 0 22px 22px 0 #1e40af,
      0 0 3px 1.2px rgba(56,189,248,.5),
      0 0 10px 2px rgba(0,93,255,.35);
  }
  50%{
    transform: rotate(180deg);
    box-shadow:
      inset 0 4px 10px 0 #60a5fa,
      inset 0 10px 6px 0 #0284c7,
      inset 0 18px 28px 0 #005dff,
      0 0 4px 1.2px rgba(56,189,248,.55),
      0 0 14px 3px rgba(0,93,255,.4);
  }
  100%{
    transform: rotate(360deg);
    box-shadow:
      inset 0 4px 8px 0 #4dc8fd,
      inset 0 8px 14px 0 #005dff,
      inset 0 22px 22px 0 #1e40af,
      0 0 3px 1.2px rgba(56,189,248,.5),
      0 0 10px 2px rgba(0,93,255,.35);
  }
}

@keyframes socShimmer{
  0%{ background-position: 200% 0 }
  100%{ background-position: -200% 0 }
}
`;
