'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'dup:blog-intro-vista'

export default function BlogIntro() {
  const [show, setShow] = useState(false)
  const [fading, setFading] = useState(false)
  const dismissedRef = useRef(false)

  useEffect(() => {
    let shouldShow = true

    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        shouldShow = false
      }
    } catch {
      // storage indisponível — mostra assim mesmo
    }

    if (shouldShow && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      shouldShow = false
    }

    if (!shouldShow) return

    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // não conseguiu gravar — mostra assim mesmo
    }

    setShow(true)
  }, [])

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setFading(true)
    window.setTimeout(() => setShow(false), 550)
  }, [])

  useEffect(() => {
    if (!show) return
    // Segurança: autoplay bloqueado (ou vídeo travado) não pode prender a página.
    const t = window.setTimeout(dismiss, 6500)
    return () => clearTimeout(t)
  }, [show, dismiss])

  if (!show) return null

  return (
    <div className={`fixed inset-0 z-[60] bg-black transition-opacity duration-500${fading ? ' opacity-0' : ''}`}>
      <video
        src="/bg-blog.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        onTimeUpdate={(e) => {
          if (e.currentTarget.currentTime >= 2.5) dismiss()
        }}
        onEnded={dismiss}
        onError={dismiss}
      />
      <button
        type="button"
        onClick={dismiss}
        className="absolute bottom-6 right-6 text-[11px] font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors"
      >
        pular
      </button>
    </div>
  )
}
