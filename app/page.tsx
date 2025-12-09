import prisma from "@/lib/prisma";
import { GridView } from "@/components/grid-view";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let books: any[] = [];

  try {
    books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch books", error);
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-20">
          <div className="font-bold text-2xl tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
              H
            </div>
            <span>Henok Books</span>
          </div>
          <div className="flex gap-4">
            {/* Socials or other links could go here */}
          </div>
        </header>

        {/* Hero Section */}
        <div className="mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Now Open for Reservations
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/80 to-white/40">
            Curated Knowledge<br />For the Modern Mind.
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Access an exclusive collection of premium titles. Reserve instantly, read freely, and return when you're done.
          </p>
        </div>

        {/* Filter / Search Bar (Visual Only for now) */}
        <div className="sticky top-4 z-40 mb-10">
          <div className="max-w-2xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-3 shadow-2xl shadow-black/50">
            <div className="pl-4 text-zinc-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search collection..."
              className="bg-transparent border-none focus:outline-none text-white w-full placeholder:text-zinc-600 h-10"
            />
          </div>
        </div>

        {/* content */}
        {books.length > 0 ? (
          <GridView books={books} />
        ) : (
          <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <div className="w-2 h-8 bg-zinc-800 rounded-full" />
              <div className="w-2 h-6 bg-zinc-800 rounded-full ml-1" />
              <div className="w-2 h-4 bg-zinc-800 rounded-full ml-1" />
            </div>
            <p className="text-zinc-400 text-lg font-medium">Collection is currently empty.</p>
            <p className="text-zinc-600 mt-2">Check back soon for new arrivals.</p>
          </div>
        )}

        <footer className="mt-32 pt-10 border-t border-white/5 text-center text-zinc-600 text-sm pb-10">
          &copy; {new Date().getFullYear()} Henok Books. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
