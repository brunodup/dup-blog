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
    name: 'roteiro pra vídeo curto',
    title: 'organizador de roteiro pra vídeo curto',
    description:
      'Escreva roteiros de reels, tiktok e shorts com estrutura de hook, desenvolvimento e CTA — e estimativa de duração falada em tempo real. Grátis, direto no navegador.',
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
      'Quebra de linha que o Instagram respeita, checagem da estrutura em tempo real — gancho, respiro, chamada, hashtags — e preview do corte do "…mais".',
    status: 'live',
  },
]

export const liveTools = () => TOOLS.filter((t) => t.status === 'live')

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug) ?? null
