'use client'

import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { html } from '@codemirror/lang-html'
import { css as cssLang } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { keymap } from '@codemirror/view'
import { Prec } from '@codemirror/state'
import type { Extension } from '@codemirror/state'
import { expand } from 'emmet'
import { useField } from '@payloadcms/ui'
import { buildSrcdoc, compileScss, processExpansion, type JsMode } from '@/lib/playground'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ── Emmet extension ───────────────────────────────────────────────────────────
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

// ── Editor pane ───────────────────────────────────────────────────────────────
type CssView = 'scss' | 'css'

function EditorPane({
  label,
  language,
  value,
  onChange,
  cssToggle,
  extraExtensions = [],
}: {
  label: string
  language: 'html' | 'css' | 'javascript'
  value: string
  onChange: (v: string) => void
  cssToggle?: { view: CssView; compiled: string | null; compiling: boolean; onToggle: () => void }
  extraExtensions?: Extension[]
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, borderBottom: '1px solid #2a2a2a' }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 12px', background: '#1c1c1c', borderBottom: '1px solid #2a2a2a', flexShrink: 0 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, color: '#666' }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {cssToggle && (
            <div style={{ display: 'flex', alignItems: 'center', background: '#2a2a2a', borderRadius: 4, padding: 2, gap: 2 }}>
              <button
                type="button"
                onClick={() => cssToggle.view !== 'scss' && cssToggle.onToggle()}
                style={{
                  fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 3,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: cssToggle.view === 'scss' ? '#444' : 'transparent',
                  color: cssToggle.view === 'scss' ? '#fff' : '#666',
                }}
              >
                SCSS
              </button>
              <button
                type="button"
                onClick={() => cssToggle.view !== 'css' && cssToggle.onToggle()}
                disabled={cssToggle.compiling}
                style={{
                  fontFamily: 'monospace', fontSize: 10, padding: '2px 7px', borderRadius: 3,
                  border: 'none', cursor: cssToggle.compiling ? 'wait' : 'pointer', transition: 'all 0.15s',
                  background: cssToggle.view === 'css' ? '#444' : 'transparent',
                  color: cssToggle.view === 'css' ? '#fff' : '#666',
                  opacity: cssToggle.compiling ? 0.5 : 1,
                }}
              >
                {cssToggle.compiling && cssToggle.view === 'scss' ? '…' : 'CSS'}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleCopy}
            style={{ fontFamily: 'monospace', fontSize: 10, color: copied ? '#6ee7b7' : '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
      {/* editor */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: '#111' }}>
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
          style={{ fontSize: '12px', fontFamily: '"Fira Code", "Cascadia Code", monospace', height: '100%' }}
        />
      </div>
    </div>
  )
}

// ── Main admin playground ─────────────────────────────────────────────────────
export default function CodeSnippetPlayground() {
  const { value: fHtml = '', setValue: setFHtml } = useField<string>({ path: 'html' })
  const { value: fCss  = '', setValue: setFCss  } = useField<string>({ path: 'css'  })
  const { value: fJs   = '', setValue: setFJs   } = useField<string>({ path: 'js'   })
  const { value: fMode = 'vanilla' }               = useField<string>({ path: 'jsMode' })

  const [html,    setHtml]    = useState<string>((fHtml as string) ?? '')
  const [css,     setCssRaw]  = useState<string>((fCss  as string) ?? '')
  const [js,      setJs]      = useState<string>((fJs   as string) ?? '')
  const jsMode = (fMode as JsMode) ?? 'vanilla'

  // SCSS toggle
  const [cssView,      setCssView]      = useState<CssView>('scss')
  const [compiledCss,  setCompiledCss]  = useState<string | null>(null)
  const [scssCompiling, setScssCompiling] = useState(false)

  const [srcdoc, setSrcdoc] = useState(() =>
    buildSrcdoc((fHtml as string) ?? '', (fCss as string) ?? '', (fJs as string) ?? '', (fMode as JsMode) ?? 'vanilla'),
  )
  const [errors, setErrors] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const emmetExt = useMemo(() => makeEmmetExtension(), [])

  // Sync local state → Payload form
  // Setter refs intentionally excluded from deps (may be unstable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFHtml(html) }, [html])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFCss(css)   }, [css])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFJs(js)     }, [js])

  const run = useCallback(() => {
    setErrors([])
    setSrcdoc(buildSrcdoc(html, css, js, jsMode))
  }, [html, css, js, jsMode])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(run, 800)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [run])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
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
      if (compiledCss === null) {
        setScssCompiling(true)
        try {
          const result = await compileScss(css)
          setCompiledCss(result)
        } catch {
          return
        } finally {
          setScssCompiling(false)
        }
      }
      setCssView('css')
    } else {
      setCssView('scss')
    }
  }, [cssView, compiledCss, css])

  const handleCssChange = useCallback((v: string) => {
    setCssRaw(v)
    setCompiledCss(null)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
          Playground · modo: <strong style={{ color: '#aaa' }}>{jsMode}</strong>
          <span style={{ marginLeft: 8, fontSize: 10, color: '#555' }}>(altere no painel lateral)</span>
        </span>
        <button
          type="button"
          onClick={run}
          style={{ fontFamily: 'monospace', fontSize: 11, background: '#fff', color: '#000', border: 'none', borderRadius: 3, padding: '4px 12px', cursor: 'pointer', fontWeight: 600 }}
        >
          Run ▶
        </button>
      </div>

      <div style={{ display: 'flex', height: 580, border: '1px solid #2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
        {/* editors */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '42%', minHeight: 0, borderRight: '1px solid #2a2a2a' }}>
          <EditorPane
            label="HTML"
            language="html"
            value={html}
            onChange={setHtml}
            extraExtensions={[emmetExt]}
          />
          <EditorPane
            label="CSS / SCSS"
            language="css"
            value={css}
            onChange={handleCssChange}
            cssToggle={{ view: cssView, compiled: compiledCss, compiling: scssCompiling, onToggle: handleCssToggle }}
          />
          <EditorPane
            label="JS"
            language="javascript"
            value={js}
            onChange={setJs}
          />
        </div>

        {/* preview */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <iframe
            srcDoc={srcdoc}
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-pointer-lock allow-downloads"
            style={{ flex: 1, border: 'none', background: '#fff' }}
            title="preview"
          />
          {errors.length > 0 && (
            <div style={{ flexShrink: 0, maxHeight: 100, overflowY: 'auto', background: '#1a0000', borderTop: '1px solid #550000', padding: '6px 12px' }}>
              {errors.map((err, i) => (
                <p key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: '#ff8888', margin: '2px 0' }}>✕ {err}</p>
              ))}
              <button
                type="button"
                onClick={() => setErrors([])}
                style={{ fontSize: 10, color: '#ff6666', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
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
