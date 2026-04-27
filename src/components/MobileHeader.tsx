import { MODES, ModeId } from "../constants";
import { GraduationCap } from "lucide-react";

interface MobileHeaderProps {
  activeModeId: ModeId;
}

export function MobileHeader({ activeModeId }: MobileHeaderProps) {
  const activeMode = MODES[activeModeId];
  const Icon = activeMode.icon;

  return (
    <header className="sticky top-0 left-0 right-0 h-14 bg-parchment-50/80 backdrop-blur-md border-b border-parchment-200 px-4 flex items-center justify-between md:hidden z-40">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-history-red text-white flex items-center justify-center shadow-sm">
          <GraduationCap size={20} />
        </div>
        <div>
          <h1 className="text-sm font-black text-history-blue uppercase tracking-tight leading-none">
            Tanulótárs
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <Icon size={10} className="text-history-red" />
            <span className="text-[10px] font-bold text-history-red uppercase tracking-wider">
              {activeMode.title}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-[10px] bg-parchment-200/50 px-2 py-1 rounded-full font-bold text-history-blue/70 border border-parchment-300">
        NAT 2020
      </div>
    </header>
  );
}
