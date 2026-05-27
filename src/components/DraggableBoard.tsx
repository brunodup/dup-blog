'use client'

import type { Media, Post } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import LogoLink from '@/components/LogoLink'

// ── Safety zones ──────────────────────────────────────────────────────────
// Each zone is a rect in % units (relative to 100vw / 100vh).
//   1. Central title area: 35–65% × 20–80%
//   2. Bottom-centre menu: 22–78% × 80–100%  (covers the floor-menu on all viewports)
type Zone = { x1: number; x2: number; y1: number; y2: number }
const ZONES: Zone[] = [
  { x1: 35, x2: 65, y1: 20, y2: 80 },
  { x1: 22, x2: 78, y1: 80, y2: 100 },
]

function repelFromZone(x: number, y: number): { x: number; y: number } {
  for (const z of ZONES) {
    if (x <= z.x1 || x >= z.x2 || y <= z.y1 || y >= z.y2) continue
    const d = { l: x - z.x1, r: z.x2 - x, t: y - z.y1, b: z.y2 - y }
    const m = Math.min(d.l, d.r, d.t, d.b)
    if (m === d.l) return { x: z.x1, y }
    if (m === d.r) return { x: z.x2, y }
    if (m === d.t) return { x, y: z.y1 }
    return { x, y: z.y2 }
  }
  return { x, y }
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// ── Lexical plain-text extractor ──────────────────────────────────────────
type LNode = { type: string; text?: string; children?: LNode[]; [k: string]: unknown }

function lexToText(node: LNode): string {
  if (node.type === 'text') return String(node.text ?? '')
  if (!node.children?.length) return ''
  return node.children.map(lexToText).join(' ')
}

function bodySnippet(body: Post['body'], maxLen = 120): string {
  if (!body?.root) return ''
  const text = (body.root.children as LNode[])
    .map(lexToText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text
}

// ── Type helpers ──────────────────────────────────────────────────────────
function isMedia(m: unknown): m is Media {
  return typeof m === 'object' && m !== null && 'url' in m
}

// ── Post preview cards ────────────────────────────────────────────────────
// ── Shared card shell ─────────────────────────────────────────────────────────
// Shadow: subtle black-tinted drop so cards feel grounded on the dark bg.
const CARD_SHADOW = 'shadow-[0_2px_12px_rgba(0,0,0,0.55)]'

function ImageCard({ post }: { post: Post }) {
  const media = isMedia(post.media) ? post.media : null
  const src = media?.sizes?.thumbnail?.url || media?.url
  if (!src) return <TextCard post={post} />
  const w = media?.sizes?.thumbnail?.width || 160
  const h = media?.sizes?.thumbnail?.height || 160
  return (
    <div className={`w-[100px] h-[100px] md:w-40 md:h-40 rounded-md overflow-hidden bg-white ${CARD_SHADOW}`}>
      <Image
        src={src}
        alt={media?.alt || post.title || ''}
        width={w}
        height={h}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  )
}

function TextCard({ post }: { post: Post }) {
  const isQuote = post.type === 'quote'
  const snippet = bodySnippet(post.body, 100)
  return (
    <div
      className={[
        `w-[100px] md:w-44 rounded-md bg-white p-2 md:p-3 text-[10px] md:text-sm leading-snug ${CARD_SHADOW}`,
        isQuote ? 'border-l-[3px] border-black italic' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {post.title && (
        <p className="font-semibold text-[9px] md:text-[0.8125rem] tracking-tight truncate mb-0.5 text-black">
          {post.title}
        </p>
      )}
      {snippet && <p className="text-[#555] text-[8px] md:text-[0.75rem] line-clamp-3">{snippet}</p>}
      {!post.title && !snippet && (
        <p className="text-gray-400 text-xs uppercase tracking-widest">{post.type}</p>
      )}
    </div>
  )
}

function VideoCard({ post }: { post: Post }) {
  const media = isMedia(post.media) ? post.media : null
  return (
    <div className={`w-[100px] md:w-44 rounded-md overflow-hidden bg-neutral-900 ${CARD_SHADOW}`}>
      {media?.url ? (
        <video
          src={media.url}
          className="w-full h-16 md:h-28 object-cover"
          preload="none"
          muted
          playsInline
        />
      ) : (
        <div className="w-full h-16 md:h-28 bg-neutral-800 flex items-center justify-center">
          <span className="text-neutral-600 text-[10px] uppercase tracking-widest">video</span>
        </div>
      )}
      {post.title && (
        <p className="text-white text-[8px] md:text-[0.7rem] tracking-tight px-1.5 py-1 md:px-2.5 md:py-1.5 truncate">
          {post.title}
        </p>
      )}
    </div>
  )
}

function AudioCard({ post }: { post: Post }) {
  const bars = Array.from({ length: 28 }, (_, i) => {
    const h = 6 + Math.abs(Math.sin(i * 1.3) * 12 + Math.sin(i * 0.7 + 1) * 8)
    return { h: Math.max(3, Math.min(30, h)), i }
  })
  return (
    <div className={`w-[100px] md:w-44 rounded-md bg-white px-2 pt-2 pb-1.5 md:px-3 md:pt-3 md:pb-2.5 ${CARD_SHADOW}`}>
      <svg viewBox="0 0 154 34" className="w-full h-7" aria-hidden="true">
        {bars.map(({ h, i }) => (
          <rect
            key={i}
            x={i * 5.5 + 0.5}
            y={(34 - h) / 2}
            width={3}
            height={h}
            rx="1"
            fill="#111"
          />
        ))}
      </svg>
      {post.title && (
        <p className="text-[8px] md:text-[0.7rem] text-[#444] mt-1 md:mt-1.5 truncate">{post.title}</p>
      )}
    </div>
  )
}

function SnippetCard({ post }: { post: Post }) {
  const p = post as Post & { jsMode?: string; thumbnail?: unknown }
  const mode = p.jsMode ?? 'vanilla'
  const modeLabel: Record<string, string> = { vanilla: 'JS', jsx: 'JSX', threejs: 'THREE' }
  const thumb = isMedia(p.thumbnail) ? p.thumbnail : null
  const thumbSrc = thumb?.sizes?.thumbnail?.url ?? thumb?.url

  if (thumbSrc) {
    const tw = thumb?.sizes?.thumbnail?.width ?? 176
    const th = thumb?.sizes?.thumbnail?.height ?? 100
    return (
      <div className={`w-[100px] md:w-44 rounded-md overflow-hidden bg-neutral-950 ${CARD_SHADOW}`}>
        <div className="relative">
          <Image
            src={thumbSrc}
            alt={thumb?.alt || post.title || ''}
            width={tw}
            height={th}
            className="w-full h-14 md:h-24 object-cover"
            draggable={false}
          />
          <span className="absolute top-1.5 right-1.5 font-mono text-[8px] uppercase tracking-widest text-white/70 bg-black/50 px-1.5 py-0.5 rounded">
            {modeLabel[mode] ?? mode}
          </span>
        </div>
        {post.title && (
          <p className="text-white text-[0.75rem] font-mono leading-snug px-3 py-2 truncate">
            {post.title}
          </p>
        )}
      </div>
    )
  }

  // fallback — sem thumbnail
  const excerpt = bodySnippet(post.body, 100)
  return (
    <div className={`w-[100px] md:w-44 rounded-md bg-neutral-950 p-3 ${CARD_SHADOW}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          {modeLabel[mode] ?? mode}
        </span>
        <span className="font-mono text-[10px] text-neutral-600">{'{ }'}</span>
      </div>
      {post.title && (
        <p className="text-white text-[0.75rem] font-mono leading-snug mb-1">{post.title}</p>
      )}
      {excerpt && (
        <p className="text-neutral-500 text-[0.65rem] leading-snug line-clamp-3">{excerpt}</p>
      )}
    </div>
  )
}

function PostPreview({ post }: { post: Post }) {
  switch (post.type) {
    case 'image':   return <ImageCard post={post} />
    case 'quote':   return <TextCard post={post} />
    case 'video':   return <VideoCard post={post} />
    case 'audio':   return <AudioCard post={post} />
    case 'snippet': return <SnippetCard post={post} />
    default:        return <TextCard post={post} />
  }
}

// ── DraggableBoard ────────────────────────────────────────────────────────
interface Props {
  posts: Post[]
  videoSrc?: string
  videoPoster?: string
}

// 'hidden'  → off-screen, no transition (initial state)
// 'ready'   → off-screen, transition applied (one rAF before 'visible')
// 'visible' → in position, transition fires
type EntryState = 'hidden' | 'ready' | 'visible'

export default function DraggableBoard({ posts, videoSrc, videoPoster }: Props) {
  const router = useRouter()

  const [entryState, setEntryState] = useState<EntryState>('hidden')
  const [exitPhase, setExitPhase] = useState<0 | 1>(0)
  const [positions, setPositions] = useState<Record<number, { x: number; y: number }>>(() =>
    Object.fromEntries(posts.map((p) => [p.id, { x: p.position_x, y: p.position_y }])),
  )

  const boardRef = useRef<HTMLDivElement>(null)
  const bgVideoRef = useRef<HTMLVideoElement>(null)
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const dragRef = useRef<{
    postId: number
    startPx: number
    startPy: number
    startX: number
    startY: number
  } | null>(null)
  const didDragRef = useRef(false)
  const entryFiredRef = useRef(false)
  const playingToEndRef = useRef(false)
  const pendingPathRef = useRef<string | null>(null)

  const triggerEntry = useCallback(() => {
    if (entryFiredRef.current) return
    entryFiredRef.current = true
    setEntryState('ready')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntryState('visible'))
    })
  }, [])

  // Pausa em 7s e dispara entrada dos cards em 4s.
  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    if (!playingToEndRef.current && video.currentTime >= 6.5) {
      video.pause()
    }
    if (!entryFiredRef.current && video.currentTime >= 4) {
      triggerEntry()
    }
  }, [triggerEntry])

  // Quando o vídeo terminar, navega pro link que o usuário clicou.
  const handleVideoEnded = useCallback(() => {
    if (pendingPathRef.current) {
      router.push(pendingPathRef.current)
    }
  }, [router])

  // Intercepta cliques em links do board: segura a navegação, dá play no
  // vídeo até o final e navega quando ele terminar.
  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const onBoardClick = (e: MouseEvent) => {
      if (playingToEndRef.current) return
      if (didDragRef.current) return
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      e.preventDefault()
      e.stopPropagation()
      const url = new URL((anchor as HTMLAnchorElement).href)
      pendingPathRef.current = url.pathname + url.search + url.hash
      playingToEndRef.current = true
      bgVideoRef.current?.play()
      setExitPhase(1)
    }
    board.addEventListener('click', onBoardClick, { capture: true })
    return () => board.removeEventListener('click', onBoardClick, { capture: true })
  }, [])

  // Se não tiver vídeo, dispara a entrada depois de um delay curto.
  useEffect(() => {
    if (!videoSrc) {
      const t = setTimeout(triggerEntry, 400)
      return () => clearTimeout(t)
    }
  }, [videoSrc, triggerEntry])

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, postId: number) => {
      if (entryState !== 'visible') return
      e.preventDefault()
      const pos = positions[postId]!
      const pt = 'touches' in e ? e.touches[0]! : e
      dragRef.current = {
        postId,
        startPx: pt.clientX,
        startPy: pt.clientY,
        startX: pos.x,
        startY: pos.y,
      }
      didDragRef.current = false
    },
    [entryState, positions],
  )

  // Direct DOM mutation during drag — no React re-render per pixel.
  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragRef.current || !boardRef.current) return
    e.preventDefault()
    const pt = 'touches' in e ? (e as TouchEvent).touches[0]! : (e as MouseEvent)
    const { offsetWidth: W, offsetHeight: H } = boardRef.current
    const dx = ((pt.clientX - dragRef.current.startPx) / W) * 100
    const dy = ((pt.clientY - dragRef.current.startPy) / H) * 100
    const x = clamp(dragRef.current.startX + dx, 0, 100)
    const y = clamp(dragRef.current.startY + dy, 0, 100)
    const el = cardRefs.current.get(dragRef.current.postId)
    if (el) {
      el.style.left = `${x}%`
      el.style.top = `${y}%`
    }
    didDragRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current) return
    const { postId } = dragRef.current
    dragRef.current = null
    const el = cardRefs.current.get(postId)
    if (!el) return

    const rawX = parseFloat(el.style.left)
    const rawY = parseFloat(el.style.top)
    const { x, y } = repelFromZone(rawX, rawY)
    const fx = Math.round(x * 100) / 100
    const fy = Math.round(y * 100) / 100

    el.style.left = `${fx}%`
    el.style.top = `${fy}%`

    setPositions((prev) => ({ ...prev, [postId]: { x: fx, y: fy } }))

    fetch(`/api/post-position/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position_x: fx, position_y: fy }),
    }).catch(() => {})
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove, { passive: false })
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchend', handlePointerUp)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  // Bloqueia scroll, pull-to-refresh e overscroll do browser na home.
  useEffect(() => {
    const html = document.documentElement
    const { body } = document
    const prevHtmlOverscroll = html.style.overscrollBehavior
    const prevBodyOverscroll = body.style.overscrollBehavior
    const prevBodyOverflow = body.style.overflow
    html.style.overscrollBehavior = 'none'
    body.style.overscrollBehavior = 'none'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overscrollBehavior = prevHtmlOverscroll
      body.style.overscrollBehavior = prevBodyOverscroll
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  return (
    <div
      ref={boardRef}
      className="relative w-screen h-screen overflow-hidden bg-white select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Layer 1 — vídeo com fundo branco. Drives playback + entry trigger (60%). */}
      <video
        ref={bgVideoRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 1 }}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={videoPoster}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnded}
      >
        {videoSrc && <source src={videoSrc} />}
      </video>

      {/* Layer 2 — texto BRUNODUP.COM em preto. */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ zIndex: 2 }}
      >
        <LogoLink className="board-title text-black" />
      </div>

      {/* Layer 3 — posts, on top so they stay draggable/clickable. */}
      {posts.map((post, i) => {
        const pos = positions[post.id]!
        const delay = 0.45 + i * 0.07

        return (
          <div
            key={post.id}
            ref={(el) => {
              if (el) cardRefs.current.set(post.id, el)
              else cardRefs.current.delete(post.id)
            }}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform:
                exitPhase === 1
                  ? 'scale(1.6) translateY(-80vh)'
                  : entryState === 'visible'
                    ? 'translateY(0)'
                    : 'translateY(-120vh)',
              opacity: exitPhase === 1 ? 0 : 1,
              transition:
                exitPhase === 1
                  ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease'
                  : entryState === 'hidden'
                    ? 'none'
                    : `transform ${delay}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
              cursor: entryState === 'visible' && exitPhase === 0 ? 'grab' : 'default',
              zIndex: 10,
            }}
            onMouseDown={(e) => handleDragStart(e, post.id)}
            onTouchStart={(e) => handleDragStart(e, post.id)}
          >
            <Link
              href={`/post/${post.slug ?? post.id}`}
              onClick={(e) => {
                if (didDragRef.current) {
                  e.preventDefault()
                  didDragRef.current = false
                }
              }}
              draggable={false}
              style={{ display: 'block', outline: 'none' }}
            >
              <div className="hover:scale-[1.03] active:scale-[0.98] transition-transform duration-150">
                <PostPreview post={post} />
              </div>
            </Link>
          </div>
        )
      })}

      {/* Menu — perspectiva de piso, 3×2, centralizado no bottom */}
      <div
        className="floor-menu absolute left-1/2 pointer-events-none"
        style={{ bottom: 5, zIndex: 20, transform: 'translateX(-50%)' }}
      >
        <nav
          className="pointer-events-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, auto)',
            gap: 12,
            transform: 'perspective(500px) rotateX(44deg)',
            transformOrigin: 'bottom center',
          }}
        >
          {['Home', 'Sobre', 'Nômade', 'Dup.Agency', 'Dup.Labs', 'Contato'].map((label) => (
            <button
              key={label}
              className="floor-btn font-switzer font-bold text-black bg-transparent uppercase"
              style={{ border: '4px solid black', padding: '14px 32px', fontSize: '1.05rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
