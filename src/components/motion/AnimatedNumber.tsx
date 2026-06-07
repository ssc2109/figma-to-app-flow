import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";

type Props = {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  delay?: number;
};

/**
 * Count-up animated number using a smooth cubic ease.
 * Re-animates whenever `value` changes.
 */
export function AnimatedNumber({
  value,
  duration = 1.2,
  format = (n) => n.toLocaleString("es-PE"),
  className,
  delay = 0,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const formatRef = useRef(format);
  formatRef.current = format;
  const [display, setDisplay] = useState(() => format(0));
  const prev = useRef(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(prev.current, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(formatRef.current(latest)),
    });
    prev.current = value;
    return () => controls.stop();
  }, [inView, value, duration, delay]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  );
}
