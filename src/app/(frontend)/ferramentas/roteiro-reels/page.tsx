import type { Metadata } from 'next'

import RoteiroReels from '@/components/tools/RoteiroReels'
import ToolShell, { type Faq } from '@/components/tools/ToolShell'
import { SITE_URL } from '@/lib/seo'
import { getTool } from '@/lib/tools'

const tool = getTool('roteiro-reels')!

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
    q: 'Quantas palavras cabem num reels de 30 segundos?',
    a: 'Num ritmo natural de fala (~140 palavras por minuto), cabem cerca de 70 palavras em 30 segundos. Falando pausado, umas 55; acelerado, até 85. A ferramenta calcula isso em tempo real enquanto você escreve, no ritmo que você escolher.',
  },
  {
    q: 'Por que separar o roteiro em hook, desenvolvimento e CTA?',
    a: 'Porque cada parte tem um trabalho diferente: o hook segura a pessoa nos primeiros 2 segundos, o desenvolvimento entrega o que o hook prometeu, e o CTA diz o que fazer depois. Escrever separado te obriga a pensar cada parte — e deixa óbvio quando o desenvolvimento está comendo o tempo do vídeo.',
  },
  {
    q: 'Onde meus roteiros ficam salvos?',
    a: 'No armazenamento local do seu navegador, neste dispositivo. Nada é enviado pra servidor nenhum — o que também significa que limpar os dados do navegador apaga os roteiros. Use o botão de copiar pra guardar uma cópia onde quiser.',
  },
  {
    q: 'Funciona pra TikTok e YouTube Shorts também?',
    a: 'Sim. A estrutura hook–desenvolvimento–CTA e a conta de duração falada valem pra qualquer vídeo curto vertical — Reels, TikTok, Shorts. Os alvos de 15, 30, 60 e 90 segundos cobrem os formatos comuns das três plataformas.',
  },
]

export default function RoteiroReelsPage() {
  return (
    <ToolShell
      tool={tool}
      intro="Escreva o roteiro do seu próximo vídeo curto com a estrutura que funciona — hook, desenvolvimento e CTA — enquanto a ferramenta estima quanto tempo de fala o texto dá. Chega de decorar um textão e descobrir na gravação que não cabe em 60 segundos."
      faq={FAQ}
    >
      <RoteiroReels />
    </ToolShell>
  )
}
