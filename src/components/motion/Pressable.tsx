import { motion, type HTMLMotionProps } from "motion/react";
import { forwardRef } from "react";

type Props = HTMLMotionProps<"button">;

/**
 * Press-and-hover spring wrapper. Use as drop-in for buttons/cards
 * that should feel physically reactive.
 */
export const Pressable = forwardRef<HTMLButtonElement, Props>(function Pressable(
  { children, className, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.012, y: -1 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 420, damping: 28, mass: 0.7 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
});
