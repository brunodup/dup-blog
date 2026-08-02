'use client'

import { useEffect, useState } from 'react'

import { EMAIL_RE, hasStoredEmail, submitLead } from './leadClient'

/** Bloco de captação da landing de ferramentas — estilo bilhete rabiscado. */
export default function EmailCaptureCard({ handClass }: { handClass?: string }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (hasStoredEmail()) setDone(true)
  }, [])

  const submit = async () => {
    const value = email.trim().toLowerCase()
    if (!EMAIL_RE.test(value)) {
      setError(true)
      return
    }
    setSending(true)
    await submitLead(value, 'landing-ferramentas')
    setDone(true)
  }

  return (
    <div className="max-w-md border border-dashed border-gray-400 rounded-md p-6 md:p-8 -rotate-1 bg-white">
      {done ? (
        <>
          <p className={`text-2xl text-black mb-1 ${handClass ?? ''}`}>anotado!</p>
          <p className="text-sm leading-relaxed text-[#555]">
            teu e-mail já tá comigo — as ferramentas estão todas liberadas, e você
            fica sabendo quando sair coisa nova.
          </p>
        </>
      ) : (
        <>
          <p className={`text-2xl text-black mb-1 ${handClass ?? ''}`}>me deixa teu e-mail?</p>
          <p className="text-sm leading-relaxed text-[#555] mb-5">
            é o que destrava as ferramentas — uma vez só, sem senha, sem spam.
            em troca eu te aviso quando sair ferramenta nova.
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
              {sending ? 'anotando…' : 'liberar tudo'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-black">
              e-mail inválido
            </p>
          )}
        </>
      )}
    </div>
  )
}
