import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { primaryText } = await request.json();

    if (!primaryText) {
      return NextResponse.json({ error: 'Primary text is required' }, { status: 400 });
    }

    const systemPrompt = `
      You are a D&D game artist. Convert a 2-sentence narrative into 2 image prompts.

      RULES:
      1. Use the narrative sentences directly as the basis for image prompts
      2. Add "3D animated D&D fantasy art:" prefix to each sentence
      3. Keep the visual content exactly as described in the narrative
      4. NO dialogue or text in the images
      5. Maintain character visual consistency:
         - Thorin: dwarf, red beard, chain mail, battle axe
         - Elara: elf, silver hair, blue robes, staff
         - Grimtooth: orc, green skin, tattoos, great axe
         - Human Fighter: chain mail, determined
      6. Specify 3D animated style with detailed characters

      NARRATIVE: "${primaryText}"

      Split the narrative into 2 sentences and create image prompts that match exactly.
      Return JSON: {"image1": "3D animated D&D fantasy art: [first sentence]", "image2": "3D animated D&D fantasy art: [second sentence]"}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate image prompts for this narrative: "${primaryText}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ 
        error: `OpenAI API Error: ${errorData.error?.message || response.statusText}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('No content received from OpenAI');
      return NextResponse.json({ 
        error: 'No content received from OpenAI' 
      }, { status: 500 });
    }

    // Parse the JSON response
    let imagePrompts;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        imagePrompts = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.log('Raw response:', content);
      
      // Fallback: split narrative into sentences and use them directly
      const sentences = primaryText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).slice(0, 2);
      
      if (sentences.length >= 2) {
        imagePrompts = {
          image1: `3D animated D&D fantasy art: ${sentences[0].trim()}`,
          image2: `3D animated D&D fantasy art: ${sentences[1].trim()}`
        };
      } else if (sentences.length === 1) {
        imagePrompts = {
          image1: `3D animated D&D fantasy art: ${sentences[0].trim()}`,
          image2: `3D animated D&D fantasy art: ${sentences[0].trim()} - continuation`
        };
      } else {
        imagePrompts = {
          image1: '3D animated D&D fantasy art: Establishing shot of the scene',
          image2: '3D animated D&D fantasy art: Action scene with characters'
        };
      }
    }

    // Validate the response structure
    const requiredKeys = ['image1', 'image2'];
    const missingKeys = requiredKeys.filter(key => !imagePrompts[key]);
    
    if (missingKeys.length > 0) {
      console.error('Missing required keys in response:', missingKeys);
      // Fill in missing keys with fallback prompts
      missingKeys.forEach(key => {
        imagePrompts[key] = `Animated D&D fantasy art: ${key}`;
      });
    }

    return NextResponse.json({ 
      imagePrompts: [imagePrompts.image1, imagePrompts.image2]
    });

  } catch (error) {
    console.error('Error in generate-image-prompt API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 