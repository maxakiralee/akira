import { CALL_STATUS, useVapi } from "@/hooks/useVapi";
import { Loader2, Mic, Square } from "lucide-react";

const AssistantButton = ({
  toggleCall,
  callStatus,
  audioLevel = 0,
}: Partial<ReturnType<typeof useVapi>>) => {
  const getButtonClasses = () => {
    const baseClasses = "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border-0";
    
    switch (callStatus) {
      case CALL_STATUS.ACTIVE:
        return `${baseClasses} bg-gradient-to-br from-red-400 to-red-600 text-white shadow-[8px_8px_16px_rgba(239,68,68,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_20px_rgba(239,68,68,0.4),-12px_-12px_20px_rgba(255,255,255,0.15)] active:shadow-[inset_8px_8px_16px_rgba(239,68,68,0.3)]`;
      case CALL_STATUS.LOADING:
        return `${baseClasses} bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[8px_8px_16px_rgba(251,146,60,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_20px_rgba(251,146,60,0.4),-12px_-12px_20px_rgba(255,255,255,0.15)]`;
      default:
        return `${baseClasses} bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[8px_8px_16px_rgba(16,185,129,0.3),-8px_-8px_16px_rgba(255,255,255,0.1)] hover:shadow-[12px_12px_20px_rgba(16,185,129,0.4),-12px_-12px_20px_rgba(255,255,255,0.15)] active:shadow-[inset_8px_8px_16px_rgba(16,185,129,0.3)]`;
    }
  };

  // Create pulsing effect for active state with audio level
  const getPulseStyle = () => {
    if (callStatus === CALL_STATUS.ACTIVE && audioLevel > 0) {
      return {
        boxShadow: `0 0 ${20 + audioLevel * 30}px ${5 + audioLevel * 15}px rgba(239, 68, 68, ${0.3 + audioLevel * 0.3})`,
      };
    }
    return {};
  };

  return (
    <button
      className={getButtonClasses()}
      style={getPulseStyle()}
      onClick={toggleCall}
    >
      {callStatus === CALL_STATUS.ACTIVE ? (
        <Square size={20} />
      ) : callStatus === CALL_STATUS.LOADING ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <Mic size={20} />
      )}
    </button>
  );
};

export { AssistantButton };
