'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface Props {
  src: string
  alt: string
  width: number
  height: number
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="w-4 h-4 md:w-6 md:h-6">
      <path d="M4 4L20 20M20 4L4 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function ImageWithModal({ src, alt, width, height }: Props) {
  const [open, setOpen] = useState(false)

  // Fecha com Escape e bloqueia scroll do body
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      {/* Imagem no post — clicável */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto block cursor-zoom-in"
        priority
        onClick={() => setOpen(true)}
      />

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-[15px] md:p-[20px]"
          style={{
            background: 'rgba(255, 255, 255, 0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          onClick={() => setOpen(false)}
        >
          {/* Botão fechar — canto superior direito */}
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setOpen(false)}
            className="absolute top-0 right-0 flex items-center justify-center bg-black
                       w-[30px] h-[30px] md:w-[60px] md:h-[60px]"
          >
            <CloseIcon />
          </button>

          {/* Imagem — ocupa o espaço disponível sem ultrapassar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      )}
    </>
  )
}
