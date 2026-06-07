import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { ACTIONS_BY_ID, useQuickActions, type ActionId } from "@/data/quickActions";

export default function QuickActions({ onSeeAll }: { onSeeAll: () => void }) {
  const { homeOrder, trigger } = useQuickActions();

  return (
    <div className="-mt-[24px] w-full grid grid-cols-4 gap-[12px]">
      {homeOrder.map((id, i) => (
        <ActionButton key={id} id={id} delay={i * 0.05} onTap={() => trigger(id)} />
      ))}
      <ActionButton id="__see_all__" delay={0.15} onTap={onSeeAll} seeAll />
    </div>
  );
}

function ActionButton({
  id,
  delay,
  onTap,
  seeAll,
}: {
  id: ActionId | "__see_all__";
  delay: number;
  onTap: () => void;
  seeAll?: boolean;
}) {
  const action = seeAll ? null : ACTIONS_BY_ID[id as ActionId];
  const Icon = seeAll ? LayoutGrid : action!.Icon;
  const label = seeAll ? "Ver todo" : action!.short ?? action!.label;
  const isPrimary = !seeAll && id === "venta";

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 380, damping: 28 }}
      className="glass-card flex flex-col gap-[8px] items-center justify-center py-[20px] px-[6px] rounded-[28px] relative overflow-hidden"
      style={
        isPrimary
          ? {
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))",
              border: "1px solid rgba(255,255,255,0.18)",
            }
          : undefined
      }
    >
      <div
        className="h-[44px] w-[44px] rounded-full flex items-center justify-center"
        style={{
          background: isPrimary ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Icon
          className={isPrimary ? "h-[18px] w-[18px] text-black" : "h-[18px] w-[18px] text-white"}
          strokeWidth={1.9}
        />
      </div>
      <span className="font-['Geist'] text-[12.5px] text-white/90 leading-none text-center">{label}</span>
    </motion.button>
  );
}
