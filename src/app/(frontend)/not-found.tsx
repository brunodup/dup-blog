import Link from 'next/link'

import LogoLink from '@/components/LogoLink'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <LogoLink className="board-title text-black select-none" />
      <div className="w-[95%] mx-auto pt-2 md:w-auto md:max-w-[90vw] md:px-6">
        <div className="min-h-[60vh] flex flex-col items-start justify-center gap-4">
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400">404</p>
          <h1 className="font-switzer text-[1.75rem] font-semibold leading-tight tracking-tight text-black">
            Essa página não existe (ou saiu do mural).
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase text-gray-400 hover:text-black transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M9 12L4 7l5-5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            voltar pro mural
          </Link>
        </div>
      </div>
    </div>
  )
}
