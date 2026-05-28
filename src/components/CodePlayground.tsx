'use client'

import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { html } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import type { Extension } from '@codemirror/state'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { expand } = require('emmet') as { expand: (abbr: string, options?: Record<string, unknown>) => string }
import { buildSrcdoc, compileScss, processExpansion, type JsMode } from '@/lib/playground'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ── Emmet CodeMirror extension ────────────────────────────────────────────────
function makeEmmetExtension(): Extension {
  return Prec.high(
    keymap.of([
      {
        key: 'Tab',
        run: (view) => {
          const { state } = view
          const { from } = state.selection.main
          const line = state.doc.lineAt(from)
          const textBefore = line.text.slice(0, from - line.from)
          const leading = textBefore.match(/^(\s*)/)?.[1] ?? ''
          const abbr = textBefore.slice(leading.length)

          if (!abbr.trim()) {
            view.dispatch({ changes: { from, to: from, insert: '  ' } })
            return true
          }

          try {
            const raw = expand(abbr)
            const { text, cursor } = processExpansion(raw)
            const insertFrom = line.from + leading.length
            view.dispatch({
              changes: { from: insertFrom, to: from, insert: text },
              selection: { anchor: insertFrom + cursor },
            })
          } catch {
            view.dispatch({ changes: { from, to: from, insert: '  ' } })
          }
          return true
        },
      },
    ]),
  )
}

// ── Editor panel ──────────────────────────────────────────────────────────────
type CssView = 'scss' | 'css'

type CssToggleProps = {
  view: CssView
  compiled: string | null
  compiling: boolean
  onToggle: () => void
}

