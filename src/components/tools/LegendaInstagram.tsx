'use client'

import { useMemo, useState } from 'react'

import { evaluateCaption, scoreOf, type RuleResult } from './captionRules'

const REDES = [
  { key: 'instagram', label: 'instagram', max: 2200, cut: 125 },
  { key: 'tiktok', label: 'tiktok', max: 2200, cut: null },
  { key: 'x', label: 'x/twitter', max: 280, cut: null },
  { key: 'youtube', label: 'youtube', max: 5000, cut: null },
] as const

type RedeKey = (typeof REDES)[number]['key']

const MAX_HASHTAGS_IG = 30

/**
 * O Instagram descarta quebras de linha quando a linha termina com espaço e
 * colapsa linhas vazias. A formatação limpa os espaços no fim de cada linha e
 * preenche as vazias com um caractere invisível (braille em branco, U+2800).
 */
function formatCaption(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{2,}/g, (m) => '\n' + '⠀\n'.repeat(m.length - 1))
    .trim()
}

const countHashtags = (text: string): number => (text.match(/#[^\s#]+/g) ?? []).length

const RULE_MARK: Record<RuleResult['status'], { mark: string; cls: string }> = {
  ok: { mark: '✓', cls: 'text-black' },
  warn: { mark: '!', cls: 'text-black font-medium' },
  tip: { mark: '·', cls: 'text-gray-400' },
  idle: { mark: '○', cls: 'text-gray-300' },
}

function Checklist({ results }: { results: RuleResult[] }) {
  const { ok, total } = scoreOf(results)
  const idle = results.every((r) => r.status === 'idle')
  return (
    <div className="mt-6 border border-gray-100 rounded-md p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-gray-400">
          estrutura da legenda
        </h2>
        {!idle && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400">
            {ok}/{total}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {results.map((r) => {
          const m = RULE_MARK[r.status]
          return (
            <li key={r.key} className="flex gap-2.5 items-baseline">
              <span className={`font-mono text-xs w-3 shrink-0 text-center ${m.cls}`}>{m.mark}</span>
              <span className="text-sm leading-snug">
                <span className={`font-mono text-[11px] uppercase tracking-widest mr-2 ${m.cls}`}>
                  {r.label}
                </span>
                <span className={r.status === 'idle' ? 'text-gray-300' : 'text-[#555]'}>{r.msg}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
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

export default function LegendaInstagram() {
  const [text, setText] = useState('')
  const [rede, setRede] = useState<RedeKey>('instagram')
  const [copied, setCopied] = useState(false)

  const conf = REDES.find((r) => r.key === rede)!
  const formatted = useMemo(() => formatCaption(text), [text])
  const chars = formatted.length
  const over = chars - conf.max
  const hashtags = countHashtags(text)
  const preview = conf.cut ? formatted.replace(/\n/g, ' ').slice(0, conf.cut) : null
  const rules = useMemo(
    () => evaluateCaption(text, { cut: conf.cut, max: conf.max, chars }),
    [text, conf.cut, conf.max, chars],
  )

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard bloqueado — ignora
    }
  }


  return (
    <div className="max-w-[680px]">
      {/* rede */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mr-1">rede</span>
        {REDES.map((r) => (
          <Chip key={r.key} active={rede === r.key} onClick={() => setRede(r.key)}>
            {r.label}
          </Chip>
        ))}
      </div>

      {/* texto */}
      <label
        htmlFor="legenda"
        className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1.5"
      >
        legenda
      </label>
      <textarea
        id="legenda"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={9}
        placeholder={'escreve a legenda aqui…\n\nquebra de linha do jeito que você quer que apareça — a formatação segura elas no lugar.'}
        className="w-full border border-gray-200 rounded-md p-3 text-sm leading-relaxed text-[#333] placeholder:text-gray-300 outline-none focus:border-black transition-colors resize-y bg-white"
      />

      {/* contadores */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] font-mono uppercase tracking-widest text-gray-400">
        <span className={over > 0 ? 'text-black font-medium' : undefined}>
          {chars}/{conf.max} caracteres
          {over > 0 && ` · passou ${over}`}
        </span>
        {hashtags > 0 && (
          <span className={rede === 'instagram' && hashtags > MAX_HASHTAGS_IG ? 'text-black font-medium' : undefined}>
            {hashtags} hashtag{hashtags === 1 ? '' : 's'}
            {rede === 'instagram' && hashtags > MAX_HASHTAGS_IG && ` · o limite é ${MAX_HASHTAGS_IG}`}
          </span>
        )}
      </div>

      {/* critérios de boa legenda — regras fixas, avaliadas ao digitar */}
      <Checklist results={rules} />

      {/* preview do corte */}
      {preview !== null && text.trim() && (
        <div className="mt-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1.5">
            o que aparece antes do “…mais”
          </p>
          <div className="border border-gray-200 rounded-md p-3 text-sm leading-relaxed text-[#333]">
            {preview}
            <span className="text-gray-300"> …mais</span>
          </div>
        </div>
      )}

      {/* ação */}
      <div className="flex flex-wrap items-center gap-3 mt-6">
        <button
          type="button"
          onClick={copiar}
          disabled={!formatted}
          className="border border-black rounded-md px-5 py-2.5 text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
        >
          {copied ? 'copiado' : 'copiar formatada'}
        </button>
        <span className="text-[11px] font-mono uppercase tracking-widest text-gray-300">
          cola direto no app — as quebras ficam
        </span>
      </div>
    </div>
  )
}
