'use client';

import { Search } from 'lucide-react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { cn } from "@/lib/utils";

export function SearchInput() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="sticky top-24 z-40 mb-10 w-full flex justify-center pointer-events-none">
            <div className="pointer-events-auto backdrop-blur-xl bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 rounded-full pl-4 pr-2 py-2 flex items-center gap-3 shadow-xl shadow-black/5 dark:shadow-black/50 w-full max-w-md transition-all focus-within:ring-2 focus-within:ring-zinc-200 dark:focus-within:ring-white/10">
                <Search size={18} className="text-zinc-500 dark:text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search titles..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('query')?.toString()}
                    className="bg-transparent border-none focus:outline-none text-zinc-900 dark:text-white w-full placeholder:text-zinc-500 dark:placeholder:text-zinc-400 h-8 text-sm"
                />
            </div>
        </div>
    );
}
