export interface Choice {
  text: string;
  next: number;
}

export interface StoryNode {
  id: string;
  scene: Scene;
  nextNodes: string[];
  requirements?: string[];
}

export interface Character {
  name: string;
  race: string;
  class: string;
  personality: string;
  currentEmotion: string;
  relationshipWithPlayer: number; // -100 to 100
  description: string;
  visualDescription?: string; // Consistent visual attributes for image generation
  isUser?: boolean; // Flag to identify the user character
}

export interface UserCharacter extends Character {
  isUser: true;
  level: number;
  experience: number;
  inventory: string[];
  skills: string[];
  background: string;
}

export interface Scene {
  id: string;
  description: string;
  characters: Character[];
  location: string;
  atmosphere: string;
  imagePrompts: string[];
  imageUrls?: string[];
  choices?: StoryChoice[];
  userCharacter?: UserCharacter; // The user's character in this scene
}

export interface StoryChoice {
  id: string;
  text: string;
  action: string;
  description: string;
  type?: 'combat' | 'diplomacy' | 'exploration' | 'magic' | 'stealth';
}

export interface Message {
  id: string;
  type: 'system' | 'user' | 'assistant';
  content: string;
  scene?: Scene;
  timestamp: Date;
}

export interface GameState {
  messages: Message[];
  currentScene: Scene;
  characters: Character[];
  storyHistory: Scene[];
  playerChoices: string[];
  userCharacter: UserCharacter;
  gameProgress: {
    chapter: number;
    location: string;
    mainQuest: string;
  };
  isLoading: boolean;
} 