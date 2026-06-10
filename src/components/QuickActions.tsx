import { motion } from "motion/react";
import { LayoutGrid } from "lucide-react";
import { ACTIONS_BY_ID, useQuickActions, type ActionId } from "@/data/quickActions";

export default function QuickActions({ onSeeAll }: { onSeeAll: () => void }) {
  const { homeOrder, trigger } = useQuickActions();

  return (
    <div className="w-full grid grid-cols-4 gap-[14px]">
      {homeOrder.map((id, i) => (
        <ActionButton
          key={id}
          id={id}
          delay={i * 0.05}
          onTap={() => trigger(id)}
          primary={i === 0}
        />
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
  primary,
}: {
  id: ActionId | "__see_all__";
  delay: number;
  onTap: () => void;
  seeAll?: boolean;
  primary?: boolean;
}) {
  const action = seeAll ? null : ACTIONS_BY_ID[id as ActionId];
  const Icon = seeAll ? LayoutGrid : action!.Icon;
  const label = seeAll ? "Ver todo" : action!.short ?? action!.label;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 0.93 }}
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 380, damping: 28 }}
      className="group flex flex-col gap-[10px] items-center justify-start pt-[2px] relative"
      aria-label={label}
    >
      <div
        className="relative h-[56px] w-[56px] rounded-[18px] grid place-items-center overflow-hidden transition-colors duration-300"
        style={
          primary
            ? {
                background:
                  "linear-gradient(160deg, #ffffff 0%, #e8e8e8 100%)",
                border: "1px solid rgba(255,255,255,0.9)",
                boxShadow:
                  "0 10px 26px -10px rgba(255,255,255,0.30), inset 0 -2px 4px rgba(0,0,0,0.10)",
              }
            : {
                background:
                  "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.025) 100%)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 18px -14px rgba(0,0,0,0.6)",
              }
        }
      >
        {/* hover sheen — only on ghost buttons */}
        {!primary && (
          <span
            aria-hidden
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(80% 80% at 30% 20%, rgba(255,255,255,0.10), transparent 70%)",
            }}
          />
        )}
        <Icon
          className={`relative h-[22px] w-[22px] ${primary ? "text-black" : "text-white"}`}
          strokeWidth={primary ? 2.2 : 1.85}
        />
      </div>
      <span className="font-['Geist'] text-[11.5px] font-medium text-white/80 leading-none text-center tracking-[-0.1px] truncate max-w-full group-hover:text-white transition-colors">
        {label}
      </span>
    </motion.button>
  );
}
