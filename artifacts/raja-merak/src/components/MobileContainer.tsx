import { ReactNode } from "react";
import { FallingCoins } from "./FallingCoins";
import { cn } from "@/lib/utils";

export function MobileContainer({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <div className="min-h-screen w-full bg-black flex justify-center text-foreground font-sans">
      <FallingCoins />
      
      <div className={cn(
        "relative w-full max-w-[480px] min-h-[100dvh] bg-background shadow-2xl shadow-black/80 flex flex-col z-10",
        "border-x border-border/20",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
