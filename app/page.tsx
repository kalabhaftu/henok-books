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
    <>
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <div className="mb-24 mt-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-6 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Addis Ababa's Premium Library
          </div>

          <h1 className="text-5xl md:text-8xl font-bold mb-8 tracking-tighter text-white">
            Read. Return. <span className="text-zinc-600">Repeat.</span>
          </h1>

          <p className="text-zinc-400 max-w-xl mx-auto text-lg md:text-xl leading-relaxed">
            The modern way to access physical books. Reserve instantly via our bot, pick up your copy, and pay per read.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="sticky top-24 z-40 mb-10 w-full flex justify-center pointer-events-none">
          <div className="pointer-events-auto backdrop-blur-xl bg-black/60 border border-white/10 rounded-full pl-4 pr-2 py-2 flex items-center gap-3 shadow-2xl shadow-black/50 w-full max-w-md transition-all focus-within:ring-2 focus-within:ring-white/10">
            <Search size={18} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Search titles..."
              className="bg-transparent border-none focus:outline-none text-white w-full placeholder:text-zinc-600 h-8 text-sm"
            />
          </div>
        </div>

        {/* Content */}
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
      </div>
    </>
  );
}
