import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUp, ArrowDown, Pin, Check } from "lucide-react";
import { ALL_ACTIONS, ACTIONS_BY_ID, useQuickActions, type ActionId } from "@/data/quickActions";

export default function QuickActionsScreen({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { homeOrder, swap, pinFirst, trigger } = useQuickActions();
  const rest = ALL_ACTIONS.filter((a) => !homeOrder.includes(a.id));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative w-full max-w-[430px] h-[90vh] flex flex-col rounded-t-[28px] overflow-hidden"
            style={{
              background: "rgba(14,14,16,0.96)",
              backdropFilter: "blur(40px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-[20px] pt-[14px] pb-[12px] border-b border-white/[0.05]">
              <div className="mx-auto h-[4px] w-[44px] rounded-full bg-white/15 mb-[12px]" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-['Geist'] text-[11px] uppercase tracking-[1.4px] text-white/45">
                    Personaliza tu inicio
                  </div>
                  <h2 className="font-['Bai_Jamjuree'] text-[20px] font-semibold text-white tracking-[-0.4px] mt-[2px]">
                    Acciones rápidas
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-[34px] w-[34px] rounded-full bg-white/[0.06] flex items-center justify-center active:scale-95"
                >
                  <X className="h-[14px] w-[14px] text-white/70" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-[16px] py-[16px] flex flex-col gap-[20px]">
              <Section title="En tu inicio" subtitle="Aparecen estas 3 + Ver todo">
                <div className="flex flex-col gap-[8px]">
                  {homeOrder.map((id, idx) => (
                    <HomeRow
                      key={id}
                      id={id}
                      index={idx}
                      total={homeOrder.length}
                      onUp={() => swap(idx, Math.max(0, idx - 1))}
                      onDown={() => swap(idx, Math.min(homeOrder.length - 1, idx + 1))}
                    />
                  ))}
                </div>
              </Section>

              <Section title="Más acciones" subtitle="Toca para añadir al inicio">
                <div className="grid grid-cols-2 gap-[10px]">
                  {rest.map((a) => (
                    <AvailableCard
                      key={a.id}
                      id={a.id}
                      onAdd={() => pinFirst(a.id)}
                      onUse={() => {
                        trigger(a.id);
                        onClose();
                      }}
                    />
                  ))}
                </div>
              </Section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="px-[4px]">
        <div className="font-['Bai_Jamjuree'] text-[15px] font-semibold text-white/90 tracking-[-0.2px]">
          {title}
        </div>
        {subtitle && (
          <div className="font-['Geist'] text-[11.5px] text-white/45 mt-[1px]">{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function HomeRow({
  id,
  index,
  total,
  onUp,
  onDown,
}: {
  id: ActionId;
  index: number;
  total: number;
  onUp: () => void;
  onDown: () => void;
}) {
  const a = ACTIONS_BY_ID[id];
  const Icon = a.Icon;
  return (
    <div
      className="flex items-center gap-[12px] rounded-[16px] p-[12px]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="h-[36px] w-[36px] rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <Icon className="h-[15px] w-[15px] text-white" strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-['Geist'] text-[13.5px] font-medium text-white">{a.label}</div>
        <div className="font-['Geist'] text-[11px] text-white/45 truncate">{a.hint}</div>
      </div>
      <div className="flex items-center gap-[4px]">
        <button
          type="button"
          onClick={onUp}
          disabled={index === 0}
          className="h-[30px] w-[30px] rounded-full bg-white/[0.05] flex items-center justify-center active:scale-90 disabled:opacity-30"
        >
          <ArrowUp className="h-[12px] w-[12px] text-white/80" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onDown}
          disabled={index === total - 1}
          className="h-[30px] w-[30px] rounded-full bg-white/[0.05] flex items-center justify-center active:scale-90 disabled:opacity-30"
        >
          <ArrowDown className="h-[12px] w-[12px] text-white/80" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function AvailableCard({
  id,
  onAdd,
  onUse,
}: {
  id: ActionId;
  onAdd: () => void;
  onUse: () => void;
}) {
  const a = ACTIONS_BY_ID[id];
  const Icon = a.Icon;
  return (
    <div
      className="rounded-[18px] p-[14px] flex flex-col gap-[10px]"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="h-[36px] w-[36px] rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Icon className="h-[15px] w-[15px] text-white/90" strokeWidth={1.9} />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="h-[28px] px-[10px] rounded-full bg-white/[0.08] border border-white/[0.10] flex items-center gap-[4px] active:scale-95"
          aria-label="Fijar en inicio"
        >
          <Pin className="h-[10px] w-[10px] text-white/80" strokeWidth={2} />
          <span className="font-['Geist'] text-[10.5px] text-white/85">Fijar</span>
        </button>
      </div>
      <div>
        <div className="font-['Geist'] text-[13px] font-medium text-white">{a.label}</div>
        <div className="font-['Geist'] text-[11px] text-white/50 leading-[1.35]">{a.hint}</div>
      </div>
      <button
        type="button"
        onClick={onUse}
        className="mt-auto h-[32px] rounded-full bg-white text-black font-['Geist'] text-[12px] font-semibold flex items-center justify-center gap-[5px] active:scale-95"
      >
        <Check className="h-[12px] w-[12px]" strokeWidth={2.4} /> Usar ahora
      </button>
    </div>
  );
}
