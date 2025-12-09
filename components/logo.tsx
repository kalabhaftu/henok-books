import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn("flex items-center gap-2 font-bold text-xl", className)}>
            <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                <rect width="32" height="32" rx="6" className="fill-primary" />
                <path
                    d="M9 8V24M23 8C25.2091 8 27 9.79086 27 12C27 13.6569 26.3284 15.1569 25.2189 16C26.3284 16.8431 27 18.3431 27 20C27 22.2091 25.2091 24 23 24H9M9 16H22"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span>Henok Books</span>
        </div>
    );
};
