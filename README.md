# Infinity - D&D Infinite Story Game

A web-based infinite storytelling game with AI-generated images using FLUX.1 Kontext APIs.

## 🎮 Features

- **Infinite D&D Storytelling**: Choose your path through branching narratives
- **AI-Generated Images**: FLUX.1 Kontext integration for dynamic scene visualization
- **Responsive Design**: Works on desktop and mobile devices
- **Clean Architecture**: TypeScript, Next.js 14, and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FLUX.1 Kontext API key (from Replicate)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd infinity
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the project root:
   ```env
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

3. **Get your FLUX.1 API key:**
   - Visit [Replicate](https://replicate.com/)
   - Sign up and get your API token
   - Add it to `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── page.tsx        # Home page
│   ├── game/           # Game pages
│   └── layout.tsx      # Root layout
├── components/         # Reusable components
│   └── StoryImage.tsx  # Image generation component
├── data/              # Story data
│   └── storyNodes.ts  # Story nodes and choices
├── services/          # API services
│   └── fluxApi.ts     # FLUX.1 Kontext integration
└── types/             # TypeScript types
    └── story.ts       # Story-related types
```

## 🎨 Customization

### Adding New Story Nodes

Edit `src/data/storyNodes.ts` to add new story branches:

```typescript
{
  id: 11,
  text: "Your story text here...",
  imagePrompt: "Description for AI image generation",
  choices: [
    { text: "Choice 1", next: 12 },
    { text: "Choice 2", next: 13 },
  ],
}
```

### Modifying Image Generation

Update `src/services/fluxApi.ts` to customize FLUX.1 parameters:

```typescript
const request = {
  prompt: "Your image prompt",
  strength: 0.8,           // How much to change base image
  guidance_scale: 7.5,     // Prompt adherence
  num_inference_steps: 20  // Quality vs speed
};
```

## 🔧 Development

- **TypeScript**: Full type safety
- **ESLint**: Code quality and consistency
- **Tailwind CSS**: Utility-first styling
- **Next.js 14**: App router and server components

## 📝 License

MIT License - feel free to use this project for your own adventures!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Happy adventuring!** 🐉⚔️
