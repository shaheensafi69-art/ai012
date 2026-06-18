# SAFI AI — Neural Workspace

SAFI AI is a full-stack AI workspace built on Next.js and Supabase, offering chat, code generation, image synthesis, and cinematic video creation through a unified credits-based platform.

Live at: [safiai.site](https://www.safiai.site)

---

## ✨ Features

- **Neural Chat** — Conversational assistant with text, vision (image understanding), and web search support
- **Code Engine** — A dedicated AI coding assistant for architecture, debugging, and full-stack development help
- **Image Studio** — Text-to-image and image-to-image generation with reference-image support
- **Cinematic Video Studio** — Text-to-video and image-to-video generation with configurable aspect ratio, resolution, and duration
- **Voice (Beta)** — Real-time voice assistant powered by ephemeral session tokens
- **Credits & Subscriptions** — Flexible plan-based access (Free / Basic / Creator / Pro) with per-feature usage limits
- **Multiple Payment Methods** — Stripe, HesabPay, and AtomaPay checkout flows

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Backend / Database | Supabase (PostgreSQL + Auth) |
| AI Provider | xAI (Grok models — chat, vision, image, video, voice) |
| Payments | Stripe, HesabPay, AtomaPay |
| Notifications | Telegram Bot API |
| Hosting | Vercel |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/generate/
│   │   │   ├── chat/        → Text + vision chat endpoint
│   │   │   ├── code/        → Code Engine endpoint
│   │   │   ├── image/       → Image generation endpoint
│   │   │   ├── video/       → Video generation endpoint
│   │   │   ├── voice/token/ → Real-time voice session tokens
│   │   │   └── status/      → Async job polling (video tasks)
│   │   └── checkout/        → Payment provider integrations
│   ├── dashboard/
│   │   ├── chat/            → Neural Chat UI
│   │   ├── code-engine/     → Code Engine UI
│   │   ├── video/           → Video Studio UI
│   │   └── profile/         → Account, billing, and usage
│   ├── pricing/             → Public pricing page
│   └── terms/                → Legal pages
├── lib/                      → Shared utilities (Supabase client, Telegram, etc.)
```

---

## 🔑 Environment Variables

This project requires the following environment variables. **Never commit real values to source control** — use a local `.env.local` file (already gitignored) or your hosting provider's secret manager.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-only — never expose to the client

# AI Provider
XAI_API_KEY=                      # Server-only — never expose to the client

# App
NEXT_PUBLIC_BASE_URL=

# Notifications
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Payments (add as integrated)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` and `XAI_API_KEY` grant full administrative or billing-level access. They must only ever be read in server-side API routes (`src/app/api/**`) — never in client components or anything prefixed with `NEXT_PUBLIC_`.

---

## 🗄 Database Overview (Supabase)

| Table | Purpose |
|---|---|
| `profiles` | User credit balance, plan, video quota |
| `plans` | Subscription tier definitions (price, limits) |
| `ai_pricing` | Per-model cost configuration (credits per token/image/audio) |
| `ai_generations` | Log of every AI generation request |
| `chat_sessions` / `chat_messages` | Chat history |
| `code_sessions` / `code_messages` | Code Engine history |
| `orders` | Payment and checkout records |

---

## 🚀 Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The app auto-reloads as you edit files under `src/app`.

Before running locally, copy `.env.example` to `.env.local` and fill in your own development credentials (Supabase project + xAI API key).

---

## ☁️ Deployment

This project is configured for deployment on [Vercel](https://vercel.com). Push to your connected branch, and ensure all environment variables above are set in your Vercel project settings (not committed to the repo).

---

## 🔒 Security Notes

- All AI provider calls happen server-side only — the frontend never holds or sends the `XAI_API_KEY`.
- Credit/quota checks happen **before** any AI provider call, preventing free or unauthorized usage.
- Row-level access to user data is enforced through Supabase Auth + the service role key on trusted server routes only.
---

© Safi International Capital LTD. All rights reserved.