function EditorPanel({
  label,
  language,
  value,
  onChange,
  cssToggle,
  extraExtensions = [],
  accordionOpen,
  onAccordionToggle,
}: {
  label: string
  language: 'html' | 'css' | 'javascript'
  value: string
  onChange: (v: string) => void
  cssToggle?: CssToggleProps
  extraExtensions?: Extension[]
  // accordion (mobile only) — undefined = always expanded
  accordionOpen?: boolean
  onAccordionToggle?: () => void
}) {
  const [copied, setCopied] = useState(false)

  const displayValue =
    cssToggle?.view === 'css' ? (cssToggle.compiled ?? '') : value
  const isReadOnly = cssToggle?.view === 'css'

  const handleCopy = () =>
    navigator.clipboard.writeText(displayValue).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })

  const extensions = useMemo<Extension[]>(() => {
    const lang =
      language === 'html' ? html() : language === 'css' ? cssLang() : javascript()
    return [lang, ...extraExtensions]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  const isAccordion = onAccordionToggle !== undefined

  return (
    // On desktop: flex-1 (equal split). On mobile: auto height (open=content, closed=header only)
    <div className="flex flex-col md:flex-1 md:min-h-0 border-b border-neutral-800 last:border-b-0">
      {/* header — clickable on mobile to toggle accordion */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 shrink-0 ${isAccordion ? 'cursor-pointer md:cursor-default select-none' : ''}`}
        onClick={() => isAccordion && onAccordionToggle?.()}
      >
        <div className="flex items-center gap-1.5">
          {isAccordion && (
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className="md:hidden text-neutral-500 transition-transform duration-150 shrink-0"
              style={{ transform: accordionOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
            >
              <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
            {label}
          </span>
        </div>
        {/* stop propagation so inner button clicks don't toggle accordion */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {cssToggle && (
            <div className="flex items-center bg-neutral-800 rounded p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => cssToggle.view !== 'scss' && cssToggle.onToggle()}
                className={`text-[10px] font-mono px-2 py-0.5 rounded leading-none transition-colors ${
                  cssToggle.view === 'scss'
                    ? 'bg-neutral-600 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                SCSS
              </button>
              <button
                type="button"
                onClick={() => cssToggle.view !== 'css' && cssToggle.onToggle()}
                disabled={cssToggle.compiling}
                className={`text-[10px] font-mono px-2 py-0.5 rounded leading-none transition-colors disabled:opacity-40 ${
                  cssToggle.view === 'css'
                    ? 'bg-neutral-600 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {cssToggle.compiling && cssToggle.view === 'scss' ? '…' : 'CSS'}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] font-mono text-neutral-500 hover:text-white transition-colors"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
      {/* editor content — h-44 when open on mobile, h-0 when closed; always flex-1 on desktop */}
      <div
        className={[
          'overflow-auto bg-neutral-950',
          'md:flex-1 md:min-h-0 md:h-auto md:overflow-auto',
          isAccordion
            ? (accordionOpen ? 'h-44' : 'h-0 overflow-hidden')
            : 'flex-1 min-h-0',
        ].join(' ')}
      >
        <CodeMirror
          value={displayValue}
          onChange={(val) => !isReadOnly && onChange(val)}
          theme={oneDark}
          extensions={extensions}
          readOnly={isReadOnly}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            tabSize: 2,
          }}
          style={{ fontSize: '13px', fontFamily: '"Fira Code", "Cascadia Code", monospace' }}
          className="h-full"
        />
      </div>
    </div>
  )
}

// ── Main playground ───────────────────────────────────────────────────────────
type Props = {
  html: string
  css: string
  js: string
  jsMode: JsMode
  title: string
  className?: string
}

export default function CodePlayground({ html, css, js, jsMode, title, className }: Props) {
  const [htmlVal, setHtmlVal] = useState(html)
  const [cssVal, setCssVal] = useState(css)
  const [jsVal, setJsVal] = useState(js)

  // SCSS toggle
  const [cssView, setCssView] = useState<CssView>('scss')
  const [compiledCss, setCompiledCss] = useState<string | null>(null)
  const [scssCompiling, setScssCompiling] = useState(false)
  const [scssErr, setScssErr] = useState<string | null>(null)

  const [mobilePanel, setMobilePanel] = useState<'html' | 'css' | 'js'>('html')

  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(html, css, js, jsMode))
  const [errors, setErrors] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Emmet extension (memoized once)
  const emmetExt = useMemo(() => makeEmmetExtension(), [])

  const run = useCallback(() => {
    setErrors([])
    setSrcdoc(buildSrcdoc(htmlVal, cssVal, jsVal, jsMode))
  }, [htmlVal, cssVal, jsVal, jsMode])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(run, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [run])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== window.location.origin && e.origin !== 'null') return
      if (e.data?.type === 'pg-err') {
        setErrors((prev) => [
          ...prev,
          `${e.data.msg}${e.data.src ? ` — ${e.data.src}:${e.data.line}` : ''}`,
        ])
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleCssToggle = useCallback(async () => {
    if (cssView === 'scss') {
      // going to CSS — compile first if needed
      if (compiledCss === null) {
        setScssCompiling(true)
        setScssErr(null)
        try {
          const result = await compileScss(cssVal)
          setCompiledCss(result)
        } catch (err) {
          setScssErr(err instanceof Error ? err.message : 'Erro ao compilar')
          return
        } finally {
          setScssCompiling(false)
        }
      }
      setCssView('css')
    } else {
      // back to SCSS
      setCssView('scss')
    }
  }, [cssView, compiledCss, cssVal])

  const handleCssChange = useCallback((v: string) => {
    setCssVal(v)
    setCompiledCss(null) // source changed → compiled is stale
  }, [])

  return (
    <div className={`flex flex-col bg-neutral-950 text-white ${className ?? 'h-screen'}`}>
      {/* topbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 shrink-0">
        <span className="font-mono text-sm text-neutral-300 truncate">{title}</span>
        <div className="flex items-center gap-3">
          {scssErr && (
            <span className="font-mono text-[11px] text-red-400 max-w-[200px] truncate" title={scssErr}>
              ✕ {scssErr}
            </span>
          )}
          <button
            type="button"
            onClick={run}
            className="px-3 py-1 text-[12px] font-mono bg-white text-black rounded hover:bg-neutral-200 transition-colors"
          >
            Run ▶
          </button>
        </div>
      </div>

      {/* main */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* editors */}
        <div className="flex flex-col md:w-2/5 md:min-h-0 md:border-r border-neutral-800">
          <EditorPanel
            label="HTML"
            language="html"
            value={htmlVal}
            onChange={setHtmlVal}
            extraExtensions={[emmetExt]}
            accordionOpen={mobilePanel === 'html'}
            onAccordionToggle={() => setMobilePanel('html')}
          />
          <EditorPanel
            label="CSS / SCSS"
            language="css"
            value={cssVal}
            onChange={handleCssChange}
            cssToggle={{ view: cssView, compiled: compiledCss, compiling: scssCompiling, onToggle: handleCssToggle }}
            accordionOpen={mobilePanel === 'css'}
            onAccordionToggle={() => setMobilePanel('css')}
          />
          <EditorPanel
            label="JS"
            language="javascript"
            value={jsVal}
            onChange={setJsVal}
            accordionOpen={mobilePanel === 'js'}
            onAccordionToggle={() => setMobilePanel('js')}
          />
        </div>

        {/* preview */}
        <div className="flex flex-col flex-1 min-h-0">
          <iframe
            srcDoc={srcdoc}
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-pointer-lock"
            className="flex-1 w-full border-0 bg-white"
            title="preview"
          />
          {errors.length > 0 && (
            <div className="shrink-0 max-h-32 overflow-y-auto bg-red-950 border-t border-red-800 px-3 py-2">
              {errors.map((err, i) => (
                <p key={i} className="font-mono text-[11px] text-red-300 leading-relaxed">✕ {err}</p>
              ))}
              <button
                type="button"
                onClick={() => setErrors([])}
                className="mt-1 text-[10px] text-red-400 hover:text-white"
              >
                limpar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
