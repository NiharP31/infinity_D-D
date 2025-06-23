import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspect_ratio = "1:1", seed = null, safety_tolerance = 2, output_format = "jpeg" } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.FLUX_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Generating image with prompt:', prompt);

    // Add negative prompt to prevent text and writing
    const negativePrompt = "text, writing, letters, words, signs, scrolls, books, inscriptions, calligraphy, handwriting, printed text, labels, titles, subtitles, captions, any written content, dialogue, speech bubbles, conversation bubbles, talking, speaking, mouths open, dialogue text, speech text, any form of communication text";

    // Simple enhanced prompt for D&D style with character consistency
    const enhancedPrompt = `${prompt}, 3D animated D&D fantasy art, cartoon style, vibrant colors, detailed characters, no text`;

    // Call Black Forest Labs FLUX.1 Kontext API
    const response = await fetch('https://api.bfl.ai/v1/flux-kontext-pro', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'x-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        aspect_ratio,
        seed,
        safety_tolerance,
        output_format
      })
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `API Error: ${errorData.detail || errorData.error || response.statusText}`;
        console.error('BFL API error:', errorData);
      } catch {
        console.error('BFL API error (non-JSON):', response.statusText);
      }
      return NextResponse.json({ 
        success: false,
        error: errorMessage
      }, { status: 500 });
    }

    let requestData;
    try {
      requestData = await response.json();
    } catch {
      console.error('Failed to parse BFL response');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON response from BFL API' 
      }, { status: 500 });
    }

    if (!requestData.id || !requestData.polling_url) {
      console.error('Invalid BFL response structure:', requestData);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid response structure from BFL API' 
      }, { status: 500 });
    }

    // Poll for completion
    const result = await pollForCompletion(requestData.polling_url, requestData.id, apiKey);
    
    if (result.success && result.image) {
      return NextResponse.json({ 
        success: true, 
        image: result.image
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to generate image' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in generate-image API:', error);
    
    // If it's a network error or API is completely down, return a fallback
    if (error instanceof Error && (
      error.message.includes('fetch') || 
      error.message.includes('network') || 
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('timeout') ||
      error.message.includes('Timeout')
    )) {
      console.log('API unavailable, returning fallback image');
      return NextResponse.json({ 
        success: true, 
        image: createFallbackImageUrl(),
        fallback: true
      });
    }
    
    // For other errors, return a more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Image generation failed:', errorMessage);
    
    return NextResponse.json({ 
      success: false, 
      error: `Image generation failed: ${errorMessage}` 
    }, { status: 500 });
  }
}

// Poll for prediction completion using BFL API format
async function pollForCompletion(pollingUrl: string, requestId: string, apiKey: string): Promise<{ success: boolean; image?: string; error?: string }> {
  const maxAttempts = 40; // Reduced to 20 seconds max (polling every 0.5 seconds)
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(pollingUrl, {
        headers: {
          'accept': 'application/json',
          'x-key': apiKey,
        },
        // Add timeout to individual requests
        signal: AbortSignal.timeout(8000) // 8 second timeout per request
      });

      if (!response.ok) {
        let errorText = response.statusText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.detail || response.statusText;
        } catch {
          // Use status text if JSON parsing fails
        }
        console.error('Polling error response:', errorText);
        throw new Error(`Polling failed: ${response.status} - ${errorText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch {
        console.error('Failed to parse polling response');
        throw new Error('Invalid JSON response from polling API');
      }

      if (result.status === 'Ready') {
        console.log('Image generation completed successfully');
        if (!result.result || !result.result.sample) {
          return {
            success: false,
            error: 'No image data in successful response'
          };
        }
        return {
          success: true,
          image: result.result.sample // BFL returns signed URL in result.sample
        };
      } else if (result.status === 'Error' || result.status === 'Failed') {
        console.error('Generation failed:', result);
        return {
          success: false,
          error: result.error || result.detail || 'Generation failed'
        };
      }

      // Wait 0.5 seconds before next poll (as per BFL docs)
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;

    } catch (error) {
      console.error('Polling error:', error);
      attempts++;
      
      // If it's a timeout error, wait longer before retrying
      if (error instanceof Error && error.name === 'TimeoutError') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  return {
    success: false,
    error: 'Timeout: Image generation took too long (20 seconds)'
  };
}

// Create a fallback image URL when API is unavailable
function createFallbackImageUrl(): string {
  // Return a simple SVG data URL for a fallback image
  return `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#1f2937"/>
      <rect x="20" y="20" width="472" height="472" fill="none" stroke="#374151" stroke-width="4"/>
      <text x="256" y="200" font-family="Arial" font-size="24" fill="#9ca3af" text-anchor="middle">Image Generation</text>
      <text x="256" y="240" font-family="Arial" font-size="24" fill="#9ca3af" text-anchor="middle">Temporarily Unavailable</text>
      <text x="256" y="280" font-family="Arial" font-size="24" fill="#9ca3af" text-anchor="middle">Please try again later</text>
      <text x="256" y="380" font-family="Arial" font-size="64" fill="#6b7280" text-anchor="middle">🖼️</text>
    </svg>
  `).toString('base64')}`;
} 