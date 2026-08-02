import type { Metadata } from 'next'

import Teleprompter from '@/components/tools/Teleprompter'
import ToolShell, { type Faq } from '@/components/tools/ToolShell'
import { SITE_URL } from '@/lib/seo'
import { getTool } from '@/lib/tools'

const tool = getTool('teleprompter')!

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
    q: 'Como gravar vídeo lendo o teleprompter sem parecer que estou lendo?',
    a: 'Três coisas: deixa a velocidade um pouco mais lenta que sua fala natural (você acompanha o texto, não o contrário), aumenta a fonte pra não franzir o olho, e posiciona a janela o mais perto possível da câmera. A faixa de leitura marca a linha onde seus olhos devem ficar.',
  },
  {
    q: 'Pra que serve o modo espelhado?',
    a: 'Pra rigs de teleprompter físico — aqueles com vidro a 45 graus na frente da lente. O vidro inverte a imagem, então o texto precisa estar espelhado na tela pra aparecer certo no reflexo. Sem rig, deixa no modo normal.',
  },
  {
    q: 'Posso usar no celular?',
    a: 'Sim — abre no navegador do celular, cola o texto e usa os botões na tela. Apoia o celular perto da câmera que vai gravar (ou usa o próprio celular em modo selfie) e ajusta fonte e velocidade pelo controle na parte de baixo.',
  },
  {
    q: 'O texto que eu colo fica salvo em algum lugar?',
    a: 'Só no armazenamento local do seu navegador, pra não perder se a aba recarregar. Nada é enviado pra servidor. Se você escreveu o roteiro no organizador de roteiro daqui do site, dá pra importar direto sem colar nada.',
  },
]

export default function TeleprompterPage() {
  return (
    <ToolShell
      tool={tool}
      intro="Um teleprompter que roda no navegador: cola o texto (ou importa um roteiro salvo do organizador), escolhe velocidade e tamanho da fonte, e grava olhando pra tela. Com modo espelhado pra quem usa rig com vidro e atalhos de teclado pra controlar sem tirar a mão."
      faq={FAQ}
    >
      <Teleprompter />
    </ToolShell>
  )
}
