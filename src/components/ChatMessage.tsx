"use client";
import { Scene, UserCharacter } from "@/types/story";

interface ChatMessageProps {
  scene: Scene;
  isLatest: boolean;
  userCharacter: UserCharacter;
}

export default function ChatMessage({ scene, isLatest, userCharacter }: ChatMessageProps) {
  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'excited': return 'text-amber-400';
      case 'tense': return 'text-red-400';
      case 'calm': return 'text-emerald-400';
      case 'curious': return 'text-amber-400';
      case 'suspicious': return 'text-orange-400';
      case 'pleased': return 'text-emerald-400';
      case 'fascinated': return 'text-indigo-400';
      default: return 'text-slate-300';
    }
  };

  const getRelationshipColor = (relationship: number) => {
    if (relationship >= 50) return 'text-emerald-400';
    if (relationship >= 20) return 'text-emerald-400';
    if (relationship >= -20) return 'text-slate-400';
    if (relationship >= -50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30 shadow-lg transition-all duration-300 ${
      isLatest ? 'ring-2 ring-amber-500/50' : ''
    }`}>
      {/* Scene Description */}
      <div className="mb-6">
        <div className="text-lg leading-relaxed text-white font-medium">
          {scene.description}
        </div>
      </div>
      
      {/* Character Information */}
      <div className="space-y-4">
        <h4 className="font-bold text-amber-300 text-lg flex items-center">
          <span className="mr-2">👥</span>
          Characters Present
        </h4>
        
        <div className="space-y-3">
          {/* User Character */}
          <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 rounded-lg p-4 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-white text-lg flex items-center">
                <span className="mr-2">👤</span>
                {userCharacter.name} (You)
              </div>
              <div className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs font-semibold">
                Level {userCharacter.level}
              </div>
            </div>
            <div className="text-sm text-amber-200 mb-1">
              {userCharacter.race} {userCharacter.class}
            </div>
            <div className="text-xs text-amber-300 italic">
              &ldquo;{userCharacter.personality}&rdquo;
            </div>
          </div>
          
          {/* Other Characters */}
          {scene.characters.map((character) => (
            <div key={character.name} className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-lg p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-200 text-lg flex items-center">
                  <span className="mr-2">
                    {character.race === 'dwarf' ? '🧙‍♂️' : 
                     character.race === 'elf' ? '🧝‍♀️' : 
                     character.race === 'orc' ? '👹' : '👤'}
                  </span>
                  {character.name}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getEmotionColor(character.currentEmotion)}`}>
                  {character.currentEmotion}
                </div>
              </div>
              <div className="text-sm text-slate-300 mb-1">
                {character.race} {character.class}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 italic">
                  &ldquo;{character.personality}&rdquo;
                </div>
                <div className={`text-xs font-semibold ${getRelationshipColor(character.relationshipWithPlayer)}`}>
                  {character.relationshipWithPlayer > 0 ? '+' : ''}{character.relationshipWithPlayer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Scene Details */}
      <div className="mt-6 pt-4 border-t border-amber-500/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-slate-400">
              <span className="mr-1">📍</span>
              <span>{scene.location}</span>
            </div>
            <div className="flex items-center text-slate-400">
              <span className="mr-1">🌙</span>
              <span className="capitalize">{scene.atmosphere}</span>
            </div>
          </div>
          {isLatest && (
            <div className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-xs font-semibold animate-pulse">
              Current Scene
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 