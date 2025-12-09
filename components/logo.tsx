import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center gap-3 font-bold text-xl tracking-tighter", className)}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                H
            </div>
            <span>Henok Books</span>
        </div>
    );
};
