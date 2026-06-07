import { motion } from "motion/react";
import { type ReactNode, Children } from "react";

/**
 * Stagger-fade-in children. Each child slides up + blurs in sequence.
 */
export function Stagger({
  children,
  delay = 0.05,
  step = 0.07,
  className,
}: {
  children: ReactNode;
  delay?: number;
  step?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.55,
            delay: delay + i * step,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
