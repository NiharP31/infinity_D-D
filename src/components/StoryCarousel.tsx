'use client';

import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Scene, UserCharacter } from '@/types/story';
import ChatMessage from './ChatMessage';

interface StoryCarouselProps {
  storyHistory: Scene[];
  userCharacter: UserCharacter;
}

export default function StoryCarousel({ storyHistory, userCharacter }: StoryCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
  });

  // Automatically scroll to the latest scene when the story history updates
  useEffect(() => {
    if (emblaApi) {
      const newIndex = storyHistory.length - 1;
      emblaApi.scrollTo(newIndex, false);
      setSelectedIndex(newIndex);
    }
  }, [emblaApi, storyHistory]);

  // Update selected index when scrolling
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollTo = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Dots */}
      {storyHistory.length > 1 && (
        <div className="flex justify-center space-x-2 p-4 border-b border-amber-500/30">
          {storyHistory.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 scale-125'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              aria-label={`Go to scene ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scene Counter */}
      <div className="px-4 py-2 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-amber-500/30">
        <div className="flex items-center justify-between text-sm">
          <span className="text-amber-300 font-semibold">
            Scene {selectedIndex + 1} of {storyHistory.length}
          </span>
          <span className="text-slate-400">
            {storyHistory[selectedIndex]?.atmosphere && (
              <span className="capitalize">🌙 {storyHistory[selectedIndex].atmosphere}</span>
            )}
          </span>
        </div>
      </div>

      {/* Carousel Content */}
      <div className="flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {storyHistory.map((scene, index) => (
            <div key={scene.id} className="flex-[0_0_100%] min-w-0">
              <div className="overflow-y-auto h-full p-4">
                <div className={`transition-all duration-500 ${
                  index === selectedIndex ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
                }`}>
                  <ChatMessage
                    scene={scene}
                    isLatest={index === storyHistory.length - 1}
                    userCharacter={userCharacter}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 