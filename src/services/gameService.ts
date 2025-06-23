import { Character, Scene, StoryChoice, UserCharacter } from '@/types/story';

// Track used choices to prevent repetition
const usedChoices: Set<string> = new Set();

// Function to reset used choices (for new games or when all choices are exhausted)
function resetUsedChoices() {
  usedChoices.clear();
}

// Create user character
function createUserCharacter(): UserCharacter {
  return {
    name: 'Adventurer',
    race: 'human',
    class: 'fighter',
    personality: 'Brave and determined, seeking adventure and glory',
    currentEmotion: 'curious',
    relationshipWithPlayer: 0,
    description: 'A courageous human fighter with a strong sense of justice and a thirst for adventure',
    isUser: true,
    level: 1,
    experience: 0,
    inventory: ['longsword', 'shield', 'backpack', 'rations'],
    skills: ['athletics', 'intimidation', 'perception'],
    background: 'A wandering adventurer who has traveled far and wide seeking fortune and glory'
  };
}

// Enhanced input analysis with more specific actions
function analyzeUserInput(input: string): {
  actions: string[];
  emotions: string[];
  characters: string[];
  intensity: number;
  context: string;
} {
  const lowerInput = input.toLowerCase();
  const actions: string[] = [];
  const emotions: string[] = [];
  const characters: string[] = [];
  let intensity = 1;

  // Combat actions
  if (lowerInput.includes('attack') || lowerInput.includes('fight') || lowerInput.includes('battle') || 
      lowerInput.includes('sword') || lowerInput.includes('weapon') || lowerInput.includes('kill') ||
      lowerInput.includes('defend') || lowerInput.includes('block') || lowerInput.includes('dodge')) {
    actions.push('combat');
    intensity = Math.max(intensity, 3);
  }

  // Dialogue actions
  if (lowerInput.includes('talk') || lowerInput.includes('speak') || lowerInput.includes('ask') ||
      lowerInput.includes('tell') || lowerInput.includes('say') || lowerInput.includes('question') ||
      lowerInput.includes('conversation') || lowerInput.includes('discuss') || lowerInput.includes('chat')) {
    actions.push('dialogue');
  }

  // Exploration actions
  if (lowerInput.includes('look') || lowerInput.includes('search') || lowerInput.includes('explore') ||
      lowerInput.includes('examine') || lowerInput.includes('investigate') || lowerInput.includes('find') ||
      lowerInput.includes('move') || lowerInput.includes('walk') || lowerInput.includes('go') ||
      lowerInput.includes('enter') || lowerInput.includes('leave') || lowerInput.includes('open')) {
    actions.push('exploration');
  }

  // Magic actions
  if (lowerInput.includes('spell') || lowerInput.includes('magic') || lowerInput.includes('cast') ||
      lowerInput.includes('enchant') || lowerInput.includes('summon') || lowerInput.includes('teleport') ||
      lowerInput.includes('fireball') || lowerInput.includes('heal') || lowerInput.includes('shield')) {
    actions.push('magic');
    intensity = Math.max(intensity, 2);
  }

  // Character development
  if (lowerInput.includes('friend') || lowerInput.includes('ally') || lowerInput.includes('help') ||
      lowerInput.includes('trust') || lowerInput.includes('betray') || lowerInput.includes('save') ||
      lowerInput.includes('protect') || lowerInput.includes('follow') || lowerInput.includes('join')) {
    actions.push('character_development');
  }

  // Environment changes
  if (lowerInput.includes('light') || lowerInput.includes('dark') || lowerInput.includes('weather') ||
      lowerInput.includes('storm') || lowerInput.includes('fire') || lowerInput.includes('water') ||
      lowerInput.includes('earth') || lowerInput.includes('wind') || lowerInput.includes('portal')) {
    actions.push('environment_change');
  }

  // Emotion detection
  if (lowerInput.includes('angry') || lowerInput.includes('furious') || lowerInput.includes('rage')) {
    emotions.push('angry');
    intensity = Math.max(intensity, 3);
  }
  if (lowerInput.includes('happy') || lowerInput.includes('joy') || lowerInput.includes('excited')) {
    emotions.push('happy');
  }
  if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('melancholy')) {
    emotions.push('sad');
  }
  if (lowerInput.includes('fear') || lowerInput.includes('afraid') || lowerInput.includes('scared')) {
    emotions.push('fearful');
    intensity = Math.max(intensity, 2);
  }
  if (lowerInput.includes('curious') || lowerInput.includes('interested') || lowerInput.includes('wonder')) {
    emotions.push('curious');
  }

  // Character detection
  if (lowerInput.includes('thorin') || lowerInput.includes('dwarf')) {
    characters.push('thorin');
  }
  if (lowerInput.includes('elara') || lowerInput.includes('elf') || lowerInput.includes('mage')) {
    characters.push('elara');
  }
  if (lowerInput.includes('grimtooth') || lowerInput.includes('orc')) {
    characters.push('grimtooth');
  }

  // Intensity modifiers
  if (lowerInput.includes('very') || lowerInput.includes('extremely') || lowerInput.includes('intensely')) {
    intensity = Math.min(intensity + 1, 5);
  }
  if (lowerInput.includes('slightly') || lowerInput.includes('gently') || lowerInput.includes('softly')) {
    intensity = Math.max(intensity - 1, 1);
  }

  return { actions, emotions, characters, intensity, context: input };
}

// Generate choices dynamically using AI
async function generateChoices(currentScene: Scene): Promise<StoryChoice[]> {
  try {
    const response = await fetch('/api/generate-choices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        scene: currentScene,
        usedChoices: Array.from(usedChoices) // Send used choices to API
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI-generated choices');
    }

    const data = await response.json();
    const choices = data.choices || [];

    // Add the new choices to the used choices set
    choices.forEach((choice: StoryChoice) => {
      usedChoices.add(choice.action);
    });

    return choices;
  } catch (error) {
    console.error('Error generating dynamic choices:', error);
    // Fallback to simple choices if AI fails
    const fallbackChoices: StoryChoice[] = [
      { id: 'fallback_1', text: 'Look around', action: 'look_around', description: 'Take a moment to observe your surroundings carefully.', type: 'exploration' },
      { id: 'fallback_2', text: 'Wait and see', action: 'wait_and_see', description: 'Stay put for a moment to see what happens next.', type: 'stealth' },
      { id: 'fallback_3', text: 'Greet them', action: 'greet_characters', description: 'Approach the group with a friendly greeting.', type: 'diplomacy' },
    ];

    // Filter out already used fallback choices
    const availableFallbacks = fallbackChoices.filter(choice => !usedChoices.has(choice.action));
    
    // If all fallbacks are used, reset the used choices set
    if (availableFallbacks.length === 0) {
      usedChoices.clear();
      return fallbackChoices;
    }

    return availableFallbacks;
  }
}

// Generate image prompts from a scene description or narrative
async function generateImagePrompt(scene: Scene, narrative?: string): Promise<string[]> {
  try {
    const characterInfo = scene.characters.map(c => `${c.name} the ${c.race} ${c.class}`).join(', ');
    
    const response = await fetch('/api/generate-image-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        primaryText: narrative || scene.description,
        location: scene.location,
        characterInfo: characterInfo,
        atmosphere: scene.atmosphere,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI-generated image prompts');
    }

    const data = await response.json();
    return data.imagePrompts || ['3D animated D&D fantasy art: mysterious fantasy scene', '3D animated D&D fantasy art: mysterious fantasy scene'];
  } catch (error) {
    console.error('Error generating image prompts:', error);
    return [
      '3D animated D&D fantasy art: mysterious fantasy scene',
      '3D animated D&D fantasy art: mysterious fantasy scene'
    ];
  }
}

async function generateNarrative(lastAction: string, currentScene: Scene, storyProgress: Record<string, unknown>): Promise<string> {
  try {
    const response = await fetch('/api/generate-narrative', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastAction, currentScene, storyProgress }),
    });
    if (!response.ok) throw new Error('Failed to fetch narrative');
    const data = await response.json();
    return data.narrative;
  } catch (error) {
    console.error('Error generating narrative:', error);
    return "Your action has unexpected consequences, creating a moment of tense silence.";
  }
}

