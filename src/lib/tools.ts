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
      'Teleprompter no navegador pra gravar vídeo lendo seu roteiro: velocidade ajustável, fonte grande, modo espelhado e tela cheia. Sem cadastro.',
    status: 'live',
  },
  {
    slug: 'kit-imagem',
    name: 'kit de imagem',
    title: 'converter, comprimir e redimensionar imagem',
    description:
      'HEIC pra JPG, compressão e recorte nos formatos de rede social (9:16, 4:5, 1:1) — tudo no navegador, a imagem não sai do seu computador.',
    status: 'breve',
  },
]

export const liveTools = () => TOOLS.filter((t) => t.status === 'live')

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug) ?? null
