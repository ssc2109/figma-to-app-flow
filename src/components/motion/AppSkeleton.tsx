import { Skeleton } from "./Skeleton";

/**
 * First-load skeleton mimicking the home screen layout.
 * Shown for ~650ms on initial app mount.
 */
export function AppSkeleton() {
  return (
    <div className="w-full px-[20px] pt-[20px] pb-[120px] flex flex-col gap-[24px]">
      {/* Top bar */}
      <div className="flex items-center gap-[12px]">
        <Skeleton className="size-[48px]" rounded={9999} />
        <div className="flex-1 flex flex-col gap-[8px]">
          <Skeleton className="h-[10px] w-[60px]" rounded={4} />
          <Skeleton className="h-[18px] w-[170px]" rounded={6} />
        </div>
        <Skeleton className="size-[36px]" rounded={12} />
      </div>

      {/* Hero number */}
      <div className="flex flex-col items-center gap-[14px] py-[28px]">
        <Skeleton className="h-[14px] w-[120px]" rounded={4} />
        <Skeleton className="h-[64px] w-[220px]" rounded={12} />
      </div>

      {/* Quick action chips */}
      <div className="flex gap-[10px] overflow-hidden">
        {[88, 110, 96, 104].map((w, i) => (
          <Skeleton key={i} className="h-[40px] shrink-0" style={{ width: w }} rounded={9999} />
        ))}
      </div>

      {/* Cards */}
      <Skeleton className="h-[78px] w-full" rounded={24} />
      <div className="flex flex-col gap-[12px]">
        <Skeleton className="h-[18px] w-[140px]" rounded={6} />
        <Skeleton className="h-[64px] w-full" rounded={20} />
        <Skeleton className="h-[64px] w-full" rounded={20} />
        <Skeleton className="h-[64px] w-full" rounded={20} />
      </div>
    </div>
  );
}
