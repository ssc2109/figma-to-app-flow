import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * Reusable centered confirm dialog with Trax dark aesthetic.
 * Blue primary button. Promise-based API via useConfirm().
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({
 *     title: "Eliminar producto",
 *     description: "Esta acción no se puede deshacer.",
 *     confirmText: "Eliminar",
 *     tone: "danger",
 *   });
 *   if (!ok) return;
 */

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  /** "primary" = blue button. "danger" = red button + warning icon. */
  tone?: "primary" | "danger";
};

type Resolver = (v: boolean) => void;

const ConfirmCtx = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const finish = (v: boolean) => {
    setOpen(false);
    const r = resolverRef.current;
    resolverRef.current = null;
    // Delay resolve until exit animation gives visual feedback
    setTimeout(() => r?.(v), 120);
  };

  const value = useMemo(() => confirm, [confirm]);

  const isDanger = opts?.tone === "danger";
  const confirmText = opts?.confirmText ?? "Confirmar";
  const cancelText = opts?.cancelText ?? "Cancelar";

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && opts && (
              <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center px-[24px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                  onClick={() => finish(false)}
                />
                <motion.div
                  role="alertdialog"
                  aria-modal="true"
                  initial={{ scale: 0.92, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className="relative w-full max-w-[360px] rounded-[22px] p-[22px]"
                  style={{
                    background: "rgba(18,18,20,0.98)",
                    backdropFilter: "blur(40px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 24px 60px -12px rgba(0,0,0,0.6)",
                  }}
                >
                  {isDanger && (
                    <div
                      className="h-[42px] w-[42px] rounded-[13px] grid place-items-center mb-[14px]"
                      style={{
                        background: "rgba(248,113,113,0.14)",
                        border: "1px solid rgba(248,113,113,0.28)",
                      }}
                    >
                      <AlertTriangle className="h-[18px] w-[18px] text-[#F87171]" strokeWidth={1.9} />
                    </div>
                  )}
                  <h3 className="font-['Bai_Jamjuree'] text-[18px] font-semibold text-white tracking-[-0.3px]">
                    {opts.title}
                  </h3>
                  {opts.description && (
                    <p className="mt-[8px] font-['Geist'] text-[13.5px] leading-[1.5] text-white/60">
                      {opts.description}
                    </p>
                  )}

                  <div className="mt-[20px] grid grid-cols-2 gap-[10px]">
                    <button
                      type="button"
                      onClick={() => finish(false)}
                      className="h-[46px] rounded-[14px] bg-white/[0.05] border border-white/[0.08] font-['Geist'] text-[13.5px] font-semibold text-white/80 active:scale-[0.98] transition-transform"
                    >
                      {cancelText}
                    </button>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => finish(true)}
                      className="h-[46px] rounded-[14px] font-['Geist'] text-[13.5px] font-semibold text-white active:scale-[0.98] transition-transform"
                      style={{
                        background: isDanger ? "#ef4444" : "#3b82f6",
                      }}
                    >
                      {confirmText}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </ConfirmCtx.Provider>
  );
}

/** Convenience: full-width inline loading spinner reused in confirm CTAs. */
export const ConfirmSpinner = () => <Loader2 className="h-[14px] w-[14px] animate-spin" />;
