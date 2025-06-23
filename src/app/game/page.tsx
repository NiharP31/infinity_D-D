"use client";
import { useState, useEffect } from 'react';
import ChoiceButtons from '@/components/ChoiceButtons';
import StoryImage from '@/components/StoryImage';
import { Scene, UserCharacter } from '@/types/story';
import StoryCarousel from '@/components/StoryCarousel';

// Import the functions from gameService
import { getInitialScene, processChoice } from '@/services/gameService';

export default function GamePage() {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [userCharacter, setUserCharacter] = useState<UserCharacter | null>(null);
  const [storyHistory, setStoryHistory] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadInitialScene = async () => {
      setIsLoading(true);
      try {
        const initialScene = await getInitialScene();
        setCurrentScene(initialScene);
        setUserCharacter(initialScene.userCharacter!);
        setStoryHistory([initialScene]);
      } catch (error) {
        console.error("Failed to load initial scene:", error);
        // Handle error state in UI, maybe show a retry button
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialScene();
  }, []);

  const handleChoice = async (choiceAction: string) => {
    if (!currentScene || !userCharacter) return;
    
    setIsLoading(true);
    try {
      const result = await processChoice(choiceAction, currentScene, currentScene.characters, userCharacter);
      
      setCurrentScene(result.scene);
      setStoryHistory(prev => [...prev, result.scene]);
    } catch (error) {
      console.error('Error processing choice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentScene || !userCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Your Adventure</h2>
          <p className="text-slate-300">Preparing the mystical realm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900 to-slate-900 text-white">
      {/* Enhanced Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/30 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚔️</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Infinity
                </h1>
                <p className="text-slate-300 text-sm">Your Adventure Awaits</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-600">
                <span className="text-amber-400 font-semibold">📍</span>
                <span className="ml-2">{currentScene.location}</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-600">
                <span className="text-orange-400 font-semibold">🌙</span>
                <span className="ml-2 capitalize">{currentScene.atmosphere}</span>
              </div>
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg px-4 py-2">
                <span className="text-yellow-300 font-semibold">👤</span>
                <span className="ml-2 font-semibold">{userCharacter.name} the {userCharacter.class}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-120px)] max-w-7xl mx-auto">
        {/* Left Panel - Enhanced Chat Interface */}
        <div className="w-1/2 bg-black/10 backdrop-blur-sm border-r border-amber-500/30 flex flex-col rounded-r-2xl m-4">
          {/* Story Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {storyHistory.length > 0 && userCharacter && (
              <StoryCarousel storyHistory={storyHistory} userCharacter={userCharacter} />
            )}
            {isLoading && !currentScene && (
              <div className="flex items-center justify-center h-full text-center">
                <div className="bg-slate-800/50 rounded-xl p-8 border border-amber-500/30">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-400 mx-auto mb-4"></div>
                  <p className="text-slate-300 text-lg">The storyteller is weaving your tale...</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Input Area */}
          <div className="p-6 border-t border-amber-500/30 bg-black/5">
            {currentScene.choices && currentScene.choices.length > 0 && (
              <ChoiceButtons
                choices={currentScene.choices}
                onChoice={handleChoice}
                disabled={isLoading}
              />
            )}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-pulse text-amber-400">
                  <span className="text-sm">Processing your choice...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Enhanced Storyboard Display */}
        <div className="w-1/2 p-4">
          <div className="h-full bg-black/10 backdrop-blur-sm rounded-2xl border border-amber-500/30 overflow-hidden">
            <div className="p-4 border-b border-amber-500/30 bg-gradient-to-r from-amber-600/20 to-orange-600/20">
              <h3 className="text-lg font-semibold text-amber-300 flex items-center">
                <span className="mr-2">🎨</span>
                Visual Story
              </h3>
            </div>
            <div className="h-full p-4">
              <StoryImage
                imagePrompts={currentScene.imagePrompts}
                imageUrls={currentScene.imageUrls}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-amber-500/30 p-4 text-center">
        <p className="text-slate-400 text-sm">
          Powered by AI • Every choice shapes your destiny
        </p>
      </footer>
    </div>
  );
} 