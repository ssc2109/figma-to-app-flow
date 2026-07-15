import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SignInView from "./auth/SignInView";
import SignUpView from "./auth/SignUpView";
import ForgotPasswordView from "./auth/ForgotPasswordView";
import { TraxWordmark } from "./auth/shared";

type View = "signin" | "signup" | "forgot";

const dirFor = (from: View, to: View): 1 | -1 => {
  const order: Record<View, number> = { signin: 0, signup: 1, forgot: 2 };
  return order[to] > order[from] ? 1 : -1;
};

export default function AuthScreen() {
  const [view, setView] = useState<View>("signin");
  const [direction, setDirection] = useState<1 | -1>(1);

  const go = (next: View) => {
    setDirection(dirFor(view, next));
    setView(next);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-[20px] py-[32px] relative overflow-hidden">
      {/* Subtle radial ambience */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 45% at 50% 10%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <div className="flex justify-center mb-[28px]">
          <TraxWordmark />
        </div>

        <div
          className="rounded-[26px] p-[22px] relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 20px 60px -30px rgba(0,0,0,0.8)",
          }}
        >
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={view}
              custom={direction}
              initial={(dir: 1 | -1) => ({ opacity: 0, x: dir * 24 })}
              animate={{ opacity: 1, x: 0 }}
              exit={(dir: 1 | -1) => ({ opacity: 0, x: dir * -24 })}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === "signin" && (
                <SignInView
                  onGoToSignUp={() => go("signup")}
                  onGoToForgot={() => go("forgot")}
                />
              )}
              {view === "signup" && <SignUpView onBack={() => go("signin")} />}
              {view === "forgot" && <ForgotPasswordView onBack={() => go("signin")} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-[20px] text-[11.5px] text-white/35 font-['Geist'] text-center">
          Tu negocio, ordenado en un solo lugar
        </p>
      </motion.div>
    </div>
  );
}
