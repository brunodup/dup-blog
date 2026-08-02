// Storage local dos roteiros — compartilhado entre o organizador e o teleprompter.
// Tudo fica no navegador da pessoa; nada sobe pra servidor.

export type Roteiro = {
  id: string
  title: string
  hook: string
  dev: string
  cta: string
  updatedAt: number
}

const KEY = 'dup-tools:roteiros'

export function loadRoteiros(): Roteiro[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    const list = raw ? (JSON.parse(raw) as Roteiro[]) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveRoteiros(list: Roteiro[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // storage cheio ou bloqueado — segue sem persistir
  }
}

export function upsertRoteiro(r: Roteiro): Roteiro[] {
  const list = loadRoteiros()
  const idx = list.findIndex((x) => x.id === r.id)
  if (idx >= 0) list[idx] = r
  else list.unshift(r)
  saveRoteiros(list)
  return list
}

export function removeRoteiro(id: string): Roteiro[] {
  const list = loadRoteiros().filter((x) => x.id !== id)
  saveRoteiros(list)
  return list
}

/** Texto corrido pro teleprompter / clipboard — sem os rótulos, que ninguém fala em voz alta. */
export function roteiroToText(r: Roteiro): string {
  return [r.hook, r.dev, r.cta].map((s) => s.trim()).filter(Boolean).join('\n\n')
}

export function hasContent(r: Roteiro): boolean {
  return Boolean(r.title.trim() || r.hook.trim() || r.dev.trim() || r.cta.trim())
}

export const countWords = (text: string): number =>
  text.trim() ? text.trim().split(/\s+/).length : 0

/** Duração falada estimada, em segundos, dado um ritmo em palavras por minuto. */
export const spokenSeconds = (words: number, ppm: number): number =>
  Math.round((words / ppm) * 60)
