# brunodup.com

Site pessoal e portfólio de Bruno Dup — construído com Next.js 15, Payload CMS 3 e Supabase.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| CMS | Payload CMS 3 (headless, embutido) |
| Banco | PostgreSQL via Supabase |
| Storage | Supabase S3-compatible (imagens/vídeos/áudios) |
| Estilização | Tailwind CSS v4 + `@tailwindcss/typography` |
| Editor de código | CodeMirror 6 + Emmet |
| Deploy | Vercel |
| Node | ≥ 22 |

---

## Rodando localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar o arquivo de env (ver seção abaixo)
cp .env.example .env.local   # ou crie manualmente

# 3. Iniciar em modo dev (aplica migrações via push automático)
npm run dev
```

O servidor sobe em `http://localhost:3000`.  
O admin do CMS fica em `http://localhost:3000/admin`.

> Em `NODE_ENV=development`, o Payload usa `push: true` — o schema é sincronizado automaticamente sem rodar migrações manualmente.

---

## Build de produção

```bash
npm run build   # executa `payload migrate --force-accept-warning` + `next build`
npm start
```

O script de build aplica as migrações pendentes no banco antes de compilar o Next.js.

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz com as seguintes variáveis:

```env
# Payload
PAYLOAD_SECRET=uma-string-secreta-longa

# Banco de dados (Supabase)
DATABASE_URI=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DATABASE_SCHEMA=public          # "public" para prod, "dev" para preview

# Supabase Storage (S3-compatible)
SUPABASE_URL=https://[PROJECT_REF].supabase.co
S3_BUCKET=brunodup.com
S3_ENDPOINT=https://[PROJECT_REF].supabase.co/storage/v1/s3
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# URL do servidor (opcional em dev — autodetectada via VERCEL_BRANCH_URL / VERCEL_URL)
NEXT_PUBLIC_SERVER_URL=https://brunodup.com

# Vídeo de fundo da home (opcional — branch dev usa /dup-video-final-full.mp4 hardcoded)
BACKGROUND_VIDEO_URL=https://...
BACKGROUND_VIDEO_POSTER_URL=https://...
```

---

## Isolamento de ambientes (prod vs. dev)

O banco de dados é **um único projeto Supabase** com dois schemas PostgreSQL:

| Branch / Ambiente | Schema | URL Vercel |
|-------------------|--------|------------|
| `main` (produção) | `public` | brunodup.com |
| `dev` (preview) | `dev` | preview URL do Vercel |

O schema é selecionado pela variável `DATABASE_SCHEMA`. No Vercel, configure:
- Production → `DATABASE_SCHEMA=public`
- Preview → `DATABASE_SCHEMA=dev`

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── (frontend)/             # Rotas públicas do site
│   │   ├── page.tsx            # Home — mural interativo
│   │   ├── post/[slug]/        # Página de post (6 layouts)
│   │   ├── categoria/[slug]/   # Arquivo de categoria
│   │   ├── [slug]/             # Páginas estáticas (CMS)
│   │   ├── layout.tsx          # Layout raiz (fonte, TopLoader)
│   │   └── globals.css         # CSS global (fontes, animações, scrollbar)
│   │
│   ├── (payload)/              # Admin Payload CMS
│   │   ├── admin/[[...segments]]/  # Painel admin
│   │   └── api/[...slug]/      # REST e GraphQL do Payload
│   │
│   └── api/
│       └── post-position/[id]/ # PATCH — persiste posição de card no mural
│
├── collections/
│   ├── Posts.ts                # Posts (6 tipos, slug auto, posição XY)
│   ├── Categories.ts           # Categorias (slug auto, unique)
│   ├── Media.ts                # Upload (imagem/vídeo/áudio, thumbnails S3)
│   ├── Pages.ts                # Páginas estáticas (slug auto)
│   └── Users.ts                # Usuários admin (auth, create desabilitado)
│
├── globals/
│   └── Menu.ts                 # Menu de navegação (array de itens)
│
├── components/
│   ├── DraggableBoardClient.tsx  # Wrapper SSR-off (dynamic import)
│   ├── DraggableBoard.tsx        # Mural interativo (drag, vídeo, animações)
│   ├── CodePlayground.tsx        # Editor de código com preview ao vivo
│   ├── Logo.tsx                  # SVG BRUNODUP.COM com grupos animados
│   ├── LogoLink.tsx              # Logo clicável que volta para /
│   ├── FitText.tsx               # Texto que redimensiona para caber no container
│   ├── ImageWithModal.tsx        # Imagem que abre em lightbox ao clicar
│   └── admin/
│       ├── CodeSnippetPlayground.tsx  # Campo custom no Payload admin
│       └── MenuRowLabel.tsx           # Label de linha no array de menu
│
├── migrations/
│   ├── 20260527_111352.ts
│   ├── 20260528_000000_initial_baseline.ts
│   ├── 20260528_120000_add_background_video_to_menu.ts
│   └── index.ts                 # Registro de todas as migrations
│
├── lib/
│   └── playground.ts            # Helpers: buildSrcdoc, compileScss, processExpansion
│
└── payload.config.ts            # Configuração central do Payload CMS
```

---

## Collections (banco de dados)

### `posts`

O conteúdo principal do site. Suporta 6 tipos:

| Tipo | Campos específicos | Card no mural |
|------|-------------------|---------------|
| `text` | `title`, `body` (richtext) | TextCard (branco, texto) |
| `image` | `title`, `body`, `media` | ImageCard (thumbnail 480×480) |
| `quote` | `title`, `body` | TextCard com borda esquerda |
| `video` | `title`, `body`, `media` | VideoCard (preview escuro) |
| `audio` | `title`, `body`, `media` | AudioCard (waveform SVG) |
| `snippet` | `title`, `body`, `html`, `css`, `js`, `jsMode`, `thumbnail` | SnippetCard (preview de código) |

**Campos comuns a todos os tipos:**
- `slug` — gerado automaticamente a partir do `title`, único, editável
- `position_x`, `position_y` — porcentagem (0–100%) da posição no mural, gerada aleatoriamente na criação
- `categories` — relacionamento many-to-many com Categories

### `categories`
`name` + `slug` (auto-gerado, único, indexado)

### `media`
- Upload para Supabase Storage via S3
- Tipos aceitos: `image/*`, `video/*`, `audio/*`
- Thumbnails gerados automaticamente: `thumbnail` (480×480 crop) e `card` (1024px width)
- URL servida diretamente do CDN Supabase (não passa pelo proxy do Payload)

### `pages`
Páginas estáticas com `title`, `body` (richtext) e `slug` (auto-gerado). URL: `/{slug}`

### `users`
Autenticação do admin Payload. Criação de usuários **desabilitada** via interface — gerenciar direto no banco ou via `payload` CLI.

### Global: `menu`
Array de itens de navegação: `label`, `href`, `target` (`_self` | `_blank`). Exibido no mural como menu em perspectiva 3D.

---

## Rotas do frontend

| Rota | Arquivo | Revalidação | Descrição |
|------|---------|-------------|-----------|
| `/` | `page.tsx` | sempre (0s) | Mural interativo com todos os posts |
| `/post/[slug]` | `post/[slug]/page.tsx` | 60s | Página de detalhe do post |
| `/categoria/[slug]` | `categoria/[slug]/page.tsx` | 60s | Arquivo de categoria com grid de posts |
| `/[slug]` | `[slug]/page.tsx` | 60s | Páginas estáticas do CMS |
| `/admin` | Payload interno | — | Painel de administração |

---

## API endpoints

### `PATCH /api/post-position/[id]`
Persiste a posição de um card no mural após arrastar.

```json
// Body
{ "position_x": 45.23, "position_y": 67.89 }

// Response 200
{ "ok": true }
```

**Autenticação requerida** via sessão Payload.  
Valores `x` e `y` devem ser números entre 0 e 100.

---

## Interações e animações

### Mural interativo (`DraggableBoard.tsx`)

O mural é a peça central do site. Carrega via `dynamic import` com `ssr: false`.

**Zonas de segurança**  
Cards são repelidos de duas áreas para não sobrepor o logo e o menu:
- Zona central: 35–65% × 20–80% (área do logo)
- Zona inferior: 22–78% × 80–100% (área do menu)

**Vídeo de fundo e timeline de entrada**

| Tempo | Evento |
|-------|--------|
| 0s | Vídeo inicia (`autoPlay muted playsInline`) |
| 4s | Cards entram voando do topo (`triggerEntry`) |
| 6.5s | Vídeo pausa automaticamente |
| — | Usuário interage com os cards livremente |

**Clique em um card (link interno)**
1. Evento capturado na fase de captura do `boardRef` — `preventDefault` + `stopPropagation`
2. `pendingPathRef` recebe o path de destino
3. `playingToEndRef` liberado — vídeo retoma a partir de 6.5s
4. `exitPhase = 1` → cards sobem e somem com `scale(1.6) translateY(-80vh)`
5. Evento `onEnded` do vídeo dispara `router.push(pendingPath)` — navegação acontece

**Arrastar cards**
- Drag via mouse e touch (listeners no `window`)
- Atualização direta no DOM durante o drag — zero re-renders do React por pixel
- Ao soltar: repele da zona de segurança, arredonda para 2 casas decimais, persiste via `PATCH /api/post-position/[id]`

**Sem vídeo** (`videoSrc` undefined): `triggerEntry` dispara após 400ms via `setTimeout`

---

### Animação de entrada dos cards

```
Estado: hidden → ready (1 rAF) → visible (1 rAF)
Transform: translateY(-120vh) → translateY(0)
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)  — bounce
Delay: 0.45s + i × 0.07s  — stagger por índice do card
```

### Animação de saída dos cards (ao clicar)

```
Transform: scale(1.6) translateY(-80vh)
Opacity: 0
Duration: 0.6s transform / 0.5s opacity
```

### Logo (`Logo.tsx` + `globals.css`)

SVG `BRUNODUP.COM` dividido em 3 grupos animados:

| Classe CSS | Elemento SVG | Animação |
|------------|--------------|----------|
| `.logo-dup` | `BRUNODUP` | `logoDropBounce` — cai de -60px com bounce |
| `.logo-agency` | `COM` | `logoDropBounce` — junto com `.logo-dup` |
| `.logo-dot` | ponto `.` | `logoDropBounce` com delay de 400ms |

Animação ativa apenas com `@media (prefers-reduced-motion: no-preference)`.  
Sem animação: todos os elementos aparecem estáticos com visibilidade total.

### Menu em perspectiva 3D

```css
transform: perspective(500px) rotateX(44deg)
transform-origin: bottom center
/* grid 3 colunas, gap 12px, fixo no bottom */
```

Hover nos botões: `background: #000; color: #fff` (transição 0.15s).

### Top loader

Barra de progresso de navegação: gradiente `#7dd3fc → #1d4ed8` via `nextjs-toploader`.

### Página de categoria

Cards entram com `animate-slide-up` staggerado (`delay: i × 0.06s`).

### Lightbox de imagem (`ImageWithModal.tsx`)

Clique na imagem do post abre em tela cheia com fundo escuro.

---

## Code Playground (`CodePlayground.tsx`)

Editor de código ao vivo para posts do tipo `snippet`.

**Abas:** HTML · CSS (SCSS) · JS

| Feature | Descrição |
|---------|-----------|
| Syntax highlight | CodeMirror 6, tema One Dark |
| Emmet | Tab expande abreviações HTML (`div.container>ul>li*3`) |
| SCSS | Compilado em tempo real com debounce; toggle CSS compilado/bruto |
| Preview ao vivo | `<iframe srcdoc>` — atualiza a cada keystroke |
| Modo Vanilla | JS puro no `<script>` do iframe |
| Modo JSX | React + ReactDOM via CDN, transpile via Babel standalone |
| Modo Three.js | Three.js via CDN |
| Mobile | Editores em accordion por aba |
| Desktop | Split horizontal editor / preview |

No admin Payload, o playground é embutido no formulário de post como campo `ui` custom — preview ao lado direito no desktop.

---

## Fontes

| Fonte | Carregamento | Pesos |
|-------|-------------|-------|
| Geist Sans | `next/font/google` | variável |
| Geist Mono | `next/font/google` | variável |
| Switzer | `@font-face` local (`/public/fonts/switzer/`) | 100, 300, 400, 700, 800, 900 |

Switzer é usada nos botões do menu floor (`font-switzer font-bold`).

---

## Headers de segurança

Aplicados via `next.config.ts` em todas as rotas:

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Copiar dados de produção para dev

Para sincronizar o schema `dev` com os dados de produção, execute no SQL Editor do Supabase:

```sql
DELETE FROM dev.posts_rels;
DELETE FROM dev.posts;
DELETE FROM dev.categories;
DELETE FROM dev.media;
DELETE FROM dev.pages;
DELETE FROM dev.menu_items;

INSERT INTO dev.categories (id, name, updated_at, created_at, slug)
  SELECT id, name, updated_at, created_at, slug FROM public.categories;

INSERT INTO dev.media (id, alt, updated_at, created_at, url, thumbnail_u_r_l, filename,
  mime_type, filesize, width, height, focal_x, focal_y, sizes_thumbnail_url,
  sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_mime_type,
  sizes_thumbnail_filesize, sizes_thumbnail_filename, sizes_card_url, sizes_card_width,
  sizes_card_height, sizes_card_mime_type, sizes_card_filesize, sizes_card_filename)
  SELECT id, alt, updated_at, created_at, url, thumbnail_u_r_l, filename,
    mime_type, filesize, width, height, focal_x, focal_y, sizes_thumbnail_url,
    sizes_thumbnail_width, sizes_thumbnail_height, sizes_thumbnail_mime_type,
    sizes_thumbnail_filesize, sizes_thumbnail_filename, sizes_card_url, sizes_card_width,
    sizes_card_height, sizes_card_mime_type, sizes_card_filesize, sizes_card_filename
  FROM public.media;

INSERT INTO dev.posts (id, type, title, body, media_id, position_x, position_y, slug,
  updated_at, created_at, js_mode, html, css, js, thumbnail_id)
  SELECT id, type::text::dev.enum_posts_type, title, body, media_id, position_x,
    position_y, slug, updated_at, created_at, js_mode::text::dev.enum_posts_js_mode,
    html, css, js, thumbnail_id FROM public.posts;

INSERT INTO dev.posts_rels (id, "order", parent_id, path, categories_id)
  SELECT id, "order", parent_id, path, categories_id FROM public.posts_rels;

INSERT INTO dev.pages (id, title, body, slug, updated_at, created_at)
  SELECT id, title, body, slug, updated_at, created_at FROM public.pages;

INSERT INTO dev.menu_items (id, _order, _parent_id, label, href, target)
  SELECT id, _order, _parent_id, label, href, target::text::dev.enum_menu_items_target
  FROM public.menu_items;

SELECT setval('dev.categories_id_seq', COALESCE((SELECT MAX(id) FROM dev.categories), 1));
SELECT setval('dev.media_id_seq',      COALESCE((SELECT MAX(id) FROM dev.media), 1));
SELECT setval('dev.posts_id_seq',      COALESCE((SELECT MAX(id) FROM dev.posts), 1));
SELECT setval('dev.posts_rels_id_seq', COALESCE((SELECT MAX(id) FROM dev.posts_rels), 1));
SELECT setval('dev.pages_id_seq',      COALESCE((SELECT MAX(id) FROM dev.pages), 1));
```

---

## Branches e deploys

| Branch | Ambiente | Schema DB | Vídeo de fundo |
|--------|----------|-----------|----------------|
| `main` | Produção | `public` | `BACKGROUND_VIDEO_URL` (env Vercel) |
| `dev` | Preview Vercel | `dev` | `/dup-video-final-full.mp4` (hardcoded) |
| `bug` | Preview Vercel | `public` (cópia de main) | `BACKGROUND_VIDEO_URL` |

---

## Changelog

### branch `dev` — atual
- **fix:** vídeo trocado para `dup-video-final-full.mp4` (H.264, ~11s) — segmento final de ~4.6s visível após pausa em 6.5s
- **fix:** ponto do logo (`.logo-dot`) agora usa `<circle>` SVG em vez de `<path>` retangular
- **fix:** animação do logo — `opacity: 0` movido para dentro de `@media (prefers-reduced-motion: no-preference)`, corrigindo ponto invisível quando animações estão desativadas
- **fix:** `DraggableBoard.tsx` revertido para versão idêntica à `main`
- **fix:** campos `backgroundVideo` / `backgroundVideoPoster` removidos do `Menu.ts`
- **feat:** `payload.config.ts` — `serverURL` dinâmico via `VERCEL_BRANCH_URL`, CORS/CSRF com origens Vercel, `schemaName` por env, `push` apenas em dev

### branch `main` — produção
- **feat:** Code Playground — editor HTML/CSS(SCSS)/JS com Emmet, modos Vanilla/JSX/Three.js, preview ao vivo em iframe
- **feat:** Mural interativo — drag & drop de cards, timeline de vídeo com entrada e saída animadas
- **feat:** 6 tipos de post com layouts específicos na página de detalhe
- **feat:** Campo custom de playground no admin Payload (snippet)
- **feat:** Menu global em perspectiva 3D configurável via CMS
- **feat:** Isolamento de schemas PostgreSQL por branch (`public` / `dev`)
- **feat:** Supabase S3 Storage para mídia com CDN direto
- **feat:** Animação de entrada do logo com bounce e suporte a `prefers-reduced-motion`
- **feat:** Lightbox modal para imagens em posts
- **feat:** Seção "Veja também" com posts da mesma categoria
- **feat:** Página de arquivo por categoria com grid animado (slide-up staggerado)
- **feat:** Headers de segurança em todas as rotas
