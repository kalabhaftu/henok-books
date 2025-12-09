'use client'

import { useState } from "react";
import { BookCard } from "./book-card";
import { ReservationModal } from "./reservation-modal";
import { motion } from "framer-motion";

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

    const handleRent = (book: Book) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-10">
                {books.map((book, i) => (
                    <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <BookCard book={book} onRent={handleRent} />
                    </motion.div>
                ))}
            </div>

            <ReservationModal
                book={selectedBook}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
