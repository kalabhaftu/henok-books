import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Logo } from '@/components/logo'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Henok Books',
  description: 'Premium Book Rental Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={outfit.className}>
        <div className="min-h-screen flex flex-col">
          <header className="p-6 flex items-center justify-between border-b border-white/5">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
              <Logo />
              <nav>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold text-[10px]">Premium Library</span>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="p-6 text-center text-xs text-muted-foreground border-t border-white/5">
            © {new Date().getFullYear()} Henok Books. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  )
}
