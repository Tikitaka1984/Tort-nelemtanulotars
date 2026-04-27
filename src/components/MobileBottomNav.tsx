import { MODES, ModeId } from "../constants";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface MobileBottomNavProps {
  activeModeId: ModeId;
  onModeChange: (id: ModeId) => void;
}

export function MobileBottomNav({ activeModeId, onModeChange }: MobileBottomNavProps) {
  const modesList = Object.values(MODES);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-parchment-50 border-t border-parchment-200 px-2 pt-2 pb-safe-area flex items-center justify-between md:hidden z-50">
      {modesList.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeModeId === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "flex flex-col items-center gap-1 flex-1 py-1 transition-all relative",
              isActive ? "text-history-red" : "text-history-blue/60"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-xl transition-colors",
              isActive ? "bg-history-red/10" : "bg-transparent"
            )}>
              <Icon size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter truncate max-w-full px-1">
              {mode.title.split(' ')[0]}
            </span>
            
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-history-red rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
