import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Logo } from '@/components/logo'
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

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
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
            {/* Global Header */}
            <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-white/5 bg-white/70 dark:bg-black/50 backdrop-blur-xl transition-colors">
              <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                <Logo />
                <nav className="flex items-center gap-4 md:gap-6">
                  <a href="#" className="hidden md:block text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">Collection</a>
                  <div className="h-4 w-px bg-zinc-300 dark:bg-white/10 hidden md:block" />
                  <ModeToggle />
                </nav>
              </div>
            </header>

            <main className="flex-1">
              {children}
            </main>

            <footer className="py-12 border-t border-zinc-200 dark:border-white/5 mt-auto bg-zinc-100 dark:bg-zinc-900/50">
              <div className="container mx-auto max-w-7xl px-6 text-center">
                {/* Copyright removed */}
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
