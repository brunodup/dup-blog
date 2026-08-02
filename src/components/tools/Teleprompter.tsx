'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { loadRoteiros, roteiroToText, type Roteiro } from './roteiroStorage'

const TEXT_KEY = 'dup-tools:teleprompter-texto'

function CtrlBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="border border-white/40 rounded-md px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-white/80 hover:bg-white hover:text-black transition-colors duration-150"
    >
      {children}
    </button>
  )
}

export default function Teleprompter() {
  const [text, setText] = useState('')
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [fontSize, setFontSize] = useState(56)
  const [speed, setSpeed] = useState(55) // px por segundo
  const [mirror, setMirror] = useState(false)
  const [running, setRunning] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const viewportRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const playingRef = useRef(false)
  const speedRef = useRef(speed)
  speedRef.current = speed

  // Carrega roteiros salvos + texto anterior + ?roteiro= da URL.
  useEffect(() => {
    const saved = loadRoteiros()
    setRoteiros(saved)
    const params = new URLSearchParams(window.location.search)
    const id = params.get('roteiro')
    const fromRoteiro = id ? saved.find((r) => r.id === id) : null
    if (fromRoteiro) {
      setText(roteiroToText(fromRoteiro))
    } else {
      try {
        setText(window.localStorage.getItem(TEXT_KEY) ?? '')
      } catch {
        // storage bloqueado — começa vazio
      }
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(TEXT_KEY, text)
    } catch {
      // storage bloqueado — segue sem persistir
    }
  }, [text])

  const applyOffset = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${-offsetRef.current}px) ${mirror ? 'scaleX(-1)' : ''}`
    }
  }, [mirror])

  // Loop de rolagem.
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      if (playingRef.current && contentRef.current && viewportRef.current) {
        offsetRef.current += speedRef.current * dt
        const max = contentRef.current.scrollHeight
        if (offsetRef.current >= max) {
          offsetRef.current = max
          playingRef.current = false
          setPlaying(false)
        }
        applyOffset()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, applyOffset])

  const start = () => {
    if (!text.trim()) return
    offsetRef.current = 0
    setRunning(true)
    setCountdown(3)
  }

  // Contagem 3-2-1 antes de rolar.
  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      setCountdown(null)
      playingRef.current = true
      setPlaying(true)
      return
    }
    const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 800)
    return () => clearTimeout(t)
  }, [countdown])

  const togglePlay = useCallback(() => {
    playingRef.current = !playingRef.current
    setPlaying(playingRef.current)
  }, [])

  const exit = useCallback(() => {
    playingRef.current = false
    setPlaying(false)
    setRunning(false)
    setCountdown(null)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])

  const restart = useCallback(() => {
    offsetRef.current = 0
    applyOffset()
    setCountdown(3)
    playingRef.current = false
    setPlaying(false)
  }, [applyOffset])

  // Teclado no modo rodando.
  useEffect(() => {
    if (!running) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'Escape') {
        exit()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSpeed((s) => Math.min(200, s + 5))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSpeed((s) => Math.max(10, s - 5))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, togglePlay, exit])

  const fullscreen = () => {
    const el = document.documentElement
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else el.requestFullscreen?.().catch(() => {})
  }

  if (running) {
    return (
      <div className="fixed inset-0 z-50 bg-black overflow-hidden select-none">
        {/* faixa de leitura */}
        <div className="absolute top-[38%] left-0 right-0 h-px bg-white/20 z-10" aria-hidden="true" />

        <div ref={viewportRef} className="absolute inset-0 overflow-hidden">
          <div
            ref={contentRef}
            className="text-white font-medium leading-snug whitespace-pre-wrap px-[8vw] pt-[38vh] pb-[80vh]"
            style={{ fontSize, transform: mirror ? 'scaleX(-1)' : undefined }}
          >
            {text}
          </div>
        </div>

        {countdown !== null && countdown > 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
            <span className="text-white font-switzer font-semibold text-[8rem]">{countdown}</span>
          </div>
        )}

        {/* controles */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-2 p-4 bg-gradient-to-t from-black to-transparent">
          <CtrlBtn onClick={togglePlay} title="espaço">{playing ? 'pausar' : 'rolar'}</CtrlBtn>
          <CtrlBtn onClick={() => setSpeed((s) => Math.max(10, s - 5))} title="↓">- vel</CtrlBtn>
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 px-1">{speed}</span>
          <CtrlBtn onClick={() => setSpeed((s) => Math.min(200, s + 5))} title="↑">+ vel</CtrlBtn>
          <CtrlBtn onClick={() => setFontSize((f) => Math.max(24, f - 8))}>- fonte</CtrlBtn>
          <CtrlBtn onClick={() => setFontSize((f) => Math.min(120, f + 8))}>+ fonte</CtrlBtn>
          <CtrlBtn onClick={() => setMirror((m) => !m)}>{mirror ? 'normal' : 'espelhar'}</CtrlBtn>
          <CtrlBtn onClick={restart}>reiniciar</CtrlBtn>
          <CtrlBtn onClick={fullscreen}>tela cheia</CtrlBtn>
          <CtrlBtn onClick={exit} title="esc">sair</CtrlBtn>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[680px]">
      {roteiros.length > 0 && (
        <div className="mb-6">
          <label
            htmlFor="importar-roteiro"
            className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1.5"
          >
            importar roteiro salvo
          </label>
          <select
            id="importar-roteiro"
            defaultValue=""
            onChange={(e) => {
              const r = roteiros.find((x) => x.id === e.target.value)
              if (r) setText(roteiroToText(r))
            }}
            className="w-full border border-gray-200 rounded-md p-3 text-sm text-[#333] outline-none focus:border-black transition-colors bg-white"
          >
            <option value="" disabled>
              escolher um roteiro…
            </option>
            {roteiros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title.trim() || roteiroToText(r).slice(0, 40) || 'sem título'}
              </option>
            ))}
          </select>
        </div>
      )}

      <label
        htmlFor="texto-teleprompter"
        className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1.5"
      >
        texto
      </label>
      <textarea
        id="texto-teleprompter"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="cola aqui o que você vai falar…"
        className="w-full border border-gray-200 rounded-md p-3 text-sm leading-relaxed text-[#333] placeholder:text-gray-300 outline-none focus:border-black transition-colors resize-y bg-white"
      />

      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={start}
          disabled={!text.trim()}
          className="border border-black rounded-md px-5 py-2.5 text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
        >
          começar
        </button>
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-300">
          espaço rola/pausa · setas mudam a velocidade · esc sai
        </span>
      </div>
    </div>
  )
}
