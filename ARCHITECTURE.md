# 🏗 Architecture — Med 360 Copilot

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
│  React 19 + Next.js 16 App Router + Tailwind CSS + Framer Motion│
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js App (Server)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │  App Router   │  │  API Routes  │  │  Server Actions    │     │
│  │  (Pages/UI)   │  │  (/api/*)    │  │  (Data fetching)   │     │
│  └──────────────┘  └──────┬───────┘  └───────────────────┘     │
│                           │                                      │
│                           ▼                                      │
│              ┌────────────────────────┐                          │
│              │  AI Provider Abstraction│                          │
│              │  (src/lib/agents/)      │                          │
│              └─────────┬──────────────┘                          │
│                        │                                         │
│           ┌────────────┼────────────┐                            │
│           ▼            ▼            ▼                             │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│     │  Claude  │ │  OpenAI  │ │  Gemini  │                     │
│     │  API     │ │  API     │ │  API     │                     │
│     └──────────┘ └──────────┘ └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | AI chat — voice + text conversational endpoint |
| `/api/triage` | POST | Symptom triage — 4-step AI assessment with urgency |
| `/api/drugs/[name]` | GET | Drug lookup — dosage, mechanism, side effects |
| `/api/analyze-prescription` | POST | Prescription analysis — extract drugs, interactions |
| `/api/check-interactions` | POST | Drug interaction checker |
| `/api/find-alternatives` | POST | Find alternative medications |
| `/api/lab-reports` | POST | Lab report upload and AI analysis |
| `/api/lab-tests/search` | GET | Search lab tests database |
| `/api/generate-guide` | POST | Generate personalized health guides |
| `/api/prescriptions` | GET/POST | Prescription CRUD operations |
| `/api/analysis/[id]` | GET | Retrieve saved analysis by ID |

---

## AI Provider Fallback Chain

The app uses an abstraction layer in `src/lib/agents/` to support multiple AI providers interchangeably.

```
Request comes in
    │
    ▼
Is ANTHROPIC_API_KEY set?  ──Yes──▶  Use Claude (claude-sonnet-4-6)
    │ No
    ▼
Is OPENAI_API_KEY set?     ──Yes──▶  Use OpenAI (gpt-4o-mini)
    │ No
    ▼
Is GOOGLE_API_KEY set?     ──Yes──▶  Use Gemini (gemini-2.0-flash)
    │ No
    ▼
Return error: "No AI provider configured"
```

Each provider implements the same interface, so switching between them requires no code changes — just set a different environment variable.

---

## Component Architecture

```
src/components/
├── chat/                  # Chat-specific components
│   ├── ChatWindow         # Main chat container with message list
│   ├── ChatInput          # Text + voice input bar
│   └── ChatMessage        # Individual message bubble
├── layout/                # App shell components
│   ├── Navbar             # Top navigation bar
│   ├── Sidebar            # Side navigation
│   └── Footer             # Page footer
└── ui/                    # shadcn/ui primitives
    ├── Button
    ├── Card
    ├── Dialog
    ├── Input
    ├── Badge
    └── ...                # Other shadcn/ui components
```

### Page Architecture

Each feature page follows the pattern:

```
/feature-name/
├── page.tsx               # Server component (data fetching, metadata)
└── components/            # Client components specific to this feature
```

---

## Design System

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#6366f1` (Indigo 500) | Buttons, links, active states |
| Secondary | `#8b5cf6` (Violet 500) | Accents, gradients |
| Background | `#0f172a` (Slate 900) | Dark mode base |
| Surface | `rgba(255,255,255,0.05)` | Glassmorphism cards |
| Success | `#22c55e` | Positive states, low urgency |
| Warning | `#f59e0b` | Moderate urgency |
| Danger | `#ef4444` | High urgency, errors |

### Typography

| Role | Font | Weight |
|------|------|--------|
| Headlines | Manrope | 600–800 |
| Body | Inter | 400–500 |
| Code/Data | Mono (system) | 400 |

### Animations

- **Page transitions:** Framer Motion `fadeIn` + `slideUp` (300ms ease-out)
- **Micro-interactions:** Scale on hover (1.02x), button press (0.98x)
- **Loading states:** Skeleton shimmer + pulse animations
- **Glassmorphism:** `backdrop-blur-xl` + semi-transparent backgrounds

---

## Data Flow

```
User Input
    │
    ▼
Client Component (React 19)
    │
    ▼
API Route Handler (Next.js Route Handler)
    │
    ▼
AI Agent Layer (provider abstraction)
    │
    ▼
External AI API (Claude / OpenAI / Gemini)
    │
    ▼
Structured Response (parsed & validated)
    │
    ▼
Client renders result with animations
```

---

## Key Design Decisions

1. **Multi-provider AI** — No vendor lock-in; switch providers by changing one env var
2. **App Router** — Full use of Next.js 16 App Router with server components for SEO and performance
3. **Streaming responses** — AI chat uses streaming for real-time token delivery
4. **Edge-ready** — API routes are compatible with edge runtime where possible
5. **Progressive enhancement** — Core features work without JavaScript; voice/animations enhance progressively
