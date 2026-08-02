import type { Metadata } from 'next'

import LegendaInstagram from '@/components/tools/LegendaInstagram'
import ToolShell, { type Faq } from '@/components/tools/ToolShell'
import { SITE_URL } from '@/lib/seo'
import { getTool } from '@/lib/tools'

const tool = getTool('legenda-instagram')!

export const metadata: Metadata = {
  title: tool.title,
  description: tool.description,
  alternates: { canonical: `/ferramentas/${tool.slug}` },
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/ferramentas/${tool.slug}`,
    title: `${tool.title} — brunodup`,
    description: tool.description,
  },
}

const FAQ: Faq[] = [
  {
    q: 'Por que o Instagram come as quebras de linha da legenda?',
    a: 'Quando uma linha termina com espaço, o Instagram descarta a quebra seguinte — e linhas totalmente vazias às vezes são colapsadas. A formatação daqui limpa os espaços no fim de cada linha e preenche as linhas vazias com um caractere invisível, então o texto cola no app exatamente como você escreveu.',
  },
  {
    q: 'Quantos caracteres tem uma legenda de Instagram?',
    a: 'Até 2.200 caracteres, mas só os ~125 primeiros aparecem antes do corte do "…mais" no feed. Por isso a ferramenta mostra um preview exato do que fica visível — é ali que a legenda precisa convencer a pessoa a tocar.',
  },
  {
    q: 'Quantas hashtags posso usar?',
    a: 'O Instagram aceita até 30 por publicação. A ferramenta conta as suas e avisa se passar. Sobre quantidade ideal não existe consenso — mas hashtag genérica demais só atrai robô, então menos e mais específica costuma render mais.',
  },
  {
    q: 'Funciona pra TikTok, X e YouTube?',
    a: 'Sim — troca a rede no topo e o contador passa a usar o limite dela: 2.200 no TikTok, 280 no X e 5.000 na descrição do YouTube. A formatação de quebra de linha é pensada pro Instagram, mas não atrapalha nas outras.',
  },
]

export default function LegendaInstagramPage() {
  return (
    <ToolShell
      tool={tool}
      intro="Escreva a legenda com as quebras de linha do jeito que você quer — a ferramenta formata pro Instagram não engolir nenhuma, conta os caracteres no limite da rede e mostra exatamente o que aparece antes do corte do “…mais”. Copia e cola pronto."
      faq={FAQ}
    >
      <LegendaInstagram />
    </ToolShell>
  )
}
