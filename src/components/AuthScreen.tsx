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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-[24px] py-[32px] relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        <div className="flex justify-start mb-[48px]">
          <TraxWordmark />
        </div>

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
      </motion.div>
    </div>
  );
}
