# QuackOverflow 🦆

An AI-powered code debugging assistant with personality-driven rubber duck debugging.

## ✨ Features

- 🦆 **Interactive Duck Assistants** - Choose from different duck personalities to help debug your code
- 💬 **Voice Conversations** - Talk to your duck using ElevenLabs voice AI
- 🎨 **Real-time Code Editor** - Write and edit code with syntax highlighting
- 🔐 **User Authentication** - Secure login with Clerk
- 💾 **Persistent Code Storage** - Your code is automatically saved per-user with Convex
- 🤖 **AI-Powered Feedback** - Get intelligent code analysis from Google Gemini

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- A Convex account (free at [convex.dev](https://convex.dev))
- Clerk account for authentication
- ElevenLabs API key for voice
- Google Gemini API key for code analysis

### Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Initialize Convex**:

   ```bash
   npx convex dev
   ```

   Follow the prompts to set up your Convex project.

3. **Configure environment variables**:

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in your API keys and URLs.

4. **Run the development servers**:

   Terminal 1:

   ```bash
   npx convex dev
   ```

   Terminal 2:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
- [CONVEX_SETUP.md](./CONVEX_SETUP.md) - Detailed Convex configuration
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Migration from Zustand to Convex

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, TailwindCSS
- **Database**: Convex (real-time backend)
- **Authentication**: Clerk
- **AI/ML**:
  - Google Gemini for code analysis
  - ElevenLabs for voice interactions
- **UI Components**: Radix UI, shadcn/ui

## 📁 Project Structure

```
quackoverflow/
├── convex/              # Convex backend functions
│   ├── schema.ts        # Database schema
│   └── userCode.ts      # Code storage functions
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   ├── lib/             # Utility functions
│   └── store/           # Client state management
└── public/              # Static assets
```

## 🔑 Environment Variables

Required variables in `.env.local`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ElevenLabs Voice AI
NEXT_PUBLIC_ELEVENLABS_API_KEY=

# Google Gemini
GEMINI_API_KEY=
```

## 🎯 How It Works

1. **User logs in** with Clerk authentication
2. **Code editor loads** the user's previously saved code from Convex
3. **User writes/edits code** with auto-save (1-second debounce)
4. **Select a duck personality** to help debug
5. **Start voice conversation** to discuss code issues
6. **Get AI feedback** from Gemini on code quality and bugs
7. **Code persists** across sessions and devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project was created for HackRU Fall 2025.

## 🐛 Troubleshooting

See [QUICK_START.md](./QUICK_START.md) for common issues and solutions.

---

Built with 💙 and 🦆 by the QuackOverflow team
