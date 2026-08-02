'use client'

import { useEffect, useState } from 'react'

import { EMAIL_RE, hasStoredEmail, submitLead } from './leadClient'

/**
 * Trava dura das ferramentas: a página apresenta (título, intro, FAQ e um
 * preview desfocado da ferramenta), mas usar só depois de deixar o e-mail —
 * uma vez por navegador, vale pra todas as ferramentas.
 */
export default function ToolGate({
  source,
  children,
}: {
  source: string
  children: React.ReactNode
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setUnlocked(hasStoredEmail())
    setReady(true)
  }, [])

  const submit = async () => {
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError(true)
      return
    }
    setSending(true)
    await submitLead(value, source)
    setUnlocked(true)
  }

  // Antes de saber o estado (primeiro paint), segura o layout sem mostrar nada interativo.
  if (!ready) return <div className="max-w-[680px] min-h-[320px]" aria-hidden="true" />

  if (unlocked) return <>{children}</>

  return (
    <div className="relative max-w-[680px]">
      {/* preview — dá pra entender a ferramenta, não dá pra usar */}
      <div
        className="pointer-events-none select-none blur-[3px] opacity-50 max-h-[340px] overflow-hidden"
        aria-hidden="true"
        inert
      >
        {children}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />

      {/* form de liberação */}
      <div className="relative -mt-24 max-w-md mx-auto border border-dashed border-gray-400 rounded-md bg-white p-6 -rotate-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">
          só uma vez · vale pra todas as ferramentas
        </p>
        <p className="text-base font-medium text-black leading-snug mb-1">
          deixa teu e-mail pra usar
        </p>
        <p className="text-sm leading-relaxed text-[#555] mb-5">
          é grátis mesmo, sem senha e sem spam — em troca, te aviso quando sair
          ferramenta nova.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="teu@email.com"
            className={`flex-1 border rounded-md p-3 text-sm text-[#333] placeholder:text-gray-300 outline-none transition-colors ${
              error ? 'border-black' : 'border-gray-200 focus:border-black'
            }`}
          />
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="border border-black rounded-md px-5 py-3 text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-40 shrink-0"
          >
            {sending ? 'liberando…' : 'liberar'}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-black">
            e-mail inválido
          </p>
        )}
      </div>
    </div>
  )
}
