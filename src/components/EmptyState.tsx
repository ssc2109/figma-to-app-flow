import { motion } from "motion/react";

type Variant = "inventory" | "sales" | "fiados";

import inventoryImg from "@/assets/generated/empty-inventory.png";
import salesImg from "@/assets/generated/empty-sales.png";
import fiadosImg from "@/assets/generated/empty-fiados.png";

const IMG: Record<Variant, string> = {
  inventory: inventoryImg,
  sales: salesImg,
  fiados: fiadosImg,
};

export default function EmptyState({
  variant,
  title,
  subtitle,
  action,
}: {
  variant: Variant;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center py-[28px] px-[20px]"
    >
      <img
        src={IMG[variant]}
        alt=""
        loading="lazy"
        width={140}
        height={140}
        className="h-[140px] w-[140px] opacity-70 mb-[14px] select-none pointer-events-none"
        style={{ filter: "drop-shadow(0 0 24px rgba(255,255,255,0.04))" }}
      />
      <h3 className="font-['Bai_Jamjuree'] text-[17px] text-white tracking-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-[6px] text-[13px] text-white/45 font-['Geist'] max-w-[260px] leading-snug">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-[16px]">{action}</div>}
    </motion.div>
  );
}
