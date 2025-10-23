# Epic 1: Project Setup & Infrastructure

## Overview
Set up the foundational infrastructure for the Dream Video POC application, including Next.js, TypeScript, Netlify configuration, and basic project structure.

## Goals
- Create a minimal Next.js + TypeScript application
- Configure Netlify for serverless functions and blob storage
- Establish environment variable management
- Set up basic folder structure following best practices

## User Stories

### US-1.1: Initialize Next.js Application
**As a** developer
**I want** a Next.js application with TypeScript
**So that** I can build a type-safe frontend

**Acceptance Criteria:**
- Next.js 14+ installed with App Router
- TypeScript configured with strict mode
- Basic app layout and page structure
- ESLint and Prettier configured
- Git repository initialized with .gitignore

**Tasks:**
- [ ] Run `npx create-next-app@latest` with TypeScript
- [ ] Configure `tsconfig.json` with strict settings
- [ ] Set up ESLint and Prettier
- [ ] Create basic folder structure: `/app`, `/components`, `/lib`, `/types`
- [ ] Add `.gitignore` for node_modules, .env files, build artifacts

---

### US-1.2: Configure Netlify
**As a** developer
**I want** Netlify configured for serverless functions and blob storage
**So that** I can deploy the application with backend capabilities

**Acceptance Criteria:**
- `netlify.toml` configuration file created
- Netlify Functions directory structure set up
- Netlify Blob storage configured
- Local development environment works with Netlify CLI

**Tasks:**
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Create `netlify.toml` with build and function settings
- [ ] Create `/netlify/functions` directory
- [ ] Configure Netlify Blob storage
- [ ] Test local dev with `netlify dev`
- [ ] Add npm script: `"dev:netlify": "netlify dev"`

**netlify.toml Configuration:**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/.netlify/functions/:splat"
  status = 200
  force = false
  conditions = {Path = "/.netlify/functions/*"}
```

---

### US-1.3: Environment Variables Setup
**As a** developer
**I want** secure environment variable management
**So that** API keys and secrets are not exposed

**Acceptance Criteria:**
- `.env.local` for local development
- `.env.example` template committed to repo
- Environment variables documented
- Netlify environment variables guide created

**Tasks:**
- [ ] Create `.env.local` with required variables
- [ ] Create `.env.example` template
- [ ] Document all environment variables in README
- [ ] Add `.env*` to `.gitignore` (except `.env.example`)

**Required Environment Variables:**
```env
OPENAI_API_KEY=sk-...
NETLIFY_BLOB_STORE_TOKEN=...
```

---

### US-1.4: TypeScript Type Definitions
**As a** developer
**I want** shared TypeScript types for the application
**So that** frontend and backend have type safety

**Acceptance Criteria:**
- `/types` directory created
- Sora 2 API types defined
- Common application types defined
- Types exported from central index file

**Tasks:**
- [ ] Create `/types/sora.ts` for Sora 2 API types
- [ ] Create `/types/app.ts` for application types
- [ ] Create `/types/index.ts` to export all types
- [ ] Add JSDoc comments to type definitions

**Type Definitions:**
```typescript
// types/sora.ts
export interface VideoJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  createdAt: string;
  completedAt?: string;
  videoUrl?: string;
  error?: string;
}

export interface CreateVideoRequest {
  model: 'sora-2' | 'sora-2-pro';
  prompt: string;
  duration?: number;
  resolution?: '720p' | '1080p';
}

export interface VideoStatusResponse {
  id: string;
  status: string;
  created_at: number;
  completed_at?: number;
  download_url?: string;
  error?: string;
}
```

---

### US-1.5: Basic Project Structure
**As a** developer
**I want** a well-organized project structure
**So that** code is maintainable and follows best practices

**Acceptance Criteria:**
- Logical folder structure created
- README with project overview
- Basic documentation structure
- Package.json scripts configured

**Tasks:**
- [ ] Create folder structure
- [ ] Add README.md with project description
- [ ] Configure package.json scripts
- [ ] Add LICENSE file

**Folder Structure:**
```
dream-app-poc/
├── app/                    # Next.js app router
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   └── features/          # Feature-specific components
├── lib/                   # Utility functions
│   ├── api.ts            # API client helpers
│   └── storage.ts        # Local storage helpers
├── netlify/
│   └── functions/         # Serverless functions
├── types/                 # TypeScript types
├── docs/                  # Documentation
│   ├── backlog/          # Epics and user stories
│   └── knowledge/        # Technical documentation
├── tests/                 # E2E and integration tests
│   ├── e2e/
│   └── integration/
├── .env.example
├── .gitignore
├── netlify.toml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Definition of Done
- [ ] Next.js application runs locally
- [ ] TypeScript compiles without errors
- [ ] Netlify CLI runs successfully with `netlify dev`
- [ ] Environment variables are properly configured
- [ ] Project structure follows best practices
- [ ] All code passes linting
- [ ] README documents setup instructions

## Dependencies
None (foundation epic)

## Estimated Effort
2-3 hours

## Technical Notes
- Use Next.js 14+ with App Router for modern React features
- Configure strict TypeScript for better type safety
- Use Netlify CLI for local function testing
- Keep dependencies minimal for POC
