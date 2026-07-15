import { useEffect, useState } from "react";
import traxLogo from "@/assets/trax-wordmark.png.asset.json";

export function TraxWordmark({ className = "" }: { className?: string }) {
  return (
    <img
      src={traxLogo.url}
      alt="Trax"
      className={`h-[44px] w-auto object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  autoFocus,
  disabled,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-[7px]">
      <span className="text-[10.5px] uppercase tracking-[0.08em] text-white/45 font-['Geist'] font-medium">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
        required={required}
        className="h-[50px] rounded-[14px] px-[15px] bg-white/[0.03] border border-white/[0.08] text-white text-[15px] font-['Geist'] placeholder:text-white/25 outline-none focus:border-white/40 focus:bg-white/[0.05] transition-all disabled:opacity-40"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="h-[52px] w-full rounded-[16px] bg-white text-black font-['Geist'] text-[15px] font-medium active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100"
    >
      {loading ? "Cargando…" : children}
    </button>
  );
}

export function SocialButton({
  children,
  onClick,
  disabled,
  icon,
  suffix,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-[52px] w-full rounded-[16px] font-['Geist'] text-[14.5px] text-white flex items-center justify-center gap-[10px] active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium">{children}</span>
      {suffix}
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[10.5px] text-white/35 font-['Geist'] uppercase tracking-[0.14em]">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        d="M21.35 11.1h-9.17v2.97h5.27c-.23 1.4-1.62 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.85 3.86 14.78 3 12.18 3 7.13 3 3 7.13 3 12.18s4.13 9.18 9.18 9.18c5.3 0 8.82-3.72 8.82-8.97 0-.6-.07-1.06-.15-1.29z"
      />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#fff"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
      />
    </svg>
  );
}

export function BackArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 18l-6-6 6-6"
      />
    </svg>
  );
}

export function useIsAppleDevice() {
  const [isApple, setIsApple] = useState(false);
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent;
    // iOS, iPadOS (Safari reports Mac), macOS Safari
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isMac = /Macintosh|Mac OS X/.test(ua);
    setIsApple(isIOS || isMac);
  }, []);
  return isApple;
}
