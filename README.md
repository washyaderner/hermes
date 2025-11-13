# Hermes - Prompt Engineering Optimization Tool

⚡ Transform basic prompts into platform-specific, optimized versions with AI-powered analysis.

## Overview

Hermes is a Next.js 14 TypeScript application designed to help developers and prompt engineers optimize their prompts for 39+ different AI platforms. It provides real-time analysis, enhancement suggestions, and platform-specific formatting to ensure your prompts achieve the best possible results.

## Features

### 🎯 Core Functionality

- **Real-time Prompt Analysis**: Automatically analyzes prompts for intent, domain, complexity, and quality
- **Platform-Specific Optimization**: Supports 39+ platforms including Claude, ChatGPT, Midjourney, Runway, Suno, and more
- **A/B Testing View**: Generates multiple variations of optimized prompts for comparison
- **Quality Metrics**: Visual speedometer-style quality meters showing input/output quality and token optimization
- **Token Counter**: Real-time token counting with cost estimation
- **Smart Enhancement Engine**: Applies platform-specific formatting, tone adjustments, and few-shot examples

### 🎨 Platform Categories

- **AI Chat**: Claude, ChatGPT, Gemini, DeepSeek, Grok, Perplexity AI
- **Image Generation**: Midjourney, Ideogram, Leonardo AI, Canva AI
- **Video Generation**: Kling AI, Runway, Pika AI, Luma Dream Machine, HeyGen
- **Audio Generation**: Suno, ElevenLabs
- **AI Code**: Cursor, Hugging Face
- **Automation**: Make.com, n8n, Apify
- **Social Media AI**: Buffer AI, TweetHunter, Hypefury, Flick
- **Content AI**: Jasper, Notion AI, Gamma
- **And many more...**

### ⚙️ Control Panel

Customize prompt optimization with:
- **Temperature slider** (0-2): Control creativity vs focus
- **Max tokens**: 500 to 16,000 tokens
- **Tone selection**: Professional, Casual, Academic, Spartan, Laconic, Sarcastic
- **Output formats**: Markdown, JSON, CSV, Bullets, Plain text
- **Few-shot examples**: 0-5 examples with automatic generation
- **Custom system messages**: Override default platform behavior

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Custom shadcn/ui components
- **State Management**: Zustand
- **Database**: Supabase (schema ready, integration pending)
- **Deployment**: Vercel-ready

## Design System

Hermes features a premium dark-mode-only theme:

- **Background**: `#0a0014` (velvety black)
- **Primary**: `#6b46c1` (dream purple)
- **Accent**: `#f97316` (molten core orange)
- **Surface**: `#1a0f2e` (deep purple-black)
- **Text**: `#e2e8f0` (soft white)
- **Muted**: `#64748b` (gray-purple)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hermes
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env` file in the root directory (see `.env.example` for template):

```bash
# Required
NODE_ENV=development
SESSION_SECRET=your-session-secret-here-minimum-32-bytes
ALLOWED_ORIGINS=http://localhost:3000

# Optional (for production)
# DATABASE_URL=postgresql://user:password@localhost:5432/hermes
# REDIS_URL=redis://localhost:6379
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Important**: 
- Generate `SESSION_SECRET` using: `openssl rand -hex 32`
- Set `ALLOWED_ORIGINS` to your production domain(s) in production
- Never commit `.env` file to version control

### Authentication

Default credentials:
- **Username**: `russ`
- **Password**: `SecurePassword123!`

**Note**: In production, implement proper user registration and password reset flows.

## Project Structure

```
/app
  /api
    /analyze          # Prompt analysis endpoint
    /enhance          # Prompt enhancement endpoint
    /platforms        # Platform configuration endpoint
  /auth/login         # Authentication page
  /dashboard          # Main application interface
  /templates          # Template library (coming soon)
  /history            # Prompt history (coming soon)

/components
  /ui                 # Base UI components (Button, Card, Input, etc.)
  /prompt
    /InputArea.tsx           # Prompt input with real-time updates
    /OutputCards.tsx         # Enhanced prompt display cards
    /PlatformSelector.tsx    # Platform selection dropdown
    /QualityMeter.tsx        # Circular quality visualization
    /TokenCounter.tsx        # Token count and cost display
    /ControlPanel.tsx        # Settings and configuration panel

/lib
  /prompt-engine
    /analyzer.ts      # Prompt analysis logic
    /enhancer.ts      # Prompt enhancement algorithms
    /platforms.ts     # 39+ platform configurations
  /store.ts           # Zustand state management
  /utils.ts           # Utility functions

/types
  /index.ts           # TypeScript type definitions
```

## API Routes

### POST /api/analyze
Analyzes a prompt and returns:
- Intent classification
- Domain detection
- Complexity score (1-10)
- Missing components
- Conflict detection
- Quality score (0-100)
- Token count

### POST /api/enhance
Enhances a prompt with platform-specific optimizations:
- Generates 2-3 variations
- Applies tone and style adjustments
- Adds few-shot examples (optional)
- Platform-specific formatting
- Token optimization

### GET /api/platforms
Returns list of all supported platforms with their configurations.

## Key Components

### Quality Meter
A circular speedometer showing scores from 0-100 with color-coded indicators:
- 80-100: Purple (excellent)
- 60-79: Orange (good)
- 40-59: Yellow (fair)
- 0-39: Red (needs improvement)

### Prompt Analysis Engine
Automatically detects:
- **Intent**: creative, code, analysis, conversation, data_processing, instruction
- **Domain**: technical, business, academic, creative, general
- **Complexity**: 1-10 scale based on length, vocabulary, and requirements
- **Missing Components**: context, goals, constraints, examples, format specification
- **Conflicts**: contradictory requirements, unrealistic constraints

### Enhancement System
Applies multiple optimization strategies:
- Platform-specific templates and formatting
- Tone adjustment (6 different tones)
- Few-shot example injection
- Token optimization
- Ambiguity resolution
- System message integration

## Performance Optimizations

- **Debounced input analysis** (300ms) for smooth real-time updates
- **Memoized components** for output cards
- **Cached platform configurations**
- **Lazy loading** for heavy components

## Future Enhancements

- [ ] Full history tracking with search and filtering
- [ ] Template library with categories and sharing
- [ ] User accounts with Supabase authentication
- [ ] Custom datasets for RAG-enhanced prompts
- [ ] Export functionality (PDF, Markdown, JSON)
- [ ] Collaborative prompt editing
- [ ] API integration with actual AI platforms
- [ ] Prompt version control and comparison
- [ ] Analytics dashboard

## Development

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Next.js 14 and TypeScript
- UI components inspired by shadcn/ui
- Dark theme design for optimal readability
- Supports 39+ AI platforms and growing

---

**Note**: This is a demonstration version with hardcoded authentication and mock API responses. Production deployment would require proper authentication, database integration, and potentially actual AI API connections for enhanced analysis.
