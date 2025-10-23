# Dream Video POC

A proof-of-concept application that generates AI videos from dream descriptions using OpenAI's Sora 2 API. Built with Next.js, TypeScript, and deployed on Netlify.

![Dream Video Generator](https://img.shields.io/badge/Status-POC-yellow)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- 🎬 **AI Video Generation**: Transform dream descriptions into videos using Sora 2
- 📊 **Real-time Status Updates**: Monitor video generation progress with polling every 5 seconds
- 📼 **Video Playback**: Built-in HTML5 video player with download capability
- 📜 **History Tracking**: Local storage-based history of all generated videos
- ☁️ **Serverless Architecture**: Netlify Functions for backend processing
- 🎨 **Responsive UI**: Clean, modern interface built with Tailwind CSS
- ✅ **Fully Tested**: E2E tests with Playwright and unit tests with Vitest

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** (for version control)
- **OpenAI API Key** with Sora 2 access

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/cr-nattress/dream-app-poc.git
cd dream-app-poc
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development with Netlify Functions

To test the full application with Netlify Functions locally:

```bash
npm run dev:netlify
```

This runs the application on `http://localhost:8888` with Netlify Functions enabled.

## Project Structure

```
dream-app-poc/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── Card.tsx
│   │   └── features/          # Feature-specific components
│   │       ├── DreamInput.tsx
│   │       ├── VideoStatus.tsx
│   │       ├── VideoPlayer.tsx
│   │       └── VideoHistory.tsx
│   ├── lib/                   # Utility functions
│   │   ├── api-client.ts     # Frontend API client
│   │   ├── sora-api.ts       # Sora 2 API wrapper
│   │   ├── blob-storage.ts   # Netlify Blob operations
│   │   ├── storage.ts        # Local storage utilities
│   │   ├── validators.ts     # Input validation
│   │   ├── errors.ts         # Error handling
│   │   └── logger.ts         # Logging utilities
│   └── types/                 # TypeScript type definitions
│       ├── sora.ts
│       ├── app.ts
│       └── index.ts
├── netlify/
│   └── functions/             # Serverless functions
│       ├── create-video.ts   # POST /api/create-video
│       ├── video-status.ts   # GET /api/video-status/:jobId
│       └── get-video.ts      # GET /api/get-video/:jobId
├── tests/
│   ├── e2e/                   # End-to-end tests (Playwright)
│   │   ├── ui-validation.spec.ts
│   │   └── local-storage.spec.ts
│   └── unit/                  # Unit tests (Vitest)
│       └── functions/
│           └── validators.test.ts
├── docs/                      # Documentation
│   ├── backlog/              # Implementation epics
│   └── knowledge/            # Technical documentation
├── .env.example              # Environment variable template
├── netlify.toml             # Netlify configuration
├── package.json
└── tsconfig.json
```

## API Endpoints

### POST /api/create-video

Creates a new video generation job.

**Request:**
```json
{
  "prompt": "A serene dream of floating through cherry blossom trees"
}
```

**Response:**
```json
{
  "jobId": "video_abc123",
  "status": "pending",
  "createdAt": "2025-10-22T21:00:00Z"
}
```

### GET /api/video-status/:jobId

Checks the status of a video generation job.

**Response (Processing):**
```json
{
  "jobId": "video_abc123",
  "status": "processing"
}
```

**Response (Completed):**
```json
{
  "jobId": "video_abc123",
  "status": "completed",
  "videoUrl": "/api/get-video/video_abc123",
  "completedAt": "2025-10-22T21:05:00Z"
}
```

### GET /api/get-video/:jobId

Downloads the completed video file.

**Response:**
- Binary video data (MP4)
- Content-Type: video/mp4

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key (must start with `sk-`) |
| `NETLIFY_BLOB_STORE_TOKEN` | Auto | Auto-generated by Netlify for blob storage |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run dev:netlify` | Start with Netlify Functions (recommended) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run test:e2e:ui` | Run E2E tests in UI mode |
| `npm run test:unit` | Run unit tests with Vitest |

## Testing

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

### Running Unit Tests

```bash
npm run test:unit
```

## Deployment to Netlify

### Option 1: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Configure build settings (auto-detected from `netlify.toml`)
6. Add environment variable: `OPENAI_API_KEY`
7. Deploy!

### Environment Variables on Netlify

In your Netlify dashboard:

1. Go to Site settings → Environment variables
2. Add `OPENAI_API_KEY` with your OpenAI API key
3. `NETLIFY_BLOB_STORE_TOKEN` is automatically generated

## How It Works

### Architecture Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   Next.js Frontend (React)      │
│   • DreamInput Component        │
│   • VideoStatus (polls every 5s)│
│   • VideoPlayer                 │
│   • VideoHistory (localStorage) │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│   Netlify Functions (API)       │
│   • create-video                │
│   • video-status                │
│   • get-video                   │
└────┬──────────────────┬─────────┘
     │                  │
     ▼                  ▼
┌──────────┐    ┌──────────────┐
│ Sora 2   │    │ Netlify Blob │
│   API    │    │   Storage    │
└──────────┘    └──────────────┘
```

### User Flow

1. **Enter Dream**: User types a dream description (10-500 characters)
2. **Submit**: Calls `/api/create-video` → Returns job ID
3. **Poll Status**: Frontend polls `/api/video-status/:jobId` every 5 seconds
4. **Download & Store**: When complete, function downloads video from Sora 2 and stores in Netlify Blob
5. **Display Video**: Video URL returned to frontend, video player shows the result
6. **Save to History**: Job saved to browser's local storage

## Prompt Engineering

The application enhances prompts automatically by adding "Cinematic dream sequence:" prefix to improve video quality.

**Example:**
- Input: `"A serene dream of floating"`
- Sent to API: `"Cinematic dream sequence: A serene dream of floating"`

## Limitations (POC)

- ⏱️ Video generation takes 3-5 minutes
- 📏 Maximum 10-second videos (720p)
- 👤 No user authentication (single user)
- 💾 Videos stored indefinitely (no cleanup mechanism)
- 📱 Local storage only (not synced across devices)
- 💰 No cost tracking or usage limits

## Cost Considerations

Based on Sora 2 pricing:
- **Standard (720p, 10s)**: $3 per video
- **Pro (1080p, 10s)**: $5 per video

Monitor your usage through your OpenAI dashboard.

## Troubleshooting

### Issue: "OPENAI_API_KEY is not configured"

**Solution**: Ensure `.env.local` contains your API key and starts with `sk-`

### Issue: Video generation fails

**Solutions:**
- Check your OpenAI API key is valid
- Ensure you have Sora 2 API access
- Check prompt doesn't violate content policy
- Verify sufficient API credits

### Issue: Netlify Functions not working locally

**Solution**: Use `npm run dev:netlify` instead of `npm run dev`

### Issue: TypeScript errors

**Solution**: Run `npm run type-check` to see all errors, then fix or add proper types

## Contributing

This is a POC project. For contributions:

1. Follow existing code patterns
2. Keep functions small (<50 lines)
3. Keep components modular (<200 lines)
4. Add tests for new features
5. Run linting before committing

## Future Enhancements

- 🔐 User authentication
- 💾 Database for video metadata
- 💳 Payment integration
- ✂️ Video editing capabilities
- 🌐 Social sharing
- 📊 Usage analytics
- 🎨 Style customization
- ⏱️ Longer video durations

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Netlify Functions (Node.js)
- **Storage**: Netlify Blob Storage
- **AI**: OpenAI Sora 2 API
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Deployment**: Netlify

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation in `/docs`

---

**Built with ❤️ using Claude Code**
