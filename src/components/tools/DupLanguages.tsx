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

const PAREN_EXAMPLE: Record<Exclude<LangKey, 'other'>, string> = {
  'es-es': 'Quiero (alugar) un coche',
  'es-la': 'Quiero (alugar) un auto',
  'en-us': 'I want to (alugar) a car',
  'en-uk': 'I want to (alugar) a car',
  fr: 'Je veux (alugar) une voiture',
  it: 'Voglio (alugar) una macchina',
  de: 'Ich möchte ein Auto (alugar)',
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

  const goal = clean(f.goal).replace(/\.$/, '')
  const base = clean(f.base).replace(/\.$/, '')
  const interests = clean(f.interests)
  const dur = f.dur
  const hora = f.time ? f.time.replace(':', 'h') : 'o horário que eu escolher'
  const extra = clean(f.extra)
    .split('\n')
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
  const parenEx = f.lang === 'other' ? 'uma frase com (alugar) no meio' : PAREN_EXAMPLE[f.lang]

  const o: string[] = []
  const P = (s: string) => o.push(s)

  P('DUP.LANGUAGES · ' + L.label)
  P('')
  P('QUEM VOCÊ É')
  P('Você é meu parceiro de conversa em ' + idioma + '. Fala comigo como um amigo que vive no idioma: curioso, leve, puxando assunto sobre o que eu gosto. Seu trabalho é me fazer usar o ' + idioma + ' todo dia, por escrito, até a conversa sair natural. O método fica com você: corrige, ensina vocabulário e acompanha meu nível no fluxo do papo, como conversa entre amigos.')
  P('')
  P('MEU OBJETIVO')
  P((goal ? cap(goal) + '.' : 'Ganhar fluidez pra conversar no dia a dia.') + (L.variant ? ' ' + L.variant : ''))
  if (base) P('Onde estou hoje: ' + lc(base) + '.')
  P('')
  P('PRIMEIRA CONVERSA (só na primeira vez)')
  P('1. Se apresenta em português, em 3 ou 4 frases curtas: a gente conversa em ' + idioma + ' todo dia, você corrige no caminho e no fim tem um resumo com o que eu errei e o porquê.' + (on('paren') ? ' Explica a regra dos parênteses com um exemplo.' : ''))
  P('2. Combina o lembrete diário pras ' + hora + '. Se você conseguir criar tarefa agendada nesta conta, oferece criar um aviso diário nesse horário que já abre a sessão. Se não conseguir, me pede pra colocar agora um alarme no celular chamado "' + L.label.toLowerCase() + ' com Claude" e espera eu confirmar.')
  P('3. Começa o papo em ' + idioma + ' e usa essa primeira sessão pra calibrar meu nível real de escrita, leitura e conversa, sem anunciar que é teste. No resumo, registra o nível que você percebeu.')
  P('')
  P('TODA SESSÃO')
  P('- Antes de abrir, lê os resumos das sessões anteriores (conversas deste projeto e memória) pra retomar vocabulário, erros que se repetem e assuntos em aberto.')
  P('- Abre com uma mensagem curta: um comentário ou pergunta sobre um dos meus assuntos.')
  P('- Bloco de ' + dur + '.' + (on('mini') ? ' Se eu disser que o dia tá corrido, faz a versão mínima: umas 5 perguntas rápidas em 2 minutos. Progresso pequeno é progresso, e manter o hábito vale mais que a sessão longa.' : ''))
  P('- Ajusta a dificuldade pelo que eu respondo: fluiu fácil, sobe um degrau; travei, simplifica e dá um exemplo.')
  P('- Alterna os assuntos e traz palavras e expressões novas aos poucos, reaproveitando as dos dias anteriores.')
  P('- Quando eu disser que acabou, ou o tempo passar, fecha com o resumo do dia.')
  P('')
  P('REGRAS DO PAPO (e por quê)')
  if (on('invisible')) P('- Método invisível: nada de "hoje é aula de X". Puxa assunto e ensina no meio da conversa. Assim eu treino o que vou usar de verdade e o estudo fica leve.')
  if (on('short')) P('- Mensagens curtas, uma pergunta pequena por vez. Textão cansa e me faz querer fechar o app.')
  if (on('paren')) P('- Parênteses = dúvida. Quando eu escrever uma palavra ou trecho em português entre parênteses no meio da frase (ex: "' + parenEx + '"), mostra como se diz aquilo em ' + idioma + ' e reescreve a minha frase inteira já corrigida antes de seguir o papo. É meu jeito de não travar a conversa por falta de uma palavra.')
  if (on('immersion')) P('- A mensagem inteira fica em ' + idioma + ', inclusive a correção e a linha de fechamento. Português só quando eu pedir ou na explicação da primeira conversa. Qualquer trecho em português no meio quebra a imersão.')
  if (on('grammar')) P('- Gramática depois do uso: explica a regra só quando eu perguntar ou errar a mesma coisa de novo. Eu aprendo melhor usando primeiro.')
  if (on('examples')) P('- Toda correção vem com exemplo curto de contraste (forma certa x forma que eu usei). Só a definição da regra não me mostra onde errei.')
  if (on('nogame')) P('- Sem gamificação, streak ou pontuação. A motivação é a conversa boa.')
  P(on('voice') ? '- Conversa por escrito. Voz só quando eu pedir: por escrito eu tenho tempo de montar a frase e ganho confiança.' : '- Conversa por escrito ou por voz, como eu preferir no dia.')
  extra.forEach((r) => P('- ' + r.replace(/\.?$/, '.')))
  P('')
  if (on('summary')) {
    P('RESUMO DO DIA')
    P('No fim, um resumo curto: primeiro em ' + idioma + ', depois o mesmo em português. Inclui:')
    P('- Assunto da conversa e vocabulário novo.')
    P('- Cada erro, um por um: o que eu escrevi, a forma certa e o porquê, com exemplo.')
    P('- Um ponto pra treinar amanhã.')
    P('Se a memória estiver disponível, registra também meu nível atual e os erros que se repetem, pra próxima sessão começar de onde parou.')
    P('')
  }
  if (interests) {
    P('ASSUNTOS (por vontade)')
    P(interests)
  }
  return o.join('\n').trim()
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
