import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SignInView from "./auth/SignInView";
import SignUpView from "./auth/SignUpView";
import ForgotPasswordView from "./auth/ForgotPasswordView";
import { TraxWordmark } from "./auth/shared";
import authBg from "@/assets/auth-bg.mp4.asset.json";

type View = "signin" | "signup" | "forgot";

const dirFor = (from: View, to: View): 1 | -1 => {
  const order: Record<View, number> = { signin: 0, signup: 1, forgot: 2 };
  return order[to] > order[from] ? 1 : -1;
};

export default function AuthScreen() {
  const [view, setView] = useState<View>("signin");
  const [direction, setDirection] = useState<1 | -1>(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const go = (next: View) => {
    setDirection(dirFor(view, next));
    setView(next);
  };

  // iOS Safari won't autoplay unless muted+playsInline are set BEFORE the play() call,
  // and often needs an explicit .play() attempt after mount.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    const onTouch = () => tryPlay();
    document.addEventListener("touchstart", onTouch, { once: true, passive: true });
    return () => document.removeEventListener("touchstart", onTouch);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-[20px] py-[20px] relative overflow-hidden">
      {/* Fallback gradient in case video can't play (iOS Low Power Mode, codec, etc.) */}
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 20%, #1a1f3a 0%, #0a0d1f 45%, #000 100%)",
        }}
      />
      {/* Background video */}
      <video
        ref={videoRef}
        src={authBg.url}
        autoPlay
        loop
        muted
        playsInline
        {...({ "webkit-playsinline": "true", "x5-playsinline": "true" } as Record<string, string>)}
        preload="auto"
        disableRemotePlayback
        controls={false}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-black/55 z-0" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <div className="flex flex-col items-center gap-[10px] mb-[22px]">
          <TraxWordmark className="h-[68px]" />
          <p className="text-[12.5px] tracking-[0.04em] text-white/60 font-['Geist']">
            Tu negocio, con dirección
          </p>
        </div>

        <div className="rounded-[22px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-[20px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={{ opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === "signin" && (
                <SignInView onGoToSignUp={() => go("signup")} onGoToForgot={() => go("forgot")} />
              )}
              {view === "signup" && <SignUpView onBack={() => go("signin")} />}
              {view === "forgot" && <ForgotPasswordView onBack={() => go("signin")} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {view !== "forgot" && (
          <div className="mt-[16px] text-center">
            {view === "signin" ? (
              <button
                type="button"
                onClick={() => go("signup")}
                className="text-[13px] text-white/55 font-['Geist'] active:text-white"
              >
                ¿Nuevo aquí? <span className="text-white">Crear cuenta</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => go("signin")}
                className="text-[13px] text-white/55 font-['Geist'] active:text-white"
              >
                ¿Ya tienes cuenta? <span className="text-white">Entrar</span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
