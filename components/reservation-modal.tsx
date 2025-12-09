'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useState, useTransition } from "react";
import { reserveBook } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";

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
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-all"
                    />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                        >
                            {/* Header Image */}
                            <div className="h-32 bg-zinc-900 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 z-10" />
                                <img src={book.imageUrl} alt="" className="w-full h-full object-cover opacity-50 blur-xl scale-110" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="px-6 pb-8 -mt-12 relative z-20">
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 shadow-xl mb-6 flex gap-4 items-center">
                                    <img src={book.imageUrl} className="w-16 h-24 object-cover rounded-lg shadow-md" alt={book.title} />
                                    <div>
                                        <div className="text-xs font-medium text-emerald-400 mb-1 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            Available
                                        </div>
                                        <h2 className="text-lg font-bold leading-tight line-clamp-2">{book.title}</h2>
                                    </div>
                                </div>

                                {msg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn("p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3", msg.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20")}
                                    >
                                        {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                        {msg.text}
                                    </motion.div>
                                )}

                                <form action={handleSubmit} className="space-y-4">
                                    <input type="hidden" name="bookId" value={book.id} />

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold ml-1">Contact Details</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input required name="firstName" className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/10 transition-all placeholder:text-zinc-700" placeholder="First Name" />
                                                <input required name="lastName" className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/10 transition-all placeholder:text-zinc-700" placeholder="Last Name" />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <input required name="phone" type="tel" className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/10 transition-all placeholder:text-zinc-700" placeholder="Phone Number (e.g. 0911...)" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button disabled={isPending} type="submit" className="w-full group relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]">
                                            <div className="flex items-center justify-center gap-2 relative z-10">
                                                {isPending && <Loader2 className="animate-spin" size={18} />}
                                                <span>{isPending ? "Confirming..." : "Complete Reservation"}</span>
                                            </div>
                                        </button>
                                        <p className="text-center text-xs text-zinc-600 mt-4">
                                            The admin will be notified instantly.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
