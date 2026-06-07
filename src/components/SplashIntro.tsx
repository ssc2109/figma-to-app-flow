import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import introAsset from "@/assets/generated/intro.mp4.asset.json";

const STORAGE_KEY = "trax:intro:seen-v1";

export default function SplashIntro() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      // ignore
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
  };

  // Auto-dismiss after 5.2s
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, 5200);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={dismiss}
        >
          <video
            ref={ref}
            src={introAsset.url}
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover"
            onEnded={dismiss}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="absolute top-[18px] right-[18px] text-[11px] uppercase tracking-wider text-white/55 font-['Geist']"
          >
            Saltar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
