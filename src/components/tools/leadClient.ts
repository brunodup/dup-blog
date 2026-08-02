// Lado client da captação: um e-mail por navegador, guardado localmente.
// Quem deixou o e-mail em qualquer lugar (landing ou gate) destrava tudo.

const EMAIL_KEY = 'dup-tools:email'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function hasStoredEmail(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return Boolean(window.localStorage.getItem(EMAIL_KEY))
  } catch {
    return false
  }
}

export function storeEmail(email: string): void {
  try {
    window.localStorage.setItem(EMAIL_KEY, email)
  } catch {
    // storage bloqueado — o gate vai perguntar de novo na próxima, paciência
  }
}

/** Envia pro servidor e guarda localmente. Best-effort: rede falhando não trava a ferramenta. */
export async function submitLead(email: string, source: string): Promise<void> {
  storeEmail(email)
  try {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source }),
    })
  } catch {
    // sem rede — o e-mail fica no storage e a pessoa segue usando
  }
}
