'use client'

import { useRouter } from 'next/navigation'
import { useTopLoader } from 'nextjs-toploader'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  poster?: string
  pauseAt?: number
  /** Renderizado por cima do vídeo, fora da área que esmaece na saída — pro logo, por exemplo. */
  persistent?: React.ReactNode
  children: React.ReactNode
}

export default function VideoBackdrop({ src, poster, pauseAt = 2.2, persistent, children }: Props) {
  const router = useRouter()
  const topLoader = useTopLoader()

  const [exiting, setExiting] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)
  const erroredRef = useRef(false)
  const navigatedRef = useRef(false)
  const pendingPathRef = useRef<string | null>(null)

  // Navegação idempotente: dispara uma vez só, venha do onEnded do vídeo,
  // do fallback, ou direto (se o vídeo já tiver dado erro antes).
  const navigate = useCallback(() => {
    if (navigatedRef.current || !pendingPathRef.current) return
    navigatedRef.current = true
    topLoader.start()
    router.push(pendingPathRef.current)
  }, [router, topLoader])

  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = e.currentTarget
      if (!exitingRef.current && video.currentTime >= pauseAt) {
        video.pause()
      }
    },
    [pauseAt],
  )

  const handleEnded = useCallback(() => {
    navigate()
  }, [navigate])

  const handleError = useCallback(() => {
    erroredRef.current = true
  }, [])

  // Intercepta cliques em links internos dentro do conteúdo: segura a
  // navegação, dá play no vídeo até o final e navega quando ele terminar.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const onContentClick = (e: MouseEvent) => {
      if (exitingRef.current) return
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const url = new URL((anchor as HTMLAnchorElement).href)
      if (url.hostname !== window.location.hostname) return  // externo → browser trata
      if ((anchor as HTMLAnchorElement).target === '_blank') return

      e.preventDefault()
      e.stopPropagation()

      pendingPathRef.current = url.pathname + url.search + url.hash
      exitingRef.current = true
      setExiting(true)

      // Se o vídeo já tiver dado erro antes, navega direto — não trava o clique.
      if (erroredRef.current) {
        navigate()
        return
      }

      const video = videoRef.current
      if (!video) {
        navigate()
        return
      }
      const played = video.play()
      if (played && typeof played.catch === 'function') played.catch(() => navigate())
      window.setTimeout(navigate, 4000)
    }
    content.addEventListener('click', onContentClick, { capture: true })
    return () => content.removeEventListener('click', onContentClick, { capture: true })
  }, [navigate])

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden>
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={handleError}
        />
      </div>
      {persistent && <div className="relative z-20">{persistent}</div>}
      <div
        ref={contentRef}
        className={`relative z-10 transition-opacity duration-500${exiting ? ' opacity-0' : ''}`}
      >
        {children}
      </div>
    </>
  )
}
