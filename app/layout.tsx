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
        <div className="min-h-screen flex flex-col bg-black text-white selection:bg-white/20">
          {/* Global Header */}
          <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
              <Logo />
              <nav className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Collection</a>
                <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How it Works</a>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500">Open</span>
              </nav>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="py-12 border-t border-white/5 mt-auto">
            <div className="container mx-auto max-w-7xl px-6 text-center">
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} Henok Books. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
