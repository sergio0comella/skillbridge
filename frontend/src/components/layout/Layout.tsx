import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  noFooter?: boolean
  noPadding?: boolean
}

export function Layout({ children, noFooter, noPadding }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={noPadding ? 'flex-1' : 'flex-1'}>
        {children}
      </main>
      {!noFooter && <Footer />}
    </div>
  )
}
