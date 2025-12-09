'use client'

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Book {
    id: string;
    title: string;
    imageUrl: string;
    status: string;
    price: number;
}

interface BookCardProps {
    book: Book;
    onRent: (book: Book) => void;
}

export function BookCard({ book, onRent }: BookCardProps) {
    const isAvailable = book.status === "AVAILABLE";

    return (
        <motion.div
            layoutId={`card-${book.id}`}
            className="group relative flex flex-col gap-3"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-2xl">
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <div className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm",
                        isAvailable
                            ? "bg-emerald-100/80 dark:bg-green-500/20 text-emerald-700 dark:text-green-300 border-emerald-200/50 dark:border-green-500/30"
                            : "bg-rose-100/80 dark:bg-red-500/20 text-rose-700 dark:text-red-300 border-rose-200/50 dark:border-red-500/30"
                    )}>
                        {isAvailable ? "Available" : "Taken"}
                    </div>
                </div>

                {/* Standard Image Tag for Speed/Simplicity */}
                <img
                    src={book.imageUrl || "/placeholder-book.jpg"}
                    alt={book.title}
                    className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", !isAvailable && "grayscale opacity-80 dark:opacity-60")}
                    loading="lazy"
                />

                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="space-y-3 pt-2">
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-tight line-clamp-2 min-h-[2.5rem]">{book.title}</h3>
                    {book.price > 0 && (
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            {book.price.toLocaleString()} ETB
                        </p>
                    )}
                </div>

                {/* Rent Button - Always visible, full width, easy to tap */}
                {isAvailable ? (
                    <button
                        onClick={() => onRent(book)}
                        className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all text-sm"
                    >
                        Rent Now
                    </button>
                ) : (
                    <button disabled className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 font-medium rounded-lg text-sm cursor-not-allowed">
                        Unavailable
                    </button>
                )}
            </div>
        </motion.div>
    );
}
