// Critérios de estrutura de uma boa legenda — regras fixas, sem IA.
// Avaliam FORMA (gancho, respiro, chamada, hashtag), não o conteúdo em si.

export type RuleStatus = 'ok' | 'warn' | 'tip' | 'idle'

export type RuleResult = {
  key: string
  label: string
  status: RuleStatus
  msg: string
}

// Verbos/expressões de chamada pra ação comuns em legenda PT-BR.
const CTA_RE =
  /\b(comenta|comente|compartilha|compartilhe|salva|salve|marca|marque|me conta|conta (pra|para) mim|clica|clique|link na bio|segue|siga|manda|mande|responde|responda|curte|curta|arrasta|confere|confira|acessa|acesse|baixa|baixe|garanta|garante|inscreve|inscreva|deixa (aqui )?nos comentários)\b/i

const HASHTAG_RE = /#[^\s#]+/g

/** Quantos critérios avaliáveis e quantos estão ok — pro placar "N/6". */
export function scoreOf(results: RuleResult[]): { ok: number; total: number } {
  const applicable = results.filter((r) => r.status !== 'idle')
  return { ok: applicable.filter((r) => r.status === 'ok').length, total: results.length }
}

export function evaluateCaption(
  raw: string,
  { cut, max, chars }: { cut: number | null; max: number; chars: number },
): RuleResult[] {
  const text = raw.trim()
  const empty = text.length === 0
  const idle = (key: string, label: string, msg: string): RuleResult => ({ key, label, status: 'idle', msg })

  if (empty) {
    return [
      idle('gancho', 'gancho', 'primeira linha forte, que cabe antes do corte'),
      idle('respiro', 'respiro', 'blocos curtos em vez de parede de texto'),
      idle('cta', 'chamada', 'diz o que fazer: comenta, salva, compartilha…'),
      idle('pergunta', 'pergunta', 'pergunta puxa comentário'),
      idle('hashtags', 'hashtags', 'poucas, específicas e no fim'),
      idle('limite', 'limite', 'dentro do limite da rede'),
    ]
  }

  const results: RuleResult[] = []
  const lines = raw.split('\n')
  const firstLine = (lines.find((l) => l.trim()) ?? '').trim()
  const cutAt = cut ?? 125

  // 1. Gancho — a primeira linha decide o toque no "…mais".
  if (firstLine.length > cutAt) {
    results.push({
      key: 'gancho',
      label: 'gancho',
      status: 'warn',
      msg: `a primeira linha tem ${firstLine.length} caracteres e vai ser cortada — o gancho precisa caber em ${cutAt}`,
    })
  } else {
    const strong = /\?|\d/.test(firstLine)
    results.push({
      key: 'gancho',
      label: 'gancho',
      status: 'ok',
      msg: strong
        ? 'primeira linha cabe antes do corte — e pergunta/número seguram o olho'
        : 'primeira linha cabe antes do “…mais”',
    })
  }

  // 2. Respiro — sem parede de texto.
  const blocks = raw
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean)
  const longest = Math.max(...blocks.map((b) => b.length))
  if (text.length > 260 && blocks.length === 1) {
    results.push({
      key: 'respiro',
      label: 'respiro',
      status: 'warn',
      msg: 'parede de texto — quebra em blocos menores, um pensamento por linha',
    })
  } else if (longest > 240) {
    results.push({
      key: 'respiro',
      label: 'respiro',
      status: 'warn',
      msg: 'tem um bloco muito longo — quebra ele em dois',
    })
  } else {
    results.push({ key: 'respiro', label: 'respiro', status: 'ok', msg: 'blocos curtos, fácil de ler' })
  }

  // 3. Chamada pra ação.
  results.push(
    CTA_RE.test(raw)
      ? { key: 'cta', label: 'chamada', status: 'ok', msg: 'tem chamada pra ação' }
      : {
          key: 'cta',
          label: 'chamada',
          status: 'tip',
          msg: 'sem chamada — diz o que fazer: comenta, salva, compartilha, manda pra alguém…',
        },
  )

  // 4. Pergunta — o jeito mais direto de puxar comentário.
  results.push(
    /\?/.test(raw)
      ? { key: 'pergunta', label: 'pergunta', status: 'ok', msg: 'tem pergunta — isso puxa comentário' }
      : { key: 'pergunta', label: 'pergunta', status: 'tip', msg: 'sem pergunta — perguntar puxa comentário' },
  )

  // 5. Hashtags — poucas, específicas, no fim.
  const tags = raw.match(HASHTAG_RE) ?? []
  const lastLine = (lines.filter((l) => l.trim()).at(-1) ?? '').trim()
  const tagsNoMeio = tags.length >= 3 && !lastLine.includes('#')
  if (tags.length === 0) {
    results.push({
      key: 'hashtags',
      label: 'hashtags',
      status: 'tip',
      msg: 'sem hashtag — 3 a 5 específicas ajudam quem busca o assunto',
    })
  } else if (tags.length > 10) {
    results.push({
      key: 'hashtags',
      label: 'hashtags',
      status: 'warn',
      msg: `${tags.length} hashtags — acima de ~10 vira ruído; escolhe as específicas`,
    })
  } else if (tagsNoMeio) {
    results.push({
      key: 'hashtags',
      label: 'hashtags',
      status: 'tip',
      msg: 'hashtag no meio do texto atrapalha a leitura — joga pro fim',
    })
  } else {
    results.push({ key: 'hashtags', label: 'hashtags', status: 'ok', msg: 'hashtags na medida' })
  }

  // 6. Limite da rede.
  results.push(
    chars <= max
      ? { key: 'limite', label: 'limite', status: 'ok', msg: `dentro do limite (${chars}/${max})` }
      : { key: 'limite', label: 'limite', status: 'warn', msg: `passou ${chars - max} caracteres do limite` },
  )

  return results
}
