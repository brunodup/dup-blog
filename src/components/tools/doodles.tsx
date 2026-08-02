// Rabiscos SVG da landing de ferramentas — traço solto, sempre currentColor.

export function DoodleArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10 C 18 30, 38 34, 56 22 M56 22 l-9 -1.5 M56 22 l-3.5 8.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DoodleCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 52" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 28 C 10 12, 52 5, 92 8 C 126 11, 136 26, 122 38 C 102 49, 28 47, 16 36 C 10 30, 34 20, 66 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DoodleUnderline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 10" fill="none" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path
        d="M2 7 C 20 2, 40 9, 60 5 C 80 1, 100 8, 118 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DoodleSpark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v6 M12 15v6 M3 12h6 M15 12h6 M6 6l4 4 M14 14l4 4 M18 6l-4 4 M10 14l-4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Número de passo com círculo rabiscado em volta. */
export function DoodleStep({ n, className }: { n: number; className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center w-10 h-10 ${className ?? ''}`}>
      <svg viewBox="0 0 40 40" fill="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path
          d="M20 4 C 30 3, 37 10, 36 20 C 35 31, 28 37, 19 36 C 9 35, 3 28, 4 19 C 5 9, 12 5, 22 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-mono text-sm text-black">{n}</span>
    </span>
  )
}
