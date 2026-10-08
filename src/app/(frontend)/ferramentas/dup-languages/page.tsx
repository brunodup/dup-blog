import type { Metadata } from 'next'

import DupLanguages from '@/components/tools/DupLanguages'
import ToolShell, { type Faq } from '@/components/tools/ToolShell'
import { SITE_URL } from '@/lib/seo'
import { getTool } from '@/lib/tools'

const tool = getTool('dup-languages')!

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

const IDEIA = [
  {
    t: 'Parênteses pra pedir ajuda',
    d: 'Travou numa palavra? Escreve ela em português entre parênteses, tipo "I want to (alugar) a car". Ele mostra a palavra certa e reescreve a frase inteira.',
  },
  { t: 'Imersão total', d: 'Correção vem 100% no idioma. Português só quando você pedir.' },
  { t: 'Usa primeiro, regra depois', d: 'Gramática aparece quando você pergunta ou trava, sempre com exemplo.' },
  { t: 'Resumo do dia', d: 'No fim, cada erro com a forma certa e o porquê, no idioma e em português.' },
]

const PASSOS: { t: string; p: React.ReactNode; nota?: string }[] = [
  {
    t: 'Gera o seu prompt',
    p: 'Preenche o formulário aqui embaixo com idioma, horário, interesses e regras. Clica em gerar e copia.',
  },
  {
    t: 'Cria um projeto no Claude',
    p: (
      <>
        No claude.ai (ou no app), abre <b>Projetos</b> e cria um novo. Dá um nome tipo{' '}
        <code className="font-mono text-[0.88em] bg-black/5 px-1.5">languages</code>. O projeto separa essas conversas do
        resto e guarda as instruções fixas.
      </>
    ),
  },
  {
    t: 'Cola o prompt nas instruções do projeto',
    p: (
      <>
        Dentro do projeto, abre as <b>instruções do projeto</b> e cola o texto inteiro. A partir daí, toda conversa nova
        ali dentro já começa seguindo essas regras.
      </>
    ),
    nota: 'Quer mudar algo depois? Edita as instruções ou volta aqui e gera de novo.',
  },
  {
    t: 'Deixa a memória ligada',
    p: 'Nas configurações do Claude, ativa a memória. Assim ele lembra do seu nível, dos erros que se repetem e do que vocês conversaram nos dias anteriores.',
  },
  {
    t: 'Cria o gatilho do horário',
    p: 'Coloca um lembrete no celular no horário que você escolheu. Na hora, abre o projeto, começa uma conversa e manda um "hola", "hi" ou o que for. A primeira sessão calibra seu nível sozinha.',
    nota: 'Dia corrido? Manda "versão curta" e faz 5 perguntas em 2 minutos. Progresso pequeno é progresso.',
  },
]

const EYEBROW = 'text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3'
const H2 = 'font-switzer text-xl font-semibold tracking-tight text-black mb-4'

function About() {
  return (
    <div className="max-w-[680px] mb-14 space-y-14">
      <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 -mt-4">
        20 a 30 min por dia / chat / no seu ritmo
      </p>

      <section className="pt-10 border-t border-black/10">
        <p className={EYEBROW}>a ideia</p>
        <h2 className={H2}>Aprende conversando</h2>
        <p className="text-[1rem] leading-relaxed text-[#333]">
          O Claude puxa papo como um amigo que fala o idioma. O método fica por trás: ele corrige, ensina vocabulário e
          acompanha seu nível ali mesmo, no fluxo do papo. Você conversa sobre o que te interessa e o idioma vem junto.
        </p>
        <div className="mt-6 grid gap-px sm:grid-cols-2 bg-black/10 border border-black/10 rounded-md overflow-hidden">
          {IDEIA.map((i) => (
            <div key={i.t} className="bg-white/70 p-4">
              <p className="text-sm font-medium text-black mb-1">{i.t}</p>
              <p className="text-sm leading-relaxed text-[#555]">{i.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-10 border-t border-black/10">
        <p className={EYEBROW}>tutorial</p>
        <h2 className={H2}>Monta em 5 passos</h2>
        <ol className="space-y-7">
          {PASSOS.map((s, i) => (
            <li key={s.t} className="grid grid-cols-[48px_1fr] gap-3">
              <span className="font-switzer text-2xl font-semibold leading-none tracking-tight text-black">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="text-[1rem] font-medium text-black mb-1">{s.t}</h3>
                <p className="text-sm leading-relaxed text-[#333]">{s.p}</p>
                {s.nota && <p className="text-sm leading-relaxed text-gray-500 mt-2">{s.nota}</p>}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pt-10 border-t border-black/10">
        <p className={EYEBROW}>gerador</p>
        <h2 className={H2}>Seu prompt</h2>
        <p className="text-sm leading-relaxed text-[#333]">
          Já vem com um exemplo preenchido pra você ver como fica. Troca pelos seus dados e clica em gerar.
        </p>
      </section>
    </div>
  )
}

const FAQ: Faq[] = [
  {
    q: 'Por que num projeto e não numa conversa normal?',
    a: 'Porque o projeto guarda o prompt como instrução fixa: toda conversa nova ali dentro já começa com as regras, sem colar nada de novo. Numa conversa solta, o combinado se perde no dia seguinte.',
  },
  {
    q: 'Funciona pra qualquer idioma?',
    a: 'Sim. A lista tem os mais comuns com variante regional (espanhol da Espanha ou da América Latina, inglês americano ou britânico), e a opção "outro" aceita qualquer idioma — o prompt se ajusta sozinho.',
  },
  {
    q: 'Serve pra quem está começando do zero?',
    a: 'Serve, mas rende mais pra quem já entende um pouco e trava na hora de escrever. Do zero, vale desmarcar "tudo no idioma" nas primeiras semanas, pra correção vir com apoio em português.',
  },
  {
    q: 'O que eu preencho fica salvo?',
    a: 'Só no seu navegador, pra você voltar e gerar de novo sem preencher tudo. Nada vai pra servidor.',
  },
]

export default function DupLanguagesPage() {
  return (
    <ToolShell
      tool={tool}
      intro="Um parceiro de conversa diário pra destravar um idioma por escrito, no seu ritmo, falando do que você gosta. Monta uma vez no Claude e depois é só abrir e trocar ideia."
      faq={FAQ}
      about={<About />}
    >
      <DupLanguages />
    </ToolShell>
  )
}
