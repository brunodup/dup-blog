# brunodup — Design System & Tom de Voz

> Documento de referência derivado do código-fonte do site. Atualizar sempre que um padrão novo for consolidado.

---

## 1. Identidade

| | |
|---|---|
| **Nome da marca** | brunodup |
| **Domínio** | brunodup.com |
| **Tagline** | brunodup — portfólio e pensamentos visuais. |
| **Idioma primário** | pt-BR |
| **Conceito central** | O site é um **mural** — cards espalhados pelo espaço, arrastáveis, sem hierarquia rígida. Não é um blog, não é um portfolio grid. É curadoria pessoal em tela cheia. |

---

## 2. Tipografia

### Famílias

| Papel | Família | Uso |
|---|---|---|
| **Body / UI** | Geist Sans | Texto de corpo, labels, UI geral |
| **Display / Marca** | Switzer | Logotipo, menu de piso, títulos de destaque |
| **Código / Meta** | Geist Mono | Tags de tipo, labels uppercase, snippets, badges |

### Pesos disponíveis (Switzer)
`100` Thin · `300` Light · `400` Regular · `700` Bold · `800` Extrabold · `900` Black

### Escala tipográfica aplicada

| Contexto | Tamanho | Peso | Outros |
|---|---|---|---|
| Título de post (`h1`) | `1.75rem` | `semibold` | `font-switzer`, `tracking-tight`, `leading-tight` |
| Citação (`blockquote`) | `1.625rem` | `300` (light) | `italic`, `leading-[1.35]` |
| Corpo de texto (prose) | `1rem` | `400` | `leading-relaxed`, cor `#333` |
| Card title (TextCard) | `0.8125rem` md / `9px` mobile | `semibold` | `tracking-tight`, `truncate` |
| Card snippet (TextCard) | `0.75rem` md / `8px` mobile | `400` | `text-[#555]`, `line-clamp-3` |
| Labels / meta (mono) | `10px`–`11px` | `400` | `font-mono`, `uppercase`, `tracking-widest` |
| Menu de piso | `1.05rem` | `bold` | `font-switzer`, `uppercase` |
| Back button | `xs` (`0.75rem`) | `400` | `tracking-widest`, `uppercase` |

### Renderização
- `-webkit-font-smoothing: antialiased`
- `-moz-osx-font-smoothing: grayscale`

---

## 3. Paleta de Cores

### Núcleo (preto e branco)

| Token | Valor | Uso |
|---|---|---|
| `white` | `#ffffff` | Background global, cards claros |
| `black` / near-black | `#111111` | Texto primário, headings, borda do menu |
| `text-secondary` | `#333333` | Corpo de texto em prose |
| `text-muted` | `#555555` | Snippets de card, elementos secundários |
| `gray-light` | `#888888` | Bullets/counters do prose |
| `gray-ui` | `#999999` | Scrollbar hover |
| `gray-scrollbar` | `#cccccc` | Scrollbar thumb |
| `gray-border` | `#f4f4f4` | Code pre background |

### Accent (único — loading bar)

| Token | Valor | Uso |
|---|---|---|
| `sky-300` | `#7dd3fc` | Início do gradiente do top loader |
| `sky-400` | `#38bdf8` | Glow do loader, cor base do NextTopLoader |
| `blue-700` | `#1d4ed8` | Fim do gradiente do top loader |

> O azul aparece **só** no indicador de loading. Toda a interface de conteúdo é preto e branco.

### Dark (cards de snippet/video)

| Token | Valor | Uso |
|---|---|---|
| `neutral-950` | `#0a0a0a` | Background do SnippetCard (sem thumbnail) |
| `neutral-900` | `#171717` | Background do VideoCard |
| `neutral-800` | `#262626` | Placeholder de thumbnail ausente |
| `neutral-600` | `#525252` | Label "video" no placeholder |
| `neutral-500` | `#737373` | Texto secundário em snippets |
| `white/70` | `rgba(255,255,255,0.7)` | Badge de modo JS sobre imagem |
| `black/50` | `rgba(0,0,0,0.5)` | Background do badge de modo JS |

### Prose (overrides de @tailwindcss/typography)

```css
--tw-prose-body:          #333333
--tw-prose-headings:      #111111
--tw-prose-links:         #111111
--tw-prose-bold:          #111111
--tw-prose-counters:      #888888
--tw-prose-bullets:       #888888
--tw-prose-quotes:        #111111
--tw-prose-quote-borders: #111111
--tw-prose-code:          #111111
--tw-prose-pre-bg:        #f4f4f4
```

---

## 4. Iconografia & Logo

- O logotipo é um **SVG path customizado** que renderiza "BRUNODUP.COM" em uma tipografia própria (viewBox 1895×171).
- É sempre exibido em `currentColor` — muda para preto ou branco dependendo do contexto.
- Ocupa 100% da largura do contêiner. Na home, é o título de tela cheia (`board-title`).
- Em mobile, o tamanho base do `board-title` é reduzido para `55px` via media query.
- Não existe ícone de "hamburguer" ou navegação mobile oculta — o menu é sempre visível.

---

## 5. Componentes

### Cards do Mural

Todos os cards compartilham:
- `rounded-md` (border-radius)
- `shadow-[0_2px_12px_rgba(0,0,0,0.55)]` — sombra forte com tinte preto
- Mobile: `w-[100px]` · Desktop: `w-40`/`w-44`

| Tipo | Background | Detalhe visual |
|---|---|---|
| `ImageCard` | white | Foto em `object-cover`, altura quadrada |
| `TextCard` | white | Título semibold + snippet muted; se `quote`: borda esquerda 3px preta + itálico |
| `VideoCard` | `neutral-900` | Thumbnail `h-16`/`h-28` + título white |
| `AudioCard` | white | SVG de waveform gerada matematicamente (28 barras) |
| `SnippetCard` | `neutral-950` | Badge de modo (JS/JSX/THREE) + título mono branco |

### Hover / Interação nos cards
```
hover:scale-[1.03]  active:scale-[0.98]  transition-transform duration-150
```

### Menu de Piso
- Grid `3×n` em perspectiva: `perspective(500px) rotateX(44deg)`
- Botões com border `4px solid black`, padding `14px 32px`, sem background
- Hover inverte: `bg-black text-white` em `0.15s ease`
- Fonte: Switzer Bold Uppercase

### Citação (`QuotePost`)
- `border-l-[3px] border-black pl-7`
- Texto `1.625rem` light italic
- Atribuição: `text-xs tracking-widest uppercase text-gray-500`

### Imagem com Modal (`ImageWithModal`)
- Clique abre overlay fullscreen para visualização ampliada

### Top Loader
- Gradiente `sky-300 → blue-700`, altura 3px, sem spinner

### Scrollbar customizada
- Largura 6px, track transparente, thumb `#ccc` (hover `#999`), `border-radius: 3px`

---

## 6. Espaçamento & Layout

### Home (Mural)
- Tela cheia: `w-screen h-screen overflow-hidden`
- Sem scroll — posicionamento absoluto em % (0–100vw / 0–100vh)
- Cards posicionados via `left: X%` `top: Y%`
- Zona central reservada (35–65% × 20–80%) — cards são repelidos desta área
- Zona do menu (22–78% × 80–100%) — também reservada

### Páginas de Post
```
w-[95%] mx-auto pt-2 pb-24
md:w-auto md:max-w-[90vw] md:px-6
```
- Navegação "voltar": `mb-14`
- Título: `mb-8`
- Prose: `prose prose-sm prose-gray max-w-none`
- Vídeo: `max-h-[70vh] w-auto max-w-full`

### "Veja também"
- `mt-16 pt-10 border-t border-gray-100`
- Grid: `grid-cols-2 md:grid-cols-4 gap-4`
- Card: `aspect-[4/3]`, imagem com `hover:scale-105 duration-300`

---

## 7. Animações & Transições

### Entrada dos cards (home)
```css
/* Spring com bounce */
transform: cubic-bezier(0.34, 1.56, 0.64, 1)
/* Delay escalonado: 0.45s + i * 0.07s por card */
```

### Saída dos cards (navegação)
```css
transform: scale(1.6) translateY(-80vh);
transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.5s ease;
```

### slideUp (utility .animate-slide-up)
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* duration: 0.45s ease */
```

### Filosofia de movimento
- Entrada: **spring com overshoot** — vivo, não mecânico
- Saída: **scale up + fade** — dramático, cinematográfico
- Hover de cards: escala sutil (`1.03`), rápido (`150ms`)
- Hover de imagens relacionadas: zoom lento (`scale-105`, `300ms`)
- Botões de menu: inversão de cor imediata (`150ms ease`)

---

## 8. Breakpoints

Tailwind default com padrão `mobile-first`:

| Prefixo | Min-width | Uso no projeto |
|---|---|---|
| *(base)* | 0 | Cards `w-[100px]`, fonte reduzida |
| `md` | `768px` | Cards `w-40`/`w-44`, fonte normal, layout expandido |

Media query de CSS explícita:
```css
@media (max-width: 768px) {
  .board-title { font-size: 55px !important; }
  .floor-menu  { transform: translateX(-50%) scale(0.85) !important; }
}
```

---

## 9. Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| CMS | Payload CMS (headless, self-hosted) |
| Estilo | Tailwind CSS v4 |
| Tipografia | Geist Sans + Geist Mono (Google Fonts) · Switzer (self-hosted `.otf`) |
| Rich text | @payloadcms/richtext-lexical |
| Prose | @tailwindcss/typography |
| Loading | nextjs-toploader |
| Analytics | Google Tag Manager (GTM-M4LWVQWF) |

---

## 10. Tom de Voz

### Princípios

| | |
|---|---|
| **Minimalismo lexical** | O mínimo de palavras. Sem subtítulos explicativos, sem CTAs genéricos. |
| **Lowercase como postura** | A marca se escreve sempre `brunodup` — sem maiúsculas. Reflete anti-corporativismo. |
| **Direto, sem drama** | "voltar" (não "← Voltar para o início"). "Veja também" (não "Conteúdo relacionado que você pode gostar"). |
| **Português como escolha** | Toda a interface é pt-BR, inclusive micro-textos. Não é traduzida pro inglês. |
| **Pessoal, não profissional** | É um portfólio de *pensamentos*, não de serviços. A linguagem não vende — apresenta. |

### Voz em prática

| Contexto | Exemplo correto | Evitar |
|---|---|---|
| Marca | `brunodup` | `BrunoDup`, `Bruno Dup`, `BRUNODUP` |
| Meta description | `brunodup — portfólio e pensamentos visuais.` | `Bruno Dup | Designer & Developer Portfolio` |
| Back nav | `voltar` | `← Voltar`, `Go back`, `Return` |
| Section title | `Veja também` | `Você também pode gostar`, `Related posts` |
| Placeholder de tipo | `video`, `texto`, `áudio` | `Video Content`, `Article`, `Audio Track` |
| SEO title pattern | `{título} — brunodup` | `{título} | Bruno Dup` |
| Label de tipo (mono) | `CITAÇÃO`, `SNIPPET`, `IMAGEM` | `Quote Post`, `Code Snippet` |

### Micro-copy

- Labels de tipo sempre em uppercase, font-mono, tracking-widest — transmitem **frieza técnica** contrastando com o conteúdo pessoal
- Textos de UI ficam em minúsculas quando são ações (`voltar`) e em uppercase quando são categorias/rótulos (`VEJA TAMBÉM` → não, é título case: `Veja também`)
- Código e snippets usam mono para **tudo** — modo, badges, metadados

---

## 11. Padrões a manter

1. **Não usar cores além do núcleo preto/branco** na interface. O azul existe apenas no loader.
2. **Cards sempre com `CARD_SHADOW`** — sem ele, o card flutua sem peso.
3. **Switzer só para display** — body em Geist Sans, código em Geist Mono.
4. **Animações de entrada sempre com spring** (`cubic-bezier(0.34, 1.56, 0.64, 1)`) — nunca `ease-in-out` liso.
5. **O mural não tem scroll** — qualquer novo elemento na home deve respeitar o layout fullscreen com posição absoluta.
6. **Português em tudo** — mesmo que o conteúdo do post seja em inglês, a UI fica em pt-BR.
7. **Lowercase para a marca** — em qualquer menção textual, código ou documento.
