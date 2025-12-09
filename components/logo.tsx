import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center gap-3 font-bold text-xl tracking-tighter text-zinc-900 dark:text-white transition-colors", className)}>
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-lg transition-colors">
                H
            </div>
            <span>Henok Books</span>
        </div>
    );
};
