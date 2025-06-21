"use client";
import { StoryChoice } from '@/types/story';

interface ChoiceButtonsProps {
  choices: StoryChoice[];
  onChoice: (choiceAction: string) => void;
  disabled?: boolean;
}

// Function to get color scheme based on action type
function getActionTypeColors(type?: string) {
  switch (type?.toLowerCase()) {
    case 'combat':
      return 'bg-red-700/80 hover:bg-red-600/90 border-red-600/50 hover:border-red-500/60 text-red-100';
    case 'diplomacy':
      return 'bg-emerald-700/80 hover:bg-emerald-600/90 border-emerald-600/50 hover:border-emerald-500/60 text-emerald-100';
    case 'exploration':
      return 'bg-amber-700/80 hover:bg-amber-600/90 border-amber-600/50 hover:border-amber-500/60 text-amber-100';
    case 'magic':
      return 'bg-indigo-700/80 hover:bg-indigo-600/90 border-indigo-600/50 hover:border-indigo-500/60 text-indigo-100';
    case 'stealth':
      return 'bg-slate-700/80 hover:bg-slate-600/90 border-slate-600/50 hover:border-slate-500/60 text-slate-100';
    default:
      return 'bg-slate-700/80 hover:bg-slate-600/90 border-slate-600/50 hover:border-slate-500/60 text-slate-100';
  }
}

// Function to get action type icon
function getActionTypeIcon(type?: string) {
  switch (type?.toLowerCase()) {
    case 'combat':
      return '⚔️';
    case 'diplomacy':
      return '🤝';
    case 'exploration':
      return '🔍';
    case 'magic':
      return '✨';
    case 'stealth':
      return '👁️';
    default:
      return '⚡';
  }
}

export default function ChoiceButtons({ choices, onChoice, disabled = false }: ChoiceButtonsProps) {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5 mb-2">
      <h3 className="text-sm font-semibold text-white mb-1.5">Choose your action:</h3>
      <div className="grid grid-cols-1 gap-1.5">
        {choices.map((choice) => {
          const colors = getActionTypeColors(choice.type);
          const icon = getActionTypeIcon(choice.type);
          
          return (
            <button
              key={choice.id}
              onClick={() => onChoice(choice.action)}
              disabled={disabled}
              className={`w-full p-2 text-left ${colors} disabled:bg-gray-800 disabled:cursor-not-allowed rounded-md border transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">{choice.text}</div>
                <div className="text-base">{icon}</div>
              </div>
              <div className="text-xs opacity-80 mt-0.5">{choice.description}</div>
              {choice.type && (
                <div className="text-[10px] opacity-60 mt-1 capitalize">
                  {choice.type} action
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 