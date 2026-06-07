type Props = {
  data: number[];
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
};

/**
 * Tiny SVG sparkline. Smooth, premium feel.
 */
export function Sparkline({
  data,
  height = 56,
  stroke = "rgba(255,255,255,0.85)",
  fill = "rgba(255,255,255,0.10)",
  className = "",
}: Props) {
  const width = 320;
  const pad = 4;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = (width - pad * 2) / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });
  // smooth path with quadratic curves
  const path = points
    .map((p, i, arr) => {
      if (i === 0) return `M ${p[0]},${p[1]}`;
      const prev = arr[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return `Q ${cx},${prev[1]} ${cx},${(prev[1] + p[1]) / 2} T ${p[0]},${p[1]}`;
    })
    .join(" ");
  const area = `${path} L ${pad + (data.length - 1) * step},${height - pad} L ${pad},${height - pad} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
    >
      <defs>
        <linearGradient id="trax-spark-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="1" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trax-spark-fade)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) =>
        i === points.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3" fill={stroke} />
        ) : null,
      )}
    </svg>
  );
}
