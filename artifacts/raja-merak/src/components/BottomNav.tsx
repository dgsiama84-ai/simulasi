import { Gamepad2, PlaySquare, Trophy, ShieldHalf, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Target, label: "TOGEL", active: false },
  { icon: Gamepad2, label: "SLOT", active: true },
  { icon: PlaySquare, label: "LIVE", active: false },
  { icon: Trophy, label: "SPORT", active: false },
  { icon: ShieldHalf, label: "ARCADE", active: false },
];

export function BottomNav() {
  return (
    <div className="sticky bottom-0 w-full bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 z-50">
      <div className="flex justify-between items-center px-2 pb-safe pt-2">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300",
                item.active ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", item.active && "drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]")} strokeWidth={item.active ? 2.5 : 2} />
              <span className={cn("text-[10px] font-bold tracking-wider", item.active && "text-primary")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
