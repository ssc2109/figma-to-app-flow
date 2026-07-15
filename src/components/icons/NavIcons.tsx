type IconProps = { className?: string; filled?: boolean };

const base = "w-[22px] h-[22px]";

export function HomeIcon({ className, filled }: IconProps) {
  const cls = className ?? base;
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M20.46 7.69L14.46 3.02c-1.44-1.12-3.47-1.12-4.91 0l-6 4.67C2.57 8.45 2 9.61 2 10.85V18a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-7.15c0-1.24-.57-2.4-1.54-3.16ZM15 17.75H9a.75.75 0 0 1 0-1.5h6a.75.75 0 0 1 0 1.5Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={cls}>
      <path d="M20.46 7.69 14.46 3.02c-1.44-1.12-3.47-1.12-4.91 0l-6 4.67C2.57 8.45 2 9.61 2 10.85V18a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-7.15c0-1.24-.57-2.4-1.54-3.16Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BusinessIcon({ className, filled }: IconProps) {
  const cls = className ?? base;
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M18.8 13.87h-3.57c-.34 0-.83.19-1.07.44a2.9 2.9 0 0 1-4.31 0c-.24-.25-.74-.44-1.09-.44H5.2c-.74 0-1.47-.23-2.1-.62-.39-.24-.73-.03-.73.43v4.2a3.75 3.75 0 0 0 3.74 3.74h11.77a3.75 3.75 0 0 0 3.74-3.74v-4.2c0-.46-.34-.67-.73-.43-.62.38-1.35.62-2.09.62Z" />
        <path d="M17.89 5.58h-1.94V4.51a2.88 2.88 0 0 0-2.88-2.88h-2.14A2.87 2.87 0 0 0 8.06 4.5v1.08H6.12A3.65 3.65 0 0 0 2.98 7.3c-.52.81-.63 1.81-.44 2.75l.04.19a2.72 2.72 0 0 0 2.65 2.16h3.46c.8 0 1.63.24 2.17.84a1.5 1.5 0 0 0 2.24.05 3 3 0 0 1 2.13-.89h3.57c1.21 0 2.4-.97 2.64-2.16l.03-.15c.25-1.23-.06-2.55-.96-3.43a3.65 3.65 0 0 0-2.62-1.08Zm-8.36 0V4.51c0-.77.63-1.4 1.4-1.4h2.13c.77 0 1.4.63 1.4 1.4v1.07H9.53Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={cls}>
      <path d="M17.96 5.5H6.04A3.79 3.79 0 0 0 2.25 9.29v8.67a3.79 3.79 0 0 0 3.79 3.79h11.92a3.79 3.79 0 0 0 3.79-3.79V9.29A3.79 3.79 0 0 0 17.96 5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m2.25 9.82.13.65a3.28 3.28 0 0 0 3.19 2.61h3.37c.57 0 1.13.23 1.53.63a2.16 2.16 0 0 0 3.06 0c.41-.41.96-.63 1.53-.63h3.37c1.46 0 2.9-1.17 3.18-2.61l.13-.65" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8.75 5.5V4.42a2.17 2.17 0 0 1 2.17-2.17h2.17a2.17 2.17 0 0 1 2.17 2.17V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function SociaIcon({ className, filled }: IconProps) {
  const cls = className ?? base;
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M12.26 7.17 18.16 9.53l-5.9 2.36-2.37 5.87-2.35-5.87-5.89-2.33 5.89-2.39L9.88 1.25l2.38 5.92Z" />
        <path d="m19.62 16.86.99.4c1.11.44 1.87.69 1.87.69l-2.87 1.32-1.12 2.53-1.28-2.53-.99-.4c-1.11-.44-2.24-.89-2.24-.89l3.24-1.12.4-.99c.44-1.11.81-1.91.81-1.91l1.19 2.9Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 25" fill="none" className={cls}>
      <path d="m12.76 8.04 5.9 2.36-5.9 2.36-2.37 5.87-2.35-5.87-5.89-2.33 5.89-2.39 2.34-5.92 2.38 5.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path d="m20.12 17.74.99.4c1.11.44 1.87.69 1.87.69l-2.87 1.32-1.12 2.53-1.28-2.53-.99-.4c-1.11-.44-2.24-.89-2.24-.89l3.24-1.12.4-.99c.44-1.11.81-1.91.81-1.91l1.19 2.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function ProductivityIcon({ className, filled }: IconProps) {
  const cls = className ?? base;
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cls}>
        <path d="M12 2a4.75 4.75 0 0 0-4.75 4.75A4.75 4.75 0 0 0 11.88 11.49h.29A4.75 4.75 0 0 0 16.75 6.75 4.75 4.75 0 0 0 12 2Z" />
        <path d="M17.08 14.15c-2.79-1.86-7.34-1.86-10.15 0-1.27.85-1.97 2-1.97 3.23s.7 2.37 1.96 3.21c1.4.94 3.24 1.41 5.08 1.41s3.68-.47 5.08-1.41c1.26-.85 1.96-1.99 1.96-3.23-.01-1.23-.7-2.37-1.96-3.21Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={cls}>
      <path d="M12.16 10.87h-.32C9.45 10.79 7.56 8.84 7.56 6.44a4.44 4.44 0 1 1 8.88 0c-.01 2.4-1.9 4.35-4.28 4.43Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.16 14.56c-2.42 1.62-2.42 4.26 0 5.87 2.75 1.84 7.26 1.84 10.01 0 2.42-1.62 2.42-4.26 0-5.87-2.74-1.83-7.25-1.83-10.01 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function GrowIcon({ className, filled }: IconProps) {
  const cls = className ?? base;
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={cls}>
        <path d="M6.5 15.28a7.78 7.78 0 1 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" fill="currentColor" fillOpacity="0.9" />
        <path d="M8.67 18.67h6.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        <path d="M9.78 22h4.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={cls}>
      <path d="M6.5 15.28a7.78 7.78 0 1 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M8.67 18.67h6.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M9.78 22h4.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
