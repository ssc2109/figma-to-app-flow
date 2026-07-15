import { useEffect, useState, type CSSProperties } from "react";
import {
  Settings,
  ChevronRight,
  TrendingUp,
  ArrowRight,
  Clock,
  Package,
  MessageCircle,
  HandCoins,
  Receipt,
  PackagePlus,
  Truck,
  CheckCircle2,
  LayoutGrid,
  Plus,
  Minus,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFinance } from "@/data/finance";
import { useBriefing, type Briefing } from "@/components/home/SociaInsightCard";
import type { HomeNavIntent } from "@/components/home/ProactiveHero";
import MissionsCarousel from "@/components/home/MissionsCarousel";
import traxLogo from "@/assets/trax-logo.png.asset.json";

const G = "'Geist', sans-serif";
const B = "'Bai Jamjuree', sans-serif";
const GREEN = "#5EEAA0";
const RED = "#FF8A8A";
const SOCIA = "#7CC3FF";

/* ---------- utils ---------- */
function greetingByHour() {
  const h = new Date().getHours();
  if (h < 5) return "Aún de madrugada,";
  if (h < 12) return "Buenos días,";
  if (h < 19) return "Buenas tardes,";
  return "Buenas noches,";
}
const money = (n: number) =>
  n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(m.matches);
    const fn = () => setReduce(m.matches);
    m.addEventListener?.("change", fn);
    return () => m.removeEventListener?.("change", fn);
  }, []);
  return reduce;
}

