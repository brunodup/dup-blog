'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  countWords,
  hasContent,
  loadRoteiros,
  removeRoteiro,
  roteiroToText,
  spokenSeconds,
  upsertRoteiro,
  type Roteiro,
} from './roteiroStorage'

const RITMOS = [
  { label: 'pausado', ppm: 110 },
  { label: 'natural', ppm: 140 },
  { label: 'acelerado', ppm: 170 },
]

const ALVOS = [15, 30, 60, 90]

const SECTIONS: { key: 'hook' | 'dev' | 'cta'; label: string; hint: string; rows: number }[] = [
  { key: 'hook', label: 'hook', hint: 'os primeiros 2 segundos — o motivo de não pular o vídeo', rows: 2 },
  { key: 'dev', label: 'desenvolvimento', hint: 'a entrega — uma ideia por frase, corta o resto', rows: 6 },
  { key: 'cta', label: 'cta', hint: 'o que a pessoa faz depois de assistir', rows: 2 },
]

const fresh = (): Roteiro => ({ id: '', title: '', hook: '', dev: '', cta: '', updatedAt: 0 })

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-black rounded-md px-4 py-2 text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-150"
    >
      {children}
    </button>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] font-mono uppercase tracking-widest rounded-full px-3 py-1 border transition-colors duration-150 ${
        active ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-400 hover:text-black'
      }`}
    >
      {children}
    </button>
  )
}

export default function RoteiroReels() {
  const router = useRouter()
  const [cur, setCur] = useState<Roteiro>(fresh)
  const [list, setList] = useState<Roteiro[]>([])
  const [ppm, setPpm] = useState(140)
  const [alvo, setAlvo] = useState(60)
  const [copied, setCopied] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setList(loadRoteiros())
  }, [])

  // Auto-save com debounce — só depois que existe conteúdo.
  useEffect(() => {
    if (!hasContent(cur)) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const withId = cur.id ? cur : { ...cur, id: crypto.randomUUID() }
      const saved = { ...withId, updatedAt: Date.now() }
      if (!cur.id) setCur(saved)
      setList(upsertRoteiro(saved))
    }, 400)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [cur])

  const set = (patch: Partial<Roteiro>) => setCur((c) => ({ ...c, ...patch }))

  const totalWords = countWords(cur.hook) + countWords(cur.dev) + countWords(cur.cta)
  const totalSecs = spokenSeconds(totalWords, ppm)
  const pct = Math.min(100, (totalSecs / alvo) * 100)
  const over = totalSecs - alvo

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(roteiroToText(cur))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard bloqueado — ignora
    }
  }

  const abrirTeleprompter = () => {
    if (!cur.id) return
    router.push(`/ferramentas/teleprompter?roteiro=${cur.id}`)
  }

  const excluir = (id: string) => {
    setList(removeRoteiro(id))
    if (cur.id === id) setCur(fresh())
  }

  return (
    <div className="max-w-[680px]">
      {/* ritmo + alvo */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mr-1">ritmo</span>
          {RITMOS.map((r) => (
            <Chip key={r.ppm} active={ppm === r.ppm} onClick={() => setPpm(r.ppm)}>
              {r.label}
            </Chip>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mr-1">alvo</span>
          {ALVOS.map((a) => (
            <Chip key={a} active={alvo === a} onClick={() => setAlvo(a)}>
              {a}s
            </Chip>
          ))}
        </div>
      </div>

      {/* título */}
      <input
        type="text"
        value={cur.title}
        onChange={(e) => set({ title: e.target.value })}
        placeholder="título do roteiro"
        className="w-full text-lg font-medium text-black placeholder:text-gray-300 outline-none mb-8"
      />

      {/* seções */}
      <div className="space-y-6">
        {SECTIONS.map((s) => {
          const w = countWords(cur[s.key])
          return (
            <div key={s.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <label
                  htmlFor={`sec-${s.key}`}
                  className="text-[11px] font-mono uppercase tracking-widest text-gray-400"
                >
                  {s.label}
                </label>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-300">
                  {w > 0 ? `${w} palavras · ~${spokenSeconds(w, ppm)}s` : s.hint}
                </span>
              </div>
              <textarea
                id={`sec-${s.key}`}
                value={cur[s.key]}
                onChange={(e) => set({ [s.key]: e.target.value })}
                rows={s.rows}
                className="w-full border border-gray-200 rounded-md p-3 text-sm leading-relaxed text-[#333] placeholder:text-gray-300 outline-none focus:border-black transition-colors resize-y"
              />
            </div>
          )
        })}
      </div>

      {/* duração total */}
      <div className="mt-8">
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-black rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-[11px] font-mono uppercase tracking-widest text-gray-400">
          ~{totalSecs}s de {alvo}s
          {over > 0 && <span className="text-black font-medium"> · estourou {over}s — corta sem dó</span>}
        </p>
      </div>

      {/* ações */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Btn onClick={copiar}>{copied ? 'copiado' : 'copiar roteiro'}</Btn>
        {cur.id && hasContent(cur) && (
          <Btn onClick={abrirTeleprompter}>abrir no teleprompter</Btn>
        )}
        <Btn onClick={() => setCur(fresh())}>novo roteiro</Btn>
      </div>

      {/* salvos */}
      {list.length > 0 && (
        <div className="mt-14 pt-8 border-t border-gray-100">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-4">
            Salvos neste navegador
          </h2>
          <ul className="space-y-1">
            {list.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 group">
                <button
                  type="button"
                  onClick={() => setCur(r)}
                  className={`text-left text-sm leading-snug py-1 hover:underline underline-offset-2 truncate ${
                    r.id === cur.id ? 'text-black font-medium' : 'text-[#555]'
                  }`}
                >
                  {r.title.trim() || roteiroToText(r).slice(0, 40) || 'sem título'}
                </button>
                <button
                  type="button"
                  onClick={() => excluir(r.id)}
                  className="text-[10px] font-mono uppercase tracking-widest text-gray-300 hover:text-black transition-colors shrink-0"
                >
                  excluir
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