// Generate response based on a chosen action
async function generateResponse(
  choiceAction: string,
  currentScene: Scene,
  characters: Character[],
  userCharacter: UserCharacter
): Promise<{ scene: Scene; imagePrompts: string[] }> {
  // Determine the action text and type from the choice
  const choice = currentScene.choices?.find(c => c.action === choiceAction);
  const actionText = choice ? choice.text : choiceAction; // Fallback to action if text not found
  const actionType = choice?.type || 'general'; // Get the action type

  // Mark this choice as used when it's actually selected
  usedChoices.add(choiceAction);

  // Track story progression for more dynamic narratives
  const storyProgress = {
    sceneNumber: parseInt(currentScene.id) || 1,
    totalActions: characters.reduce((sum, char) => sum + Math.abs(char.relationshipWithPlayer), 0),
    actionHistory: [actionType],
    tensionLevel: characters.some(char => char.currentEmotion === 'tense' || char.currentEmotion === 'suspicious') ? 'high' : 'low'
  };

  // Generate the narrative outcome of the action with progression context
  const sceneDescription = await generateNarrative(actionText, currentScene, storyProgress);
  
  const analysis = analyzeUserInput(sceneDescription); // Analyze the *new* narrative

  // Update characters based on the new narrative and action type
  const updatedCharacters = characters.map(char => {
    const charCopy = { ...char };
    
    // Update based on action type with more variety
    if (choice?.type) {
      switch (choice.type) {
        case 'combat':
          if (char.name === 'Grimtooth') {
            charCopy.currentEmotion = 'excited'; // Orcs like combat
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 10);
          } else if (char.name === 'Thorin') {
            charCopy.currentEmotion = 'alert';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 5);
          } else if (char.name === 'Elara') {
            charCopy.currentEmotion = 'concerned';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 8);
          } else {
            charCopy.currentEmotion = 'tense';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 15);
          }
          break;
        case 'diplomacy':
          if (char.name === 'Thorin') {
            charCopy.currentEmotion = 'respectful';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 15);
          } else if (char.name === 'Elara') {
            charCopy.currentEmotion = 'pleased';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 12);
          } else if (char.name === 'Grimtooth') {
            charCopy.currentEmotion = 'suspicious';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 5);
          } else {
            charCopy.currentEmotion = 'calming';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 10);
          }
          break;
        case 'exploration':
          if (char.name === 'Elara') {
            charCopy.currentEmotion = 'curious';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 8);
          } else if (char.name === 'Thorin') {
            charCopy.currentEmotion = 'watchful';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 5);
          } else if (char.name === 'Grimtooth') {
            charCopy.currentEmotion = 'alert';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 3);
          } else {
            charCopy.currentEmotion = 'curious';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 5);
          }
          break;
        case 'magic':
          if (char.name === 'Elara') {
            charCopy.currentEmotion = 'fascinated';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 20);
          } else if (char.name === 'Thorin') {
            charCopy.currentEmotion = 'wary';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 5);
          } else if (char.name === 'Grimtooth') {
            charCopy.currentEmotion = 'intimidated';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 10);
          } else {
            charCopy.currentEmotion = 'intrigued';
            charCopy.relationshipWithPlayer = Math.min(100, charCopy.relationshipWithPlayer + 8);
          }
          break;
        case 'stealth':
          if (char.name === 'Grimtooth') {
            charCopy.currentEmotion = 'suspicious';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 8);
          } else if (char.name === 'Thorin') {
            charCopy.currentEmotion = 'cautious';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 5);
          } else if (char.name === 'Elara') {
            charCopy.currentEmotion = 'concerned';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 3);
          } else {
            charCopy.currentEmotion = 'suspicious';
            charCopy.relationshipWithPlayer = Math.max(-100, charCopy.relationshipWithPlayer - 5);
          }
          break;
      }
    }
    
    // Add random variation to prevent repetitive responses
    const randomVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
    charCopy.relationshipWithPlayer = Math.max(-100, Math.min(100, charCopy.relationshipWithPlayer + randomVariation));
    
    return charCopy;
  });

  // Determine the new atmosphere based on the action type and narrative
  let newAtmosphere = 'neutral';
  if (choice?.type) {
    switch (choice.type) {
      case 'combat':
        newAtmosphere = 'tense';
        break;
      case 'diplomacy':
        newAtmosphere = 'conversational';
        break;
      case 'exploration':
        newAtmosphere = 'curious';
        break;
      case 'magic':
        newAtmosphere = 'mystical';
        break;
      case 'stealth':
        newAtmosphere = 'suspicious';
        break;
    }
  } else if (analysis.actions.includes('combat')) {
    newAtmosphere = 'combat';
  } else if (analysis.actions.includes('dialogue')) {
    newAtmosphere = 'conversation';
  } else if (analysis.actions.includes('exploration')) {
    newAtmosphere = 'exploration';
  } else if (analysis.actions.includes('magic')) {
    newAtmosphere = 'mystical';
  }

  // Create an intermediate scene with the new description
  const intermediateScene: Scene = {
    id: Date.now().toString(),
    description: sceneDescription,
    characters: updatedCharacters,
    location: currentScene.location,
    atmosphere: newAtmosphere,
    imagePrompts: [], // This will be generated next
    userCharacter: userCharacter,
  };

  // Generate the final scene details in parallel
  // Now pass the narrative text to generate image prompt based on the story outcome
  const [imagePrompts, newChoices] = await Promise.all([
    generateImagePrompt(intermediateScene, sceneDescription), // Pass the narrative!
    generateChoices(intermediateScene)
  ]);

  const finalScene: Scene = {
    ...intermediateScene,
    imagePrompts,
    choices: newChoices,
  };

  return { scene: finalScene, imagePrompts };
}

