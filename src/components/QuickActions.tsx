import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { ACTIONS_BY_ID, useQuickActions, type ActionId } from "@/data/quickActions";

export default function QuickActions({ onSeeAll }: { onSeeAll: () => void }) {
  const { homeOrder, trigger } = useQuickActions();

  return (
    <div className="w-full grid grid-cols-4 gap-[12px]">
      {homeOrder.map((id, i) => (
        <ActionButton key={id} id={id} delay={i * 0.04} onTap={() => trigger(id)} />
      ))}
      <ActionButton id="__see_all__" delay={0.16} onTap={onSeeAll} seeAll />
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

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.94 }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="flex flex-col gap-[8px] items-center justify-start"
      aria-label={label}
    >
      <div
        className="h-[58px] w-[58px] rounded-[18px] grid place-items-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Icon className="h-[22px] w-[22px] text-white" strokeWidth={1.7} />
      </div>
      <span className="font-['Geist'] text-[11px] font-medium text-white/75 leading-none text-center truncate max-w-full">
        {label}
      </span>
    </motion.button>
  );
}
