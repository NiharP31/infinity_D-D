"use client";
import { useState, useEffect, useCallback } from 'react';

interface StoryImageProps {
  imagePrompts: string[];
  imageUrls?: string[];
  isLoading?: boolean;
}

export default function StoryImage({ imagePrompts, imageUrls = [], isLoading = false }: StoryImageProps) {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean[]>([false, false]);
  const [errorStates, setErrorStates] = useState<boolean[]>([false, false]);

  const generateSingleImage = async (prompt: string, index: number, retryCount = 0): Promise<string | null> => {
    const maxRetries = 2;
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = response.statusText;
        let errorMessage = `HTTP ${response.status}: ${errorText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Use default error message if JSON parsing fails
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.image) {
        throw new Error('No image data received');
      }

      return data.image;
    } catch (error) {
      console.error(`Error generating image ${index + 1} (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return generateSingleImage(prompt, index, retryCount + 1);
      }
      
      // Mark this image as failed
      setErrorStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });
      
      return null;
    }
  };

  const generateImages = useCallback(async () => {
    setLoadingStates([true, true]);
    setErrorStates([false, false]);
    
    try {
      const imagePromises = imagePrompts.map(async (prompt, index) => {
        return generateSingleImage(prompt, index);
      });

      const results = await Promise.all(imagePromises);
      
      // Process results
      const processedResults = results.map((result, index) => {
        if (result) {
          return result;
        } else {
          // Create a fallback placeholder for failed images
          return createFallbackImage(index);
        }
      });
      
      setGeneratedImages(processedResults);
    } catch (error) {
      console.error('Error generating images:', error);
      // Create fallback images for all slots
      const fallbackImages = imagePrompts.map((_, index) => createFallbackImage(index));
      setGeneratedImages(fallbackImages);
    } finally {
      setLoadingStates([false, false]);
    }
  }, [imagePrompts]);

  useEffect(() => {
    if (imagePrompts.length > 0 && !isLoading) {
      generateImages();
    }
  }, [imagePrompts, isLoading, generateImages]);

  const createFallbackImage = (index: number): string => {
    // Create a data URL for a simple fallback image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, 400, 400);
      
      // Border
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 380, 380);
      
      // Text
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Image ${index + 1}`, 200, 180);
      ctx.fillText('Generation Failed', 200, 210);
      ctx.fillText('Please try again', 200, 240);
      
      // Icon
      ctx.fillStyle = '#6b7280';
      ctx.font = '48px Arial';
      ctx.fillText('🖼️', 200, 320);
    }
    
    return canvas.toDataURL();
  };

  const displayImages = imageUrls.length > 0 ? imageUrls : generatedImages;

  if (isLoading || loadingStates.some(loading => loading)) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-amber-500/30">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-400 mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-amber-400 opacity-20"></div>
          </div>
          <p className="text-amber-300 text-lg font-semibold mb-2">Creating Your Storyboard</p>
          <p className="text-slate-400 text-sm">AI is painting your adventure...</p>
          {errorStates.some(error => error) && (
            <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
              <p className="text-amber-300 text-sm">Some images failed to generate</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (displayImages.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-amber-500/30">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <p className="text-slate-300 text-lg mb-4">No images available</p>
          <button 
            onClick={generateImages}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
          >
            Generate Images
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        {displayImages.map((imageUrl, index) => (
          <div key={index} className="relative group bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-amber-500/30 hover:border-amber-400/50 transition-all duration-300 flex flex-col shadow-lg">
            <div className="flex-1 relative min-h-0 p-2">
              <img
                src={imageUrl}
                alt={`Story moment ${index + 1}`}
                className="w-full h-full object-contain rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
                style={{ maxHeight: '100%', maxWidth: '100%' }}
                onError={(e) => {
                  // If image fails to load, replace with fallback
                  const target = e.target as HTMLImageElement;
                  target.src = createFallbackImage(index);
                }}
              />
            </div>
            
            {/* Image Counter */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-amber-500/30">
              <span className="font-semibold">Scene {index + 1}</span>
            </div>
            
            {/* Loading Overlay */}
            {loadingStates[index] && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
                  <p className="text-amber-300 text-xs">Generating...</p>
                </div>
              </div>
            )}
            
            {/* Error Overlay */}
            {errorStates[index] && (
              <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-red-400/30">
                <span className="font-semibold">Failed</span>
              </div>
            )}
            
            {/* Hover Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
              <div className="p-3 text-white text-xs">
                <p className="font-semibold">Story Moment {index + 1}</p>
                <p className="text-slate-300">Click to view full size</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Error Retry Section */}
      {errorStates.some(error => error) && (
        <div className="mt-4 p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300 text-sm">Some images failed to generate</span>
            </div>
            <button 
              onClick={generateImages}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 text-sm font-semibold"
            >
              Retry Generation
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 