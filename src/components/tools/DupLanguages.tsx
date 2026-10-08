'use client'

import { useEffect, useRef, useState } from 'react'

type LangKey = 'es-es' | 'es-la' | 'en-us' | 'en-uk' | 'fr' | 'it' | 'de' | 'other'
type Lang = { name: string; label: string; variant: string }

const LANGS: Record<Exclude<LangKey, 'other'>, Lang> = {
  'es-es': { name: 'Espanhol', label: 'ESPANHOL', variant: 'Foco no castelhano falado na Espanha (vosotros, vocabulário e expressões de lá).' },
  'es-la': { name: 'Espanhol', label: 'ESPANHOL', variant: 'Foco no espanhol da América Latina (ustedes, vocabulário e expressões de lá).' },
  'en-us': { name: 'Inglês', label: 'INGLÊS', variant: 'Foco no inglês americano (vocabulário, gírias e expressões dos EUA).' },
  'en-uk': { name: 'Inglês', label: 'INGLÊS', variant: 'Foco no inglês britânico (vocabulário, gírias e expressões do Reino Unido).' },
  fr: { name: 'Francês', label: 'FRANCÊS', variant: '' },
  it: { name: 'Italiano', label: 'ITALIANO', variant: '' },
  de: { name: 'Alemão', label: 'ALEMÃO', variant: '' },
}

const LANG_OPTIONS: { value: LangKey; label: string }[] = [
  { value: 'es-es', label: 'Espanhol da Espanha' },
  { value: 'es-la', label: 'Espanhol da América Latina' },
  { value: 'en-us', label: 'Inglês americano' },
  { value: 'en-uk', label: 'Inglês britânico' },
  { value: 'fr', label: 'Francês' },
  { value: 'it', label: 'Italiano' },
  { value: 'de', label: 'Alemão' },
  { value: 'other', label: 'Outro' },
]

const DURATIONS = ['10 a 15 min', '20 a 30 min', '40 a 50 min']

const RULES = [
  { key: 'invisible', title: 'Método invisível', desc: 'Ele puxa assunto como amigo e ensina no meio da conversa. A estrutura fica nos bastidores e você vive só o papo.' },
  { key: 'short', title: 'Mensagens curtas', desc: 'Uma pergunta pequena por vez. Textão logo de cara cansa e dá vontade de fechar o app.' },
  { key: 'paren', title: 'Parênteses pra pedir ajuda', desc: 'Faltou uma palavra? Escreve ela em português entre parênteses no meio da frase. Ex: "Quiero (alugar) un piso". Ele te mostra a palavra certa (alquilar) e reescreve a frase inteira corrigida antes de seguir.' },
  { key: 'immersion', title: 'Tudo no idioma', desc: 'A mensagem inteira vem no idioma que você está aprendendo, inclusive as correções. Português só se você pedir.' },
  { key: 'grammar', title: 'Gramática quando precisar', desc: 'Primeiro você usa, depois entende. A regra só aparece quando você pergunta ou trava.' },
  { key: 'examples', title: 'Correção com exemplo', desc: 'Em vez de explicar a regra no abstrato, mostra a frase certa do lado da errada pra você ver a diferença.' },
  { key: 'mini', title: 'Versão mínima', desc: 'Em dia corrido, faz só umas 5 perguntas em 2 minutos. Mantém o hábito leve e constante.' },
  { key: 'nogame', title: 'Motivação no papo', desc: 'O que te traz de volta é a conversa boa. Progresso medido pelo que você já consegue dizer.' },
  { key: 'summary', title: 'Resumo do dia', desc: 'No final, um resumo no idioma e o mesmo em português, com cada erro, a forma certa e o porquê.' },
  { key: 'voice', title: 'Só por escrito', desc: 'A conversa é por texto. Voz entra só quando você quiser.' },
] as const

type RuleKey = (typeof RULES)[number]['key']

type Form = {
  lang: LangKey
  langOther: string
  goal: string
  base: string
  time: string
  dur: string
  interests: string
  rules: Record<RuleKey, boolean>
  extra: string
}

const DEFAULT_FORM: Form = {
  lang: 'en-us',
  langOther: '',
  goal: 'Viajar sem depender de tradutor e conversar com clientes de fora. Situações mais importantes, nessa ordem: aeroporto, restaurante e hotel, reunião de trabalho, conhecer gente.',
  base: 'Entendo textos simples e um pouco de série com legenda. Na conversa eu travo e demoro pra montar a frase.',
  time: '08:00',
  dur: '20 a 30 min',
  interests: 'Séries e filmes, culinária, viagem, tecnologia. Depois: trabalho, livros, esportes. Política fora do cardápio.',
  rules: Object.fromEntries(RULES.map((r) => [r.key, true])) as Record<RuleKey, boolean>,
  extra: '',
}

const KEY = 'dup-tools:languages'

const clean = (s: string) => (s || '').trim().replace(/\s+\n/g, '\n')
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
const lc = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s)

function period(t: string): string {
  if (!t) return 'no mesmo horário todo dia'
  const h = parseInt(t.split(':')[0], 10)
  const p = h < 12 ? 'de manhã' : h < 18 ? 'à tarde' : 'à noite'
  return p + ', por volta das ' + t.replace(':', 'h')
}

function buildPrompt(f: Form): string {
  let L: Lang
  if (f.lang === 'other') {
    const n = cap(clean(f.langOther)) || 'O idioma'
    L = { name: n, label: n.toUpperCase(), variant: '' }
  } else {
    L = LANGS[f.lang]
  }
  const idioma = L.name.toLowerCase()
  const on = (k: RuleKey) => f.rules[k]

  const goal = clean(f.goal)
  const base = clean(f.base)
  const interests = clean(f.interests)
  const extra = clean(f.extra)
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  const out: string[] = []
  out.push('DUP.LANGUAGES · ' + L.label)
  out.push('')
  out.push('Objetivo')
  let obj = 'Destravar meu ' + idioma + (goal ? ' pra: ' + lc(goal).replace(/\.$/, '') + '.' : '.')
  if (L.variant) obj += ' ' + L.variant
  if (base) obj += ' Base atual: ' + lc(base).replace(/\.$/, '') + '.'
  obj += ' A primeira sessão serve pra calibrar meu nível real de escrita, leitura e conversa, sem anunciar que é teste.'
  out.push(obj)
  out.push('')
  out.push('Formato')
  out.push('- Bloco de ' + f.dur + ' por dia, ' + period(f.time) + '.')
  if (on('mini')) out.push('- Dia cheio: versão mínima de ~5 perguntas / 2 min. Progresso pequeno é progresso.')
  out.push(on('voice') ? '- Conversa por escrito (chat). Voz só quando eu quiser.' : '- Conversa por escrito ou por voz, como eu preferir no dia.')
  if (on('short')) out.push('- Mensagens curtas, uma pergunta pequena por vez. Abertura longa afasta.')
  if (on('invisible')) out.push('- Método invisível: nada de "hoje é aula de X". Puxa o papo como amigo, explicando ou perguntando algo.')
  if (on('paren')) out.push('- Quando eu escrever uma palavra ou trecho em português entre parênteses no meio da frase, é dúvida: mostra como se diz aquilo em ' + idioma + ' e reescreve a minha frase inteira já corrigida antes de seguir o papo.')
  if (on('immersion')) out.push('- A mensagem inteira fica em ' + idioma + ', inclusive o bloco de correção e a linha de fechamento. Português só quando eu pedir.')
  if (on('grammar')) out.push('- Gramática depois do uso: explica o porquê só quando eu perguntar ou travar.')
  if (on('examples')) out.push('- Toda correção vem com exemplo: frases curtas de contraste (forma certa x forma errada), não definição teórica.')
  if (on('nogame')) out.push('- Sem gamificação, streak ou pontuação.')
  extra.forEach((r) => out.push('- ' + r.replace(/\.?$/, '.')))

  if (on('summary')) {
    out.push('')
    out.push('Resumo do dia')
    out.push('Ao final, resumo curto: primeiro em ' + idioma + ', depois o mesmo em português. Erros detalhados um a um, com a forma certa e o porquê.')
  }

  if (interests) {
    out.push('')
    out.push('Assuntos (por vontade)')
    out.push(interests)
  }
  return out.join('\n')
}

const LABEL = 'block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1.5'
const HINT = 'text-xs text-gray-500 -mt-0.5 mb-2'
const INPUT =
  'w-full border border-gray-200 rounded-md p-3 text-sm leading-relaxed text-[#333] placeholder:text-gray-300 outline-none focus:border-black transition-colors bg-white'
const BTN =
  'border border-black rounded-md px-5 py-2.5 text-xs uppercase tracking-widest transition-colors duration-150'

