'use client'

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Book {
    id: string;
    title: string;
    imageUrl: string;
    status: string;
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative flex flex-col gap-3"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-zinc-800 border border-white/5 shadow-2xl transition-all duration-300 group-hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]">
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    <div className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
                        isAvailable
                            ? "bg-green-500/20 text-green-300 border-green-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                    )}>
                        {isAvailable ? "Available" : "Taken"}
                    </div>
                </div>

                {/* Image */}
                <Image
                    src={book.imageUrl || "/placeholder-book.jpg"}
                    alt={book.title}
                    fill
                    className={cn("object-cover transition-transform duration-500 group-hover:scale-105", !isAvailable && "grayscale opacity-60")}
                />

                {/* Overlay Gradient (Always visible but stronger on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Action Button (Visible on Hover if Available) */}
                {isAvailable && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                        <button
                            onClick={() => onRent(book)}
                            className="w-full py-2.5 bg-white text-black font-semibold rounded-lg shadow-lg hover:bg-zinc-200 active:scale-95 transition-all text-sm"
                        >
                            Rent Now
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="font-medium text-zinc-200 leading-tight group-hover:text-white transition-colors line-clamp-2">{book.title}</h3>
            </div>
        </motion.div>
    );
}
