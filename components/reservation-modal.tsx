'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { reserveBook } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";

interface ReservationModalProps {
    book: { id: string; title: string; imageUrl: string } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ReservationModal({ book, isOpen, onClose }: ReservationModalProps) {
    const [isPending, startTransition] = useTransition();
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    if (!book) return null;

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const res = await reserveBook(null, formData);
            if (res.success) {
                setMsg({ type: 'success', text: res.message });
                setTimeout(() => {
                    onClose();
                    setMsg(null);
                }, 2000);
            } else {
                setMsg({ type: 'error', text: res.message });
            }
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl z-50"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold">Reserve Book</h2>
                                <p className="text-sm text-zinc-400 mt-1">You are reserving <span className="text-white font-medium">"{book.title}"</span></p>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {msg && (
                            <div className={cn("p-3 rounded-lg mb-4 text-sm font-medium", msg.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                {msg.text}
                            </div>
                        )}

                        <form action={handleSubmit} className="space-y-4">
                            <input type="hidden" name="bookId" value={book.id} />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">First Name</label>
                                    <input required name="firstName" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-zinc-600" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Last Name</label>
                                    <input required name="lastName" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-zinc-600" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Phone Number</label>
                                <input required name="phone" type="tel" className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-zinc-600" placeholder="+251 911 234 567" />
                            </div>

                            <div className="pt-2">
                                <button disabled={isPending} type="submit" className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isPending && <Loader2 className="animate-spin" size={18} />}
                                    {isPending ? "Confirming..." : "Confirm Reservation"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
