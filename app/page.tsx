import prisma from "@/lib/prisma";
import { GridView } from "@/components/grid-view";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let books: any[] = [];

  try {
    books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Failed to fetch books (likely missing credentials)", error);
    // Fallback empty or mock if needed during setup
    // books = [];
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-10">
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
          Curated Collection
        </h1>
        <p className="text-zinc-400 max-w-2xl text-lg">
          Reserve premium books from our exclusive library. Read, return, repeat.
        </p>
      </div>

      {books.length > 0 ? (
        <GridView books={books} />
      ) : (
        <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/30">
          <p className="text-zinc-500">No books available in the collection yet.</p>
          <p className="text-xs text-zinc-600 mt-2">Admin: Use Telegram to add books.</p>
        </div>
      )}
    </div>
  );
}
