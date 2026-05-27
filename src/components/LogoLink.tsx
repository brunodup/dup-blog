import Link from 'next/link'
import Logo from '@/components/Logo'

export default function LogoLink({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label="Ir para home" className="block p-[5px] md:pt-[8px]">
      <Logo className={className} />
    </Link>
  )
}