export default function DupLanguages() {
  const [form, setForm] = useState<Form>(DEFAULT_FORM)
  // O prompt só atualiza no "gerar", como no original — o form pode estar no meio da edição.
  const [prompt, setPrompt] = useState(() => buildPrompt(DEFAULT_FORM))
  const [status, setStatus] = useState('')
  const [copyLabel, setCopyLabel] = useState('copiar prompt')
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (!raw) return
      const saved = { ...DEFAULT_FORM, ...(JSON.parse(raw) as Partial<Form>) }
      saved.rules = { ...DEFAULT_FORM.rules, ...saved.rules }
      setForm(saved)
      setPrompt(buildPrompt(saved))
    } catch {
      // storage bloqueado ou corrompido — fica com o exemplo
    }
  }, [])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const toggle = (k: RuleKey) => setForm((f) => ({ ...f, rules: { ...f.rules, [k]: !f.rules[k] } }))

  const generate = (e: React.FormEvent) => {
    e.preventDefault()
    setPrompt(buildPrompt(form))
    try {
      window.localStorage.setItem(KEY, JSON.stringify(form))
    } catch {
      // segue sem persistir
    }
    setStatus('prompt gerado')
    setTimeout(() => setStatus(''), 2000)
    if (window.matchMedia('(max-width:700px)').matches) {
      preRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const copy = () => {
    const selectFallback = () => {
      const pre = preRef.current
      if (!pre) return
      const r = document.createRange()
      r.selectNodeContents(pre)
      const s = window.getSelection()
      s?.removeAllRanges()
      s?.addRange(r)
      setCopyLabel('selecionado, copia manual')
    }
    try {
      navigator.clipboard.writeText(prompt).then(() => {
        setCopyLabel('copiado')
        setTimeout(() => setCopyLabel('copiar prompt'), 1800)
      }, selectFallback)
    } catch {
      selectFallback()
    }
  }

  return (
    <div className="max-w-[680px]">
      <form onSubmit={generate} noValidate className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dl-lang" className={LABEL}>idioma</label>
            <select id="dl-lang" value={form.lang} onChange={(e) => set('lang', e.target.value as LangKey)} className={INPUT}>
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {form.lang === 'other' && (
            <div>
              <label htmlFor="dl-other" className={LABEL}>qual idioma?</label>
              <input id="dl-other" type="text" placeholder="Ex: japonês" value={form.langOther} onChange={(e) => set('langOther', e.target.value)} className={INPUT} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="dl-goal" className={LABEL}>pra quê você quer</label>
          <p className={HINT}>Onde e como vai usar. Situações que mais pesam, em ordem.</p>
          <textarea id="dl-goal" rows={3} value={form.goal} onChange={(e) => set('goal', e.target.value)} className={`${INPUT} resize-y`} />
        </div>

        <div>
          <label htmlFor="dl-base" className={LABEL}>onde você está hoje</label>
          <p className={HINT}>O que já consegue fazer. Uma ideia geral basta, a primeira sessão calibra.</p>
          <textarea id="dl-base" rows={3} value={form.base} onChange={(e) => set('base', e.target.value)} className={`${INPUT} resize-y`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dl-time" className={LABEL}>horário</label>
            <input id="dl-time" type="time" value={form.time} onChange={(e) => set('time', e.target.value)} className={INPUT} />
          </div>
          <div>
            <label htmlFor="dl-dur" className={LABEL}>duração</label>
            <select id="dl-dur" value={form.dur} onChange={(e) => set('dur', e.target.value)} className={INPUT}>
              {DURATIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="dl-interests" className={LABEL}>interesses</label>
          <p className={HINT}>Do que você mais gosta pro que menos gosta. Pode incluir o que fica de fora.</p>
          <textarea id="dl-interests" rows={3} value={form.interests} onChange={(e) => set('interests', e.target.value)} className={`${INPUT} resize-y`} />
        </div>

        <div role="group" aria-labelledby="dl-rules">
          <span id="dl-rules" className={LABEL}>regras</span>
          <p className={HINT}>Todas vêm marcadas. Fica com as que fazem sentido pra você.</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {RULES.map((r) => {
              const checked = form.rules[r.key]
              return (
                <label
                  key={r.key}
                  className={`flex gap-3 items-start cursor-pointer rounded-md border p-3.5 bg-white transition-colors ${
                    checked ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggle(r.key)} className="mt-0.5 accent-black shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-black mb-0.5">{r.title}</span>
                    <span className="block text-xs leading-relaxed text-[#555]">{r.desc}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="dl-extra" className={LABEL}>regras extras</label>
          <p className={HINT}>Qualquer coisa do seu jeito. Uma por linha.</p>
          <textarea
            id="dl-extra"
            rows={3}
            placeholder={'Ex: me chama pelo apelido\nEx: usa gírias de lá'}
            value={form.extra}
            onChange={(e) => set('extra', e.target.value)}
            className={`${INPUT} resize-y`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className={`${BTN} bg-black text-white hover:bg-white hover:text-black`}>
            gerar prompt
          </button>
          <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400" aria-live="polite">
            {status}
          </span>
        </div>
      </form>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-400">pronto pra colar</p>
          <button type="button" onClick={copy} className={`${BTN} text-black hover:bg-black hover:text-white`}>
            {copyLabel}
          </button>
        </div>
        <pre
          ref={preRef}
          tabIndex={0}
          aria-label="Prompt gerado"
          className="m-0 max-h-[560px] overflow-auto whitespace-pre-wrap break-words rounded-md border border-gray-200 bg-white/80 p-5 font-mono text-[13px] leading-relaxed text-[#333]"
        >
          {prompt}
        </pre>
      </div>
    </div>
  )
}