export async function processChoice(
  choiceAction: string, 
  currentScene: Scene, 
  characters: Character[],
  userCharacter: UserCharacter
): Promise<{ scene: Scene; imagePrompts: string[] }> {
  return generateResponse(choiceAction, currentScene, characters, userCharacter);
}

export async function getInitialScene(): Promise<Scene> {
  // Reset used choices for a new game
  resetUsedChoices();
  
  const userCharacter = createUserCharacter();
  
  const initialCharacters: Character[] = [
    {
      name: 'Thorin Ironbeard',
      race: 'dwarf',
      class: 'fighter',
      personality: 'Stubborn and proud, but honorable and loyal to his clan',
      currentEmotion: 'curious',
      relationshipWithPlayer: 0,
      description: 'A battle-hardened dwarf fighter with a magnificent red beard that flows to his chest, wearing weathered chain mail armor with dwarven runes etched into the metal, and wielding a finely crafted battle axe with a steel head and oak handle. His eyes gleam with the wisdom of centuries of dwarven tradition, and his stocky frame is built like solid stone.',
      visualDescription: 'Stocky dwarf male, 4 feet tall, broad shoulders, thick muscular arms, flowing red beard reaching chest length with braided sections, weathered brown chain mail armor with golden dwarven runes, steel battle axe with oak handle, brown leather boots, determined brown eyes, proud stance, stout build, weathered skin, thick eyebrows, strong jawline'
    },
    {
      name: 'Elara Moonwhisper',
      race: 'elf',
      class: 'wizard',
      personality: 'Wise and mysterious, with ancient knowledge of the arcane arts',
      currentEmotion: 'calm',
      relationshipWithPlayer: 0,
      description: 'An elegant high elf wizard with silver hair that shimmers like moonlight, wearing flowing blue robes adorned with mystical symbols and silver embroidery, carrying an ancient wooden staff topped with a glowing crystal. Her eyes hold the depth of centuries of magical study, and her graceful movements speak of elven nobility.',
      visualDescription: 'Tall elegant female elf, 6 feet tall, slender graceful build, long silver hair reaching waist with subtle blue highlights, flowing blue robes with silver mystical symbols, wooden staff with glowing blue crystal, pointed ears, bright blue eyes, pale flawless skin, graceful movements, wise expression, ethereal aura'
    },
    {
      name: 'Grimtooth Skullcrusher',
      race: 'orc',
      class: 'barbarian',
      personality: 'Fierce and intimidating, but respects strength and honor in battle',
      currentEmotion: 'suspicious',
      relationshipWithPlayer: -20,
      description: 'A massive orc barbarian with tribal tattoos covering his green skin in intricate patterns, wearing leather armor reinforced with metal studs, and carrying a massive great axe with a double-bladed head. His tusks gleam and his red eyes burn with primal intensity, while his muscular frame radiates raw power.',
      visualDescription: 'Massive male orc, 7 feet tall, muscular green skin, intricate red tribal tattoos covering arms and chest, leather armor with metal studs, double-bladed great axe, large gleaming white tusks, bright red eyes, shaved head, broad shoulders, powerful build, scarred face, fierce expression'
    }
  ];

  const initialSceneDescription = `You, a brave human fighter, find yourself in an ancient fantasy tavern called The Dragon's Breath. The smoky atmosphere is thick with the scent of ale and adventure. Three distinct characters sit at a corner table - Thorin Ironbeard the dwarf fighter, Elara Moonwhisper the elven wizard, and Grimtooth Skullcrusher the orc barbarian. They seem to be in the middle of an important discussion, and their eyes turn to you as you enter.`;

  const initialSceneContext = {
    id: 'initial',
    description: initialSceneDescription,
    characters: initialCharacters,
    location: 'The Dragon\'s Breath Tavern',
    atmosphere: 'mysterious',
    imagePrompts: [], // Will be generated
    userCharacter: userCharacter,
  };

  const [imagePromptsResult, initialChoices] = await Promise.all([
    generateImagePrompt(initialSceneContext, initialSceneDescription), // Pass the narrative for initial scene too
    generateChoices(initialSceneContext)
  ]);

  return {
    ...initialSceneContext,
    imagePrompts: imagePromptsResult,
    choices: initialChoices,
  };
}
