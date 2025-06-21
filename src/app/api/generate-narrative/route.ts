import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Scene } from '@/types/story';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { lastAction, currentScene, storyProgress }: { lastAction: string; currentScene: Scene; storyProgress?: any } = await request.json();

    if (!lastAction || !currentScene) {
      return NextResponse.json({ error: 'Action and scene context are required' }, { status: 400 });
    }
    
    const characterDescriptions = currentScene.characters
      .map(c => `${c.name} the ${c.race} ${c.class} (currently ${c.currentEmotion})`)
      .join(', ');

    // Use story progression to add variety
    const progressionContext = storyProgress ? `
      STORY PROGRESSION:
      - Scene Number: ${storyProgress.sceneNumber || 1}
      - Tension Level: ${storyProgress.tensionLevel || 'medium'}
      - Total Character Interactions: ${storyProgress.totalActions || 0}
      - Recent Action Type: ${storyProgress.actionHistory?.[0] || 'unknown'}
    ` : '';

    const systemPrompt = `
      You are a master D&D storyteller creating dynamic, unpredictable narratives. Generate exactly 2 moderately detailed sentences that show the immediate visual consequences of the player's action.

      NARRATIVE RULES:
      1. Write exactly 2 sentences, each 15-25 words
      2. Include specific visual details and character actions
      3. Focus on atmosphere, lighting, and environmental changes
      4. NO dialogue or speech - pure visual storytelling
      5. Maintain character visual consistency:
         - Thorin: dwarf, red beard, chain mail, battle axe
         - Elara: elf, silver hair, blue robes, staff
         - Grimtooth: orc, green skin, tattoos, great axe
         - Human Fighter: chain mail, determined
      6. Vary sentence structure and pacing
      7. Create tension, surprise, or unexpected outcomes
      8. Reference specific environmental details from the location

      ACTION TYPES AND RESPONSES:
      - COMBAT actions: Show weapon movements, battle stances, environmental damage, defensive reactions
      - DIPLOMACY actions: Display body language changes, facial expressions, gesture modifications, atmosphere shifts
      - EXPLORATION actions: Focus on discovery details, environmental interactions, hidden elements, spatial awareness
      - MAGIC actions: Include mystical effects, energy patterns, environmental reactions, magical consequences
      - STEALTH actions: Emphasize shadow movements, sound effects, subtle positioning, environmental awareness

      VARIETY TECHNIQUES:
      - Start sentences with different elements (character, environment, action, atmosphere)
      - Mix short and long sentences
      - Include unexpected environmental reactions
      - Add sensory details (sounds, smells, textures)
      - Create cause-and-effect relationships between sentences
      - Vary the focus between characters and environment
      - Consider story progression and build upon previous events

      CONTEXT:
      - Location: ${currentScene.location}
      - Characters: ${characterDescriptions}
      - Atmosphere: ${currentScene.atmosphere || 'mysterious'}
      - Player Action: "${lastAction}"
      ${progressionContext}

      Create a narrative that shows immediate, specific visual consequences with unexpected elements.
      Return ONLY a valid JSON object with the key "narrative" containing exactly 2 sentences as a single string.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 200, // Reduced to prevent truncation
    });
    
    const narrative = response.choices[0]?.message?.content;
    if (!narrative) {
      throw new Error('Failed to generate narrative from OpenAI.');
    }
    
    // Try to parse the JSON, with fallback handling
    try {
      const parsedNarrative = JSON.parse(narrative);
      
      // Handle case where AI returns an array instead of a string
      if (parsedNarrative.narrative && Array.isArray(parsedNarrative.narrative)) {
        // Convert array to string by joining the sentences
        parsedNarrative.narrative = parsedNarrative.narrative.join(' ');
      }
      
      // Validate that we have the expected structure
      if (!parsedNarrative.narrative || typeof parsedNarrative.narrative !== 'string') {
        throw new Error('Invalid narrative structure');
      }
      
      return NextResponse.json(parsedNarrative);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw narrative response:', narrative);
      
      // Try to extract narrative using regex as fallback
      const narrativeMatch = narrative.match(/"narrative"\s*:\s*"([^"]+)"/);
      if (narrativeMatch) {
        return NextResponse.json({ narrative: narrativeMatch[1] });
      }
      
      // Last resort fallback - create 2 sentences from the action
      const fallbackNarrative = createFallbackNarrative(lastAction, currentScene);
      return NextResponse.json({ narrative: fallbackNarrative });
    }

  } catch (error) {
    console.error('Error generating narrative:', error);
    return NextResponse.json({ 
      narrative: "You take action in the tavern, the characters react with curiosity, tension builds in the air, and new possibilities emerge before you."
    }, { status: 500 });
  }
}

// Helper function to create fallback narrative
function createFallbackNarrative(action: string, scene: any): string {
  const location = scene.location || 'the tavern';
  return [
    `You ${action.toLowerCase()} in ${location}, the atmosphere thick with anticipation.`,
    `The characters react with tense expressions and ready stances.`
  ].join(' ');
} 