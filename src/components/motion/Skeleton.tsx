import { type CSSProperties } from "react";

type Props = {
  className?: string;
  style?: CSSProperties;
  rounded?: number | string;
};

/**
 * Shimmer skeleton block. Uses CSS keyframe `trax-shimmer` from styles.css.
 */
export function Skeleton({ className = "", style, rounded = 12 }: Props) {
  return (
    <div
      className={`trax-skeleton ${className}`}
      style={{
        borderRadius: typeof rounded === "number" ? `${rounded}px` : rounded,
        ...style,
      }}
    />
  );
}
