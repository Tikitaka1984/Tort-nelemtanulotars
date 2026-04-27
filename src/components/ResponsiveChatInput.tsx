import { useState, useRef, useEffect } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface ResponsiveChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ResponsiveChatInput({ onSend, isLoading, placeholder }: ResponsiveChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2 bg-white border border-parchment-300 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-history-red/20 focus-within:border-history-red transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Írj ide..."}
          rows={1}
          className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm text-history-blue placeholder:text-history-blue/40 max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
            input.trim() && !isLoading
              ? "bg-history-red text-white shadow-md active:scale-95"
              : "bg-parchment-100 text-history-blue/20 cursor-not-allowed"
          )}
        >
          <Send size={18} className={isLoading ? "animate-pulse" : ""} />
        </button>
      </div>
      
      <div className="flex items-center justify-center gap-1.5 px-2">
        <ShieldCheck size={12} className="text-leaf-600" />
        <span className="text-[10px] text-history-blue/50 font-medium italic">
          Az alkalmazás tanulást segít, személyes adatot ne adj meg!
        </span>
      </div>
    </div>
  );
}
