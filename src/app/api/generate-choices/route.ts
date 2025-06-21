import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Scene, StoryChoice } from '@/types/story';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { scene, usedChoices }: { scene: Scene; usedChoices?: string[] } = await request.json();

    if (!scene) {
      return NextResponse.json({ error: 'Scene context is required' }, { status: 400 });
    }

    // Construct a detailed prompt for the AI Dungeon Master
    const characterDescriptions = scene.characters
      .map(c => `${c.name} the ${c.race} ${c.class} is feeling ${c.currentEmotion}. Relationship with player: ${c.relationshipWithPlayer}.`)
      .join(' ');

    const userCharacterDescription = scene.userCharacter
      ? `The player is ${scene.userCharacter.name}, a ${scene.userCharacter.race} ${scene.userCharacter.class}.`
      : 'The player is a brave adventurer.';

    const usedChoicesContext = usedChoices && usedChoices.length > 0 
      ? `\n\nPREVIOUSLY USED ACTIONS (avoid these): ${usedChoices.join(', ')}`
      : '';

    const refinedPrompt = `
      You are a master Dungeon Master for a fantasy role-playing game.
      Based on the following scene, generate three distinct and compelling choices for the player.

      Current Scene:
      - Location: ${scene.location}
      - Atmosphere: ${scene.atmosphere}
      - Description: ${scene.description}
      - Characters Present: ${characterDescriptions}
      - Player Character: ${userCharacterDescription}
      - Scene Context: ${scene.id ? 'Scene ' + scene.id : 'Initial scene'}${usedChoicesContext}

      Instructions:
      1. Create three different choices that logically follow from the scene.
      2. Include a mix of action types:
         - COMBAT: Aggressive, confrontational, or martial actions
         - DIPLOMACY: Social, persuasive, or negotiation actions
         - EXPLORATION: Investigative, curious, or discovery actions
         - MAGIC: Mystical, arcane, or supernatural actions
         - STEALTH: Subtle, sneaky, or covert actions
      3. Each choice must have:
         - 'text': Short button label (max 4 words)
         - 'description': What the action entails (max 20 words)
         - 'action': Concise snake_case identifier
         - 'type': One of the action types above
      4. Make choices impactful and meaningful to the story progression.
      5. Vary the risk level and consequences of each choice.
      6. Consider the current atmosphere and character emotions.
      7. Include choices that could lead to unexpected outcomes.
      8. IMPORTANT: Do NOT use any actions that have been previously used.

      VARIETY GUIDELINES:
      - Mix high-risk and low-risk options
      - Include choices that target different characters
      - Vary between direct and indirect approaches
      - Consider environmental interactions
      - Include choices that could change the scene's atmosphere
      - Provide options that could reveal hidden information
      - Ensure each choice is unique and hasn't been used before

      Example JSON response format:
      {
        "choices": [
          {
            "id": "choice_1",
            "text": "Draw Sword",
            "action": "draw_weapon",
            "type": "combat",
            "description": "Ready your weapon and prepare for battle."
          },
          {
            "id": "choice_2",
            "text": "Calm Tensions",
            "action": "diplomatic_approach",
            "type": "diplomacy",
            "description": "Use words to defuse the situation peacefully."
          },
          {
            "id": "choice_3",
            "text": "Scan Room",
            "action": "investigate_surroundings",
            "type": "exploration",
            "description": "Look for exits, weapons, or hidden threats."
          }
        ]
      }

      Provide your response as a valid JSON object with a single key "choices". The value of "choices" must be an array of three choice objects. Do not include any other text or markdown.
    `;

     const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [{ role: 'system', content: refinedPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const rawContent = aiResponse.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error('OpenAI returned no content.');
    }
    
    const parsedJson = JSON.parse(rawContent);
    const choices: StoryChoice[] = parsedJson.choices;

    // Add unique IDs if the model doesn't provide them reliably
    const choicesWithIds = choices.map((choice, index) => ({
        ...choice,
        id: `ai_choice_${Date.now()}_${index}`
    }));

    return NextResponse.json({ choices: choicesWithIds });

  } catch (error) {
    console.error('Error generating choices:', error);
    return NextResponse.json({ error: 'Failed to generate choices' }, { status: 500 });
  }
} 