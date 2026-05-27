import { expand } from 'emmet'

export type JsMode = 'vanilla' | 'jsx' | 'threejs'

// ── Universal base64 (works on server and browser) ───────────────────────────
function toBase64(str: string): string {
  if (typeof window !== 'undefined') {
    return window.btoa(unescape(encodeURIComponent(str)))
  }
  return Buffer.from(str, 'utf-8').toString('base64')
}

// ── SCSS block for iframe srcdoc ──────────────────────────────────────────────
// sass.sync.js compiles synchronously in the iframe before body content runs.
// CSS is base64-encoded so any characters (backticks, quotes…) are safe.
function scssBlock(css: string): string {
  const b64 = toBase64(css)
  return (
    `<script src="https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.js"><\/script>` +
    `<script>Sass.compile(decodeURIComponent(escape(atob('${b64}'))),function(r){` +
    `var s=document.createElement('style');s.textContent=r.text||'';document.head.appendChild(s);` +
    `});<\/script>`
  )
}

const ERROR_CAPTURE =
  `<script>window.onerror=function(m,s,l){` +
  `window.parent.postMessage({type:'pg-err',msg:m,src:s,line:l},'*');return true;` +
  `};<\/script>`

// ── iframe document builder ───────────────────────────────────────────────────
export function buildSrcdoc(html: string, css: string, js: string, mode: JsMode): string {
  if (mode === 'jsx') return (
    `<!DOCTYPE html><html><head>` +
    `<script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>` +
    `<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>` +
    `<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>` +
    scssBlock(css) +
    `</head><body>${ERROR_CAPTURE}${html}` +
    `<script type="text/babel">${js}<\/script></body></html>`
  )

  if (mode === 'threejs') return (
    `<!DOCTYPE html><html><head>` +
    `<script src="https://unpkg.com/three@0.158.0/build/three.min.js"><\/script>` +
    `<style>*{margin:0;padding:0;overflow:hidden}canvas{display:block}<\/style>` +
    scssBlock(css) +
    `</head><body>${ERROR_CAPTURE}${html}<script>${js}<\/script></body></html>`
  )

  return (
    `<!DOCTYPE html><html><head>${scssBlock(css)}</head>` +
    `<body>${ERROR_CAPTURE}${html}<script>${js}<\/script></body></html>`
  )
}

// ── SCSS → CSS compiler (browser-side) ───────────────────────────────────────
// Loads sass.js CDN once, then compiles SCSS and returns plain CSS string.
// The result replaces the textarea content so the user can copy it.
declare global {
  interface Window {
    Sass?: {
      compile: (scss: string, cb: (result: { text?: string; message?: string }) => void) => void
    }
  }
}

let sassPromise: Promise<void> | null = null

function loadSass(): Promise<void> {
  if (sassPromise) return sassPromise
  if (window.Sass) return Promise.resolve()
  sassPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.js'
    s.onload = () => resolve()
    s.onerror = () => { sassPromise = null; reject(new Error('Falha ao carregar sass.js')) }
    document.head.appendChild(s)
  })
  return sassPromise
}

export async function compileScss(scss: string): Promise<string> {
  await loadSass()
  return new Promise((resolve, reject) => {
    window.Sass!.compile(scss, (result) => {
      if (result.message) reject(new Error(result.message))
      else resolve(result.text ?? '')
    })
  })
}

// ── Emmet expansion ───────────────────────────────────────────────────────────
export function processExpansion(raw: string): { text: string; cursor: number } {
  let firstTabstopIndex = -1
  const re = /\$\{(\d+)(?::([^}]*))?\}/g
  let m: RegExpExecArray | null
  const stops: Array<{ index: number; len: number; placeholder: string }> = []

  while ((m = re.exec(raw)) !== null) {
    stops.push({ index: m.index, len: m[0].length, placeholder: m[2] ?? '' })
  }

  let text = raw
  let shift = 0
  for (const stop of stops) {
    const pos = stop.index + shift
    text = text.slice(0, pos) + stop.placeholder + text.slice(pos + stop.len)
    if (firstTabstopIndex === -1) firstTabstopIndex = pos
    shift += stop.placeholder.length - stop.len
  }

  return { text, cursor: firstTabstopIndex >= 0 ? firstTabstopIndex : text.length }
}

export function handleEmmetTab(
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  value: string,
  onChange: (v: string) => void,
): void {
  if (e.key !== 'Tab') return
  e.preventDefault()

  const ta = e.currentTarget
  const start = ta.selectionStart
  const end = ta.selectionEnd

  const before = value.slice(0, start)
  const lineStart = before.lastIndexOf('\n') + 1
  const lineText = before.slice(lineStart)
  const leading = lineText.match(/^(\s*)/)?.[1] ?? ''
  const abbr = lineText.slice(leading.length)

  if (!abbr.trim()) {
    const spaces = '  '
    onChange(value.slice(0, start) + spaces + value.slice(end))
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + spaces.length })
    return
  }

  try {
    const raw = expand(abbr)
    const { text, cursor } = processExpansion(raw)
    const insertAt = lineStart + leading.length
    onChange(value.slice(0, insertAt) + text + value.slice(start))
    const newPos = insertAt + cursor
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos })
  } catch {
    const spaces = '  '
    onChange(value.slice(0, start) + spaces + value.slice(end))
    requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = start + spaces.length })
  }
}
