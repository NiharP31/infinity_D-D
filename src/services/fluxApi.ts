// FLUX.1 Kontext API Service
// Using our Next.js API route for secure server-side calls to Black Forest Labs

export interface FluxImageRequest {
  prompt: string;
  aspect_ratio?: string; // e.g., "1:1", "16:9", "3:7"
  seed?: number | null; // For reproducibility
  safety_tolerance?: number; // 0-6, moderation level
  output_format?: string; // "jpeg" or "png"
}

export interface FluxImageResponse {
  image: string; // Image URL from FLUX.1
  success: boolean;
  error?: string;
}

// Client-side API call to our Next.js route
export async function generateImage(request: FluxImageRequest): Promise<FluxImageResponse> {
  try {
    console.log('Generating image with prompt:', request.prompt);
    
    // Call our Next.js API route
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        aspect_ratio: request.aspect_ratio || "1:1",
        seed: request.seed || null,
        safety_tolerance: request.safety_tolerance || 2,
        output_format: request.output_format || "jpeg",
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.image) {
      return {
        image: result.image,
        success: true
      };
    } else {
      throw new Error(result.error || 'Failed to generate image');
    }

  } catch (error) {
    console.error('Error generating image:', error);
    return {
      image: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper function to convert image URL to base64 (if needed)
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image URL to base64:', error);
    throw error;
  }
}

// Helper function to convert base64 to blob URL for display
export function base64ToBlobUrl(base64: string): string {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  return URL.createObjectURL(blob);
} 