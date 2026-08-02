export type Tool = {
  slug: string
  /** Nome curto exibido em cards e navegação (lowercase, tom da marca). */
  name: string
  /** H1 e title da página — carrega a keyword de busca. */
  title: string
  /** Meta description e subtítulo do card (~150 chars). */
  description: string
  status: 'live' | 'breve'
}

export const TOOLS: Tool[] = [
  {
    slug: 'roteiro-reels',
    name: 'roteiro pra reels',
    title: 'organizador de roteiro pra reels e tiktok',
    description:
      'Escreva roteiros de vídeo curto com estrutura de hook, desenvolvimento e CTA — com estimativa de duração falada em tempo real. Grátis, direto no navegador.',
    status: 'live',
  },
  {
    slug: 'teleprompter',
    name: 'teleprompter',
    title: 'teleprompter online grátis',
    description:
      'Teleprompter no navegador pra gravar vídeo lendo seu roteiro: velocidade ajustável, fonte grande, modo espelhado e tela cheia.',
    status: 'live',
  },
  {
    slug: 'legenda-instagram',
    name: 'legenda pra instagram',
    title: 'formatador de legenda pra instagram',
    description:
      'Quebra de linha que o Instagram respeita, contador de caracteres por rede e preview do corte do "…mais". Escreve, formata e copia pronto pra colar.',
    status: 'live',
  },
]

export const liveTools = () => TOOLS.filter((t) => t.status === 'live')

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug) ?? null
