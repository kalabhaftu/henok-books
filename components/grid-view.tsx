'use client';

import { useState, useMemo } from "react";
import { BookCard } from "./book-card";
import { ReservationModal } from "./reservation-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

interface Book {
    id: string;
    title: string;
    imageUrl: string;
    status: string;
    price: number;
}

export function GridView({ books }: { books: Book[] }) {
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleRent = (book: Book) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    const filteredBooks = useMemo(() => {
        if (!searchQuery) return books;
        return books.filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [books, searchQuery]);

    return (
        <>
            {/* Client Side Search Input for Instant Feedback */}
            <div className="sticky top-24 z-40 mb-10 w-full flex justify-center pointer-events-none">
                <div className="pointer-events-auto backdrop-blur-xl bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 rounded-full pl-4 pr-2 py-2 flex items-center gap-3 shadow-xl shadow-black/5 dark:shadow-black/50 w-full max-w-md transition-all focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-white/10">
                    <Search size={18} className="text-zinc-500 dark:text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search titles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-zinc-900 dark:text-white w-full placeholder:text-zinc-500 dark:placeholder:text-zinc-400 h-8 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                <AnimatePresence mode="popLayout">
                    {filteredBooks.map((book) => (
                        <motion.div
                            key={book.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            layout
                        >
                            <BookCard book={book} onRent={handleRent} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredBooks.length === 0 && (
                <div className="py-20 text-center opacity-50">
                    <p>No books match your search.</p>
                </div>
            )}

            <ReservationModal
                book={selectedBook}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