function useCountUp(target: number, enabled: boolean) {
  const [v, setV] = useState(enabled ? 0 : target);
  useEffect(() => {
    if (!enabled) {
      setV(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1100);
      setV(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled]);
  return v;
}

function Stream({
  text,
  reduce,
  start = 0,
  step = 0.045,
  style,
}: {
  text: string;
  reduce: boolean;
  start?: number;
  step?: number;
  style?: CSSProperties;
}) {
  if (reduce) return <span style={style}>{text}</span>;
  const words = text.split(" ");
  return (
    <span style={style}>
      {words.map((w, i) => (
        <span
          key={i}
          className="socia-word"
          style={{ animationDelay: `${start + i * step}s` }}
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

/* ---------- Orbe socIA ---------- */
function Orb({
  size = 44,
  bloom = true,
  bloomScale = 2.0,
  bloomOpacity = 0.16,
  style,
}: {
  size?: number;
  bloom?: boolean;
  bloomScale?: number;
  bloomOpacity?: number;
  style?: CSSProperties;
}) {
  const k = size / 180;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flex: "none", ...style }}
    >
      {bloom && (
        <div
          className="socia-bloom-home"
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: size * bloomScale,
            height: size * bloomScale,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            pointerEvents: "none",
            background: `radial-gradient(circle, rgba(0,93,255,${bloomOpacity}) 0%, rgba(56,189,248,${bloomOpacity * 0.5}) 38%, transparent 64%)`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%,-50%) scale(${k})`,
          transformOrigin: "center",
        }}
      >
        <div
          className="socia-orb-core"
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle at 50% 34%, #1d2c4d 0%, #060a14 72%)",
          }}
        />
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header({
  businessName,
  avatarUrl,
  initials,
  onOpenSettings,
}: {
  businessName: string;
  avatarUrl: string | null;
  initials: string;
  onOpenSettings: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "20px 20px 10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <img
          src={traxLogo.url}
          alt="Trax"
          style={{ height: 22, width: "auto", display: "block", flex: "none" }}
        />
        <span
          style={{
            fontFamily: G,
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            paddingLeft: 12,
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {businessName}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          aria-label="Perfil"
          style={{
            height: 38,
            width: 38,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            flex: "none",
            overflow: "hidden",
            background:
              "radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 60%)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontFamily: B, fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {initials}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Ajustes"
          style={{
            height: 38,
            width: 38,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            flex: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Settings size={17} color="#fff" strokeWidth={1.7} />
        </button>
      </div>
    </div>
  );
}

/* ---------- SociaHero ---------- */
type SociaAction = { label: string; Icon: typeof Package; intent: HomeNavIntent };

function insightToAction(ins: Briefing["insights"][number]): SociaAction | null {
  if (!ins.cta) return null;
  const a = ins.cta.action;
  if (a === "reponer")
    return {
      label: ins.cta.label,
      Icon: Package,
      intent: { kind: "reponer", productHint: ins.cta.payload },
    };
  if (a === "cobrar_fiado")
    return {
      label: ins.cta.label,
      Icon: HandCoins,
      intent: { kind: "screen", screen: "negocio" },
    };
  if (a === "ventas")
    return { label: ins.cta.label, Icon: PackagePlus, intent: { kind: "sales" } };
  if (a === "finanzas")
    return {
      label: ins.cta.label,
      Icon: Receipt,
      intent: { kind: "screen", screen: "negocio", subview: "finanzas" },
    };
  if (a === "promo")
    return {
      label: ins.cta.label,
      Icon: Sparkles,
      intent: { kind: "screen", screen: "crecer" },
    };
  return { label: ins.cta.label, Icon: MessageCircle, intent: { kind: "chat", prompt: ins.text } };
}

/* ---------- SociaAskBar (barra "Pregúntale a socIA") ---------- */
function SociaAskBar({
  prompts,
  briefing,
  onIntent,
  reduce,
}: {
  prompts: string[];
  briefing: Briefing | undefined;
  onIntent: (i: HomeNavIntent) => void;
  reduce: boolean;
}) {
  // Sólo mostramos CTA cuando hay algo real que hacer (warning accionable).
  const primary =
    briefing?.insights?.find((ins) => ins.cta && ins.tone === "warning") ?? null;
  const primaryAction = primary ? insightToAction(primary) : null;

  const options = prompts.length > 0 ? prompts : ["Pregúntale a socIA"];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (reduce || options.length <= 1 || primaryAction) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % options.length), 4200);
    return () => clearInterval(id);
  }, [reduce, options.length, primaryAction]);

  const current = options[idx] ?? options[0];

  // CTA MODE — misma barra que "Preguntar", sólo cambian icono/texto/chip.
  if (primaryAction && primary) {
    const CtaIcon = primaryAction.Icon;
    return (
      <button
        type="button"
        onClick={() => onIntent(primaryAction.intent)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "12px 14px 12px 16px",
          borderRadius: 999,
          cursor: "pointer",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 20px -14px rgba(124,195,255,0.35)",
          overflow: "hidden",
          textAlign: "left",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 90,
            height: 90,
            borderRadius: "50%",
            background:
              "radial-gradient(closest-side, rgba(124,195,255,0.20), transparent 70%)",
            filter: "blur(4px)",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            position: "relative",
            height: 22,
            width: 22,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            flex: "none",
            background: "rgba(124,195,255,0.14)",
            border: "1px solid rgba(124,195,255,0.30)",
          }}
        >
          <CtaIcon size={12} color={SOCIA} strokeWidth={2} />
        </span>
        <span
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            fontFamily: G,
            fontSize: 13.5,
            fontWeight: 500,
            color: "rgba(255,255,255,0.86)",
            letterSpacing: "-0.05px",
            lineHeight: "20px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {primary.text}
        </span>
        <span
          aria-hidden
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            fontFamily: G,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "rgba(124,195,255,0.85)",
            padding: "4px 8px",
            borderRadius: 999,
            background: "rgba(124,195,255,0.10)",
            border: "1px solid rgba(124,195,255,0.22)",
            flex: "none",
          }}
        >
          {primary.cta!.label}
        </span>
      </button>
    );
  }



  // ASK MODE — barra de preguntas cíclicas.
  return (
    <button
      type="button"
      onClick={() =>
        onIntent({
          kind: "chat",
          prompt: prompts.length > 0 ? current : "",
        })
      }
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "12px 14px 12px 16px",
        borderRadius: 999,
        cursor: "pointer",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.035) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 20px -14px rgba(124,195,255,0.35)",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: -20,
          top: "50%",
          transform: "translateY(-50%)",
          width: 90,
          height: 90,
          borderRadius: "50%",
          background:
            "radial-gradient(closest-side, rgba(124,195,255,0.20), transparent 70%)",
          filter: "blur(4px)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "relative",
          height: 22,
          width: 22,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flex: "none",
          background: "rgba(124,195,255,0.14)",
          border: "1px solid rgba(124,195,255,0.30)",
        }}
      >
        <Sparkles size={12} color={SOCIA} strokeWidth={2} />
      </span>
      <span
        style={{
          position: "relative",
          flex: 1,
          minWidth: 0,
          height: 20,
          overflow: "hidden",
          display: "block",
        }}
      >
        <span
          key={current}
          className={reduce ? "" : "socia-prompt-fade"}
          style={{
            display: "block",
            fontFamily: G,
            fontSize: 13.5,
            fontWeight: 400,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: "-0.05px",
            lineHeight: "20px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {prompts.length > 0 ? current : "Pregúntale a socIA"}
        </span>
      </span>
      <span
        aria-hidden
        style={{
          position: "relative",
          fontFamily: G,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "1.2px",
          textTransform: "uppercase",
          color: "rgba(124,195,255,0.85)",
          padding: "4px 8px",
          borderRadius: 999,
          background: "rgba(124,195,255,0.10)",
          border: "1px solid rgba(124,195,255,0.22)",
          flex: "none",
        }}
      >
        Preguntar
      </span>
    </button>
  );
}


function SociaHero({
  reduce,
  ownerFirst,
  briefing,
  isLoading,
  onIntent,
}: {
  reduce: boolean;
  ownerFirst: string;
  briefing: Briefing | undefined;
  isLoading: boolean;
  onIntent: (i: HomeNavIntent) => void;
}) {
  const [thinking, setThinking] = useState(!reduce);
  useEffect(() => {
    if (reduce || !isLoading) {
      const t = setTimeout(() => setThinking(false), reduce ? 0 : 700);
      return () => clearTimeout(t);
    }
    setThinking(true);
  }, [reduce, isLoading]);

  const firstInsight = briefing?.insights?.[0];
  const text =
    firstInsight?.text ??
    briefing?.greeting.line2 ??
    "Buen momento para revisar tu día. Aquí estoy para lo que necesites.";
  

  const bodyWords = text.split(" ").length;
  const bodyStart = 0.3;
  const footerDelay = bodyStart + bodyWords * 0.05 + 0.2;

  const Thinking = (
    <span
      style={{
        fontFamily: G,
        fontSize: 15.5,
        fontWeight: 400,
        color: "rgba(255,255,255,0.5)",
        letterSpacing: "0.2px",
      }}
    >
      {"Pensando".split("").map((ch, i) => (
        <span
          key={i}
          className={reduce ? "" : "socia-letter"}
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          {ch}
        </span>
      ))}
      <span style={{ opacity: 0.5 }}> …</span>
    </span>
  );

  return (
    <div className="trax-rise-home" style={{ position: "relative", padding: "22px 2px 6px" }}>
      <h1
        style={{
          margin: 0,
          fontFamily: G,
          fontSize: 26,
          fontWeight: 300,
          lineHeight: "32px",
          letterSpacing: "-0.5px",
          color: "#fff",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <Stream text={greetingByHour()} reduce={reduce} start={0} step={0.05} />{" "}
        <Stream text={`${ownerFirst}.`} reduce={reduce} start={0.14} step={0.05} />
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 13,
          marginTop: 24,
          minHeight: 30,
        }}
      >
        <Orb size={28} bloomScale={2.2} bloomOpacity={0.16} style={{ marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {thinking ? (
            Thinking
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: G,
                fontSize: 16.5,
                fontWeight: 400,
                lineHeight: "23px",
                letterSpacing: "-0.1px",
                color: "rgba(255,255,255,0.72)",
              }}
            >
              <Stream text={text} reduce={reduce} start={bodyStart} step={0.05} />
            </p>
          )}
        </div>
      </div>
      {!thinking &&
        briefing?.insights?.some((ins) => ins.cta && ins.tone === "warning") && (
          <div
            className={reduce ? "" : "socia-fade"}
            style={{ marginTop: 16, animationDelay: reduce ? "0s" : `${footerDelay}s` }}
          >
            <SociaAskBar
              prompts={briefing?.quickPrompts ?? []}
              briefing={briefing}
              onIntent={onIntent}
              reduce={reduce}
            />
          </div>
        )}
    </div>
  );
}

/* ---------- SociaActions "Antes de cerrar" ---------- */
function SociaActions({
  reduce,
  delay,
  briefing,
  onIntent,
}: {
  reduce: boolean;
  delay: number;
  briefing: Briefing | undefined;
  onIntent: (i: HomeNavIntent) => void;
}) {
  const [open, setOpen] = useState(false);
  // Sólo mostramos como tareas los insights REALES accionables:
  // - deben tener CTA (algo que hacer)
  // - o tono warning / opportunity (algo que atender)
  // Si no hay nada, la card entera no se renderiza.
  const raw = briefing?.insights ?? [];
  const insights = raw.filter(
    (ins) => ins.cta != null || ins.tone === "warning" || ins.tone === "opportunity",
  );
  if (insights.length === 0) return null;

  const items = insights.map((ins) => {
    const a = insightToAction(ins);
    return {
      Icon:
        ins.tone === "warning"
          ? Package
          : ins.tone === "opportunity"
            ? Sparkles
            : ins.tone === "celebration"
              ? CheckCircle2
              : Receipt,
      title: ins.text,
      sub:
        ins.tone === "warning"
          ? "Requiere tu atención"
          : ins.tone === "opportunity"
            ? "Oportunidad detectada"
            : ins.tone === "celebration"
              ? "Buen resultado"
              : "Nota del día",
      intent: a?.intent ?? { kind: "chat" as const, prompt: ins.text },
    };
  });

  const shown = open ? items : items.slice(0, 1);
  const hidden = items.length - 1;

  return (
    <div
      className={reduce ? "" : "socia-fade"}
      style={{
        marginTop: 18,
        borderRadius: 22,
        padding: 14,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
        animationDelay: reduce ? "0s" : `${delay}s`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 4px 12px",
        }}
      >
        <span
          style={{
            fontFamily: G,
            fontSize: 15.5,
            fontWeight: 600,
            color: "#fff",
            letterSpacing: "-0.2px",
          }}
        >
          Antes de cerrar
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Clock size={12} color="rgba(255,255,255,0.55)" strokeWidth={2} />
          <span
            style={{
              fontFamily: G,
              fontSize: 11.5,
              fontWeight: 500,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {items.length} {items.length === 1 ? "tarea" : "tareas"}
          </span>
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {shown.map((it, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onIntent(it.intent)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "left",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                height: 28,
                width: 28,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                flex: "none",
                background: "rgba(124,195,255,0.08)",
                border: "1px solid rgba(124,195,255,0.20)",
              }}
            >
              <it.Icon size={14} color={SOCIA} strokeWidth={2} />
            </span>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                minWidth: 0,
                flex: 1,
              }}
            >
              <span
                style={{
                  fontFamily: G,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  letterSpacing: "-0.1px",
                  lineHeight: "17px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {it.title}
              </span>
              <span
                style={{
                  fontFamily: G,
                  fontSize: 10.5,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: "0.2px",
                }}
              >
                {it.sub}
              </span>
            </span>
            <ArrowRight
              size={13}
              color="rgba(124,195,255,0.75)"
              strokeWidth={2.2}
              style={{ flex: "none" }}
            />
          </button>
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            marginTop: 8,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "9px",
            borderRadius: 14,
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              fontFamily: G,
              fontSize: 12.5,
              fontWeight: 500,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {open ? "Ver menos" : `Ver ${hidden} más`}
          </span>
          <ChevronDown
            size={14}
            color="rgba(255,255,255,0.5)"
            strokeWidth={2.2}
            style={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.25s ease",
            }}
          />
        </button>
      )}
    </div>
  );
}

/* ---------- MoneyStrip ---------- */
function MoneyStrip({
  reduce,
  todayNet,
  todayIncome,
  todayExpense,
  yesterdayNet,
  onOpen,
}: {
  reduce: boolean;
  todayNet: number;
  todayIncome: number;
  todayExpense: number;
  yesterdayNet: number;
  onOpen: () => void;
}) {
  const v = useCountUp(todayNet, !reduce);
  const delta =
    yesterdayNet > 0 ? Math.round(((todayNet - yesterdayNet) / yesterdayNet) * 100) : null;
  const deltaColor = delta === null || delta >= 0 ? GREEN : RED;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="trax-rise-home"
      style={{
        animationDelay: "0.06s",
        width: "100%",
        textAlign: "left",
        cursor: "pointer",
        borderRadius: 22,
        padding: "16px 18px",
        background: "rgba(255,255,255,0.045)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontFamily: G,
              fontSize: 10.5,
              fontWeight: 500,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Ganancia de hoy
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 7px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              style={{
                position: "relative",
                display: "grid",
                placeItems: "center",
                height: 5,
                width: 5,
              }}
            >
              <span
                className="trax-ping-home"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.8)",
                  opacity: 0.6,
                }}
              />
              <span
                style={{
                  position: "relative",
                  height: 5,
                  width: 5,
                  borderRadius: 999,
                  background: "#fff",
                }}
              />
            </span>
            <span
              style={{
                fontFamily: G,
                fontSize: 8.5,
                fontWeight: 600,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              En vivo
            </span>
          </span>
        </div>
        <ChevronRight size={16} color="rgba(255,255,255,0.35)" strokeWidth={2} />
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
        <span
          style={{
            fontFamily: B,
            fontWeight: 500,
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "-0.5px",
          }}
        >
          S/
        </span>
        <span
          style={{
            fontFamily: B,
            fontWeight: 700,
            fontSize: 32,
            lineHeight: "34px",
            color: "#fff",
            letterSpacing: "-1.2px",
          }}
        >
          {money(v)}
        </span>
        {delta !== null && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              marginLeft: 2,
            }}
          >
            <TrendingUp size={13} style={{ color: deltaColor }} strokeWidth={2.4} />
            <span
              style={{
                fontFamily: G,
                fontSize: 12,
                fontWeight: 600,
                color: deltaColor,
              }}
            >
              {delta >= 0 ? "+" : ""}
              {delta}%
            </span>
            <span
              style={{
                fontFamily: G,
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              vs ayer
            </span>
          </span>
        )}
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 0 12px" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { l: "Ventas hoy", v: `S/ ${money(todayIncome)}` },
          { l: "Gastos hoy", v: `S/ ${money(todayExpense)}` },
        ].map((k) => (
          <div key={k.l} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontFamily: G,
                fontSize: 9.5,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {k.l}
            </span>
            <span
              style={{
                fontFamily: B,
                fontWeight: 700,
                fontSize: 16,
                color: "rgba(255,255,255,0.92)",
                letterSpacing: "-0.2px",
              }}
            >
              {k.v}
            </span>
          </div>
        ))}
      </div>
    </button>
  );
}

/* ---------- QuickActions (compact 4x1) ---------- */
type QAKey = "venta" | "pedir_proveedor" | "cobrar_fiado" | "ver_todo";
function QuickActionsRow({
  onIntent,
  onSeeAll,
}: {
  onIntent: (i: HomeNavIntent) => void;
  onSeeAll: () => void;
}) {
  const actions: { key: QAKey; label: string; Icon: typeof PackagePlus; onTap: () => void }[] = [
    { key: "venta", label: "Vender", Icon: PackagePlus, onTap: () => onIntent({ kind: "sales" }) },
    {
      key: "pedir_proveedor",
      label: "Proveedor",
      Icon: Truck,
      onTap: () => onIntent({ kind: "screen", screen: "crecer" }),
    },
    {
      key: "cobrar_fiado",
      label: "Cobrar",
      Icon: CheckCircle2,
      onTap: () => onIntent({ kind: "screen", screen: "negocio", subview: "finanzas" }),
    },
    { key: "ver_todo", label: "Ver todo", Icon: LayoutGrid, onTap: onSeeAll },
  ];
  return (
    <div
      className="trax-rise-home"
      style={{
        animationDelay: "0.12s",
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 12,
      }}
    >
      {actions.map(({ key, label, Icon, onTap }) => (
        <button
          type="button"
          key={key}
          onClick={onTap}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              height: 58,
              width: 58,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Icon size={22} color="#fff" strokeWidth={1.7} />
          </div>
          <span
            style={{
              fontFamily: G,
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Grow ---------- */
const GROW = [
  {
    tag: "Promo",
    title: "Crea una promo para el finde",
    grad:
      "radial-gradient(110% 110% at 20% 20%, #db9140 0%, transparent 50%), radial-gradient(120% 120% at 84% 26%, #ce4f82 0%, transparent 50%), linear-gradient(165deg, #2a1622 0%, #150b12 100%)",
    prompt: "Sugiéreme una promo para este fin de semana",
  },
  {
    tag: "Combo",
    title: "Arma un combo y vende más",
    grad:
      "radial-gradient(110% 110% at 20% 14%, #6244b8 0%, transparent 52%), radial-gradient(120% 120% at 84% 30%, #9a57e0 0%, transparent 48%), linear-gradient(165deg, #1c1733 0%, #0d0a18 100%)",
    prompt: "Arma un combo con mis productos más vendidos",
  },
  {
    tag: "Idea",
    title: "Comparte tu catálogo por WhatsApp",
    grad:
      "radial-gradient(110% 110% at 18% 16%, #1f7fc2 0%, transparent 52%), radial-gradient(120% 120% at 86% 26%, #2cc0d6 0%, transparent 50%), linear-gradient(165deg, #102a3f 0%, #0a1622 100%)",
    prompt: "Ayúdame a compartir mi catálogo por WhatsApp",
  },
];

function Grow({
  briefing,
  onIntent,
}: {
  briefing: Briefing | undefined;
  onIntent: (i: HomeNavIntent) => void;
}) {
  const prompts = briefing?.quickPrompts ?? [];
  const cards = GROW.map((c, i) => ({
    ...c,
    title: prompts[i] ? prompts[i] : c.title,
  }));
  return (
    <div
      className="trax-rise-home"
      style={{
        animationDelay: "0.18s",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: G,
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Ideas de socIA
        </span>
        <h2
          style={{
            margin: 0,
            fontFamily: B,
            fontWeight: 600,
            fontSize: 22,
            lineHeight: "26px",
            color: "#fff",
            letterSpacing: "-0.4px",
          }}
        >
          Para crecer
        </h2>
      </div>
      <div
        className="no-scrollbar"
        style={{
          margin: "0 -20px",
          padding: "0 20px 4px",
          display: "flex",
          gap: 14,
          overflowX: "auto",
        }}
      >
        {cards.map((c, i) => (
          <button
            type="button"
            key={i}
            onClick={() => onIntent({ kind: "chat", prompt: c.prompt })}
            style={{
              flexShrink: 0,
              width: "66%",
              maxWidth: 250,
              borderRadius: 22,
              overflow: "hidden",
              textAlign: "left",
              cursor: "pointer",
              padding: 0,
              background: "#0E0E12",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ position: "relative", height: 132, background: c.grad }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(8,8,12,0.55) 0%, transparent 52%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  bottom: 12,
                  padding: "5px 11px",
                  borderRadius: 999,
                  fontFamily: G,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.4px",
                  color: "#fff",
                  background: "rgba(10,10,14,0.45)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                {c.tag}
              </span>
            </div>
            <div
              style={{
                padding: "14px 16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: G,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "-0.2px",
                  lineHeight: "20px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {c.title}
              </span>
              <ArrowRight
                size={16}
                color="rgba(255,255,255,0.4)"
                strokeWidth={2.2}
                style={{ flex: "none" }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Activity ---------- */
function relativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "Ahora";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 12) return `Hace ${h} h`;
  if (d.toDateString() === now.toDateString())
    return `Hoy, ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString())
    return `Ayer, ${d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" });
}

function Activity({ onSeeAll }: { onSeeAll: () => void }) {
  const fin = useFinance();
  const items = fin.tx.slice(0, 3);
  return (
    <div
      className="trax-rise-home"
      style={{
        animationDelay: "0.24s",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: B,
            fontWeight: 600,
            fontSize: 22,
            lineHeight: "26px",
            color: "#fff",
            letterSpacing: "-0.4px",
          }}
        >
          Actividad
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          style={{
            fontFamily: G,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "1px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Ver historial
        </button>
      </div>
      {items.length === 0 ? (
        <div
          style={{
            borderRadius: 22,
            padding: "20px 18px",
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: G,
            fontSize: 13.5,
            color: "rgba(255,255,255,0.55)",
            textAlign: "center",
          }}
        >
          Aún no hay movimientos. Registra tu primera venta.
        </div>
      ) : (
        <div
          style={{
            borderRadius: 22,
            overflow: "hidden",
            padding: "0 6px",
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.09)",
          }}
        >
          {items.map((t, i) => {
            const isIn = t.kind === "ingreso";
            const color = isIn ? GREEN : RED;
            const Icon = isIn ? Plus : Minus;
            const title = `${isIn ? "Venta" : "Pago"}: ${t.category}`;
            return (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 10px",
                  borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    height: 36,
                    width: 36,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                    background: isIn
                      ? "rgba(94,234,160,0.14)"
                      : "rgba(255,138,138,0.14)",
                    border: `1px solid ${isIn ? "rgba(94,234,160,0.32)" : "rgba(255,138,138,0.32)"}`,
                  }}
                >
                  <Icon size={15} style={{ color }} strokeWidth={2.6} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: G,
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontFamily: G,
                      fontSize: 11.5,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {relativeTime(t.date)} · {t.method ?? "Efectivo"}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: B,
                    fontWeight: 700,
                    fontSize: 16,
                    letterSpacing: "-0.2px",
                    whiteSpace: "nowrap",
                    color,
                  }}
                >
                  {isIn ? "+" : "−"} S/ {money(t.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------- Container ---------- */
export default function Container({
  onSeeAllActions,
  onSeeAllActivity,
  onOpenSettings,
  onIntent,
}: {
  onSeeAllActions?: () => void;
  onSeeAllActivity?: () => void;
  onOpenSettings?: () => void;
  onIntent?: (i: HomeNavIntent) => void;
} = {}) {
  const { profile } = useAuth();
  const fin = useFinance();
  const reduce = usePrefersReducedMotion();
  const { data: briefing, isLoading } = useBriefing();

  const ownerFirst = (profile?.owner_name ?? "").split(/\s+/)[0] || "tú";
  const businessName = profile?.business_name || "Mi negocio";
  const initials =
    businessName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") || "TU";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yTx = fin.tx.filter(
    (t) => new Date(t.date).toDateString() === yesterday.toDateString(),
  );
  const yesterdayIncome = yTx
    .filter((t) => t.kind === "ingreso")
    .reduce((s, t) => s + t.amount, 0);
  const yesterdayExpense = yTx
    .filter((t) => t.kind === "egreso")
    .reduce((s, t) => s + t.amount, 0);
  const yesterdayNet = yesterdayIncome - yesterdayExpense;

  const handleIntent = onIntent ?? (() => {});
  const handleSeeAllActions = onSeeAllActions ?? (() => {});
  const handleSeeAllActivity = onSeeAllActivity ?? (() => {});
  const handleOpenSettings = onOpenSettings ?? (() => {});

  return (
    <div className="w-full trax" style={{ background: "transparent" }}>
      <Header
        businessName={businessName}
        avatarUrl={profile?.avatar_url ?? null}
        initials={initials}
        onOpenSettings={handleOpenSettings}
      />
      <div
        style={{
          padding: "6px 20px 0",
          display: "flex",
          flexDirection: "column",
          gap: 30,
        }}
      >
        <SociaHero
          reduce={reduce}
          ownerFirst={ownerFirst}
          briefing={briefing}
          isLoading={isLoading}
          onIntent={handleIntent}
        />
        <MoneyStrip
          reduce={reduce}
          todayNet={fin.todayNet}
          todayIncome={fin.todayIncome}
          todayExpense={fin.todayExpense}
          yesterdayNet={yesterdayNet}
          onOpen={() =>
            handleIntent({ kind: "screen", screen: "negocio", subview: "finanzas" })
          }
        />
        <QuickActionsRow onIntent={handleIntent} onSeeAll={handleSeeAllActions} />
        <Activity onSeeAll={handleSeeAllActivity} />
      </div>
    </div>
  );
}
