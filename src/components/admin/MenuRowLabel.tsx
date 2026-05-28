'use client'

import { useRowLabel } from '@payloadcms/ui'

export function MenuRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string }>()
  return <>{data?.label || `Item ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`}</>
}
