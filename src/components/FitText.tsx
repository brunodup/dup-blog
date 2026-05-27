'use client'

import { useLayoutEffect, useRef } from 'react'

type Props = {
  children: React.ReactNode
  className?: string
  style?: Omit<React.CSSProperties, 'fontSize' | 'whiteSpace' | 'lineHeight'>
}

/**
 * Renders children as a single line that fills exactly 100% of the container width.
 * Font-size is computed via ResizeObserver — works for any font at any screen size.
 */
export default function FitText({ children, className, style }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    const text = textRef.current
    if (!wrap || !text) return

    const fit = () => {
      text.style.fontSize = '100px'
      text.style.fontSize = `${(100 * wrap.offsetWidth) / text.scrollWidth}px`
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', overflow: 'hidden' }}>
      <div
        ref={textRef}
        className={className}
        style={{ whiteSpace: 'nowrap', lineHeight: 1, ...style }}
      >
        {children}
      </div>
    </div>
  )
}
