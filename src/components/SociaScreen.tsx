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

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Orb tweak values from design spec (HTML export)
  const orbStyle = {
    "--orb-peak": "56%",
    "--orb-bottom": "78%",
    "--orb-size": "620px",
    "--orb-intensity": "1",
    "--orb-haze": "1.1",
    "--greet-y": "0px",
    "--stack-y": "0px",
    "--c-core": "220, 235, 255",
    "--c-mid": "0, 120, 255",
    "--c-deep": "0, 60, 180",
  } as React.CSSProperties;

  return (
    <div
      className="socia-screen relative w-full h-full flex flex-col overflow-hidden bg-black"
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
      <div className="relative z-30 flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="flex items-center justify-between px-[22px] pt-[14px]">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="circ-btn"
            aria-label="Historial"
          >
            <History className="h-[18px] w-[18px]" strokeWidth={1.7} />
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
            onClick={onNewThread}
            className="circ-btn"
            aria-label="Nuevo"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
        </div>

        {/* EMPTY STATE — exact replication of HTML export */}
        {empty ? (
          <>
            <div className="greet">
              <h1>{greeting}, Alberto.</h1>
              <p>Soy socIA. Puedo analizar, registrar y aconsejarte.</p>
            </div>

            <div className="spacer" />

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

          </>
        ) : (
          /* CHAT STATE — full screen messages + bottom composer */
          <>
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto px-[20px] pt-[20px] pb-[140px] flex flex-col gap-[16px]"
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
}) {
  return (
    <div className="chatbar">
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
        <button type="button" onClick={stopVoiceDictation} className="pill-btn" aria-label="Detener">
          <Square className="h-[16px] w-[16px]" fill="currentColor" />
        </button>
      ) : (
        <button type="button" onClick={startVoiceDictation} className="pill-btn" aria-label="Voz">
          <Mic className="h-[18px] w-[18px]" strokeWidth={1.7} />
        </button>
      )}
      {isLoading ? (
        <button type="button" onClick={stop} className="pill-btn send" aria-label="Detener">
          <Square className="h-[14px] w-[14px]" fill="currentColor" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => send()}
          disabled={!input.trim()}
          className="pill-btn send disabled:opacity-30"
          aria-label="Enviar"
        >
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.2} />
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
          <img key={i} src={f.url} alt="adjunto" className="max-w-[200px] rounded-[14px]" />
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

const SOCIA_CSS = `
.socia-screen{ font-family:'Geist', system-ui, sans-serif; -webkit-font-smoothing:antialiased; }

.socia-screen .circ-btn{
  width:46px; height:46px; border-radius:50%;
  display:grid; place-items:center;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.09);
  color:#cfcfd4;
}

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
.socia-screen .greet{
  text-align:center; margin-top:104px; padding:0 24px;
}
.socia-screen .greet h1{
  font-family:'Bai Jamjuree', sans-serif;
  font-size:34px; font-weight:600; letter-spacing:-0.5px;
  line-height:1.15;
  background:linear-gradient(180deg, #ffffff 58%, rgba(255,255,255,.72) 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.socia-screen .greet p{
  font-size:13.5px; font-weight:400; line-height:1.5;
  color:rgba(255,255,255,.38);
  margin-top:10px; max-width:250px; margin-inline:auto;
}

.socia-screen .spacer{ flex:1; min-height:8px; }
.socia-screen .midstack{ position:relative; z-index:5; margin-top:auto; padding-bottom:40px; }

/* COMPOSER */
.socia-screen .composer{ padding:0 18px; }
.socia-screen .chatbar{
  display:flex; align-items:center; gap:12px;
  min-height:64px; padding:8px 8px 8px 22px;
  border-radius:34px;
  background:rgba(12,12,20,.78);
  border:1px solid rgba(255,255,255,.12);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 24px 70px -16px rgba(110,80,255,.5),
    0 12px 40px -12px rgba(0,0,0,.7);
}
.socia-screen .chatbar-ta{
  flex:1; background:transparent; outline:none; resize:none;
  color:#fff; font-family:'Geist', system-ui, sans-serif;
  font-size:14.5px; line-height:1.4; padding:12px 0;
  max-height:120px;
}
.socia-screen .chatbar-ta::placeholder{ color:rgba(255,255,255,.42) }
.socia-screen .pill-btn{
  width:48px; height:48px; border-radius:50%; flex:none;
  display:grid; place-items:center;
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.10);
  color:#d4d5db; transition:transform .12s;
}
.socia-screen .pill-btn:active{ transform:scale(.94) }
.socia-screen .pill-btn.send{
  background:linear-gradient(180deg, #ffffff, #ece9f7);
  border-color:rgba(255,255,255,.4); color:#17122b;
}

/* CARDS */
.socia-screen .cards-head{
  display:flex; align-items:center; gap:8px;
  padding:20px 24px 0;
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
  padding:4px 18px 4px;
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
`;
