'use client'

import { useState } from 'react'

import { EMAIL_RE, submitLead } from './leadClient'

/**
 * Modal de captação: aparece quando a pessoa aciona a ação principal de uma
 * ferramenta sem ter deixado o e-mail ainda. Uma vez só, por navegador.
 */
export default function EmailGate({
  source,
  onDone,
  onClose,
}: {
  source: string
  onDone: () => void
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async () => {
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError(true)
      return
    }
    setSending(true)
    await submitLead(value, source)
    onDone()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="deixa teu e-mail pra liberar"
    >
      <div
        className="w-full max-w-sm bg-white rounded-md border border-black p-6 -rotate-1"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-3">
          só uma vez · sem spam
        </p>
        <p className="text-base font-medium text-black leading-snug mb-1">
          deixa teu e-mail pra liberar
        </p>
        <p className="text-sm leading-relaxed text-[#555] mb-5">
          é grátis mesmo. em troca, te aviso quando sair ferramenta nova.
        </p>

        <input
          type="email"
          value={email}
          autoFocus
          onChange={(e) => {
            setEmail(e.target.value)
            setError(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="teu@email.com"
          className={`w-full border rounded-md p-3 text-sm text-[#333] placeholder:text-gray-300 outline-none transition-colors mb-3 ${
            error ? 'border-black' : 'border-gray-200 focus:border-black'
          }`}
        />
        {error && (
          <p className="text-[10px] font-mono uppercase tracking-widest text-black mb-3">
            e-mail inválido
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="border border-black rounded-md px-5 py-2.5 text-xs uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-150 disabled:opacity-40"
          >
            {sending ? 'liberando…' : 'liberar'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-mono uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
          >
            agora não
          </button>
        </div>
      </div>
    </div>
  )
}
