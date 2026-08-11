# ViewTube - Premium YouTube-Powered Streaming Client

ViewTube is a modern, production-ready video streaming client built with Next.js 15, React, Tailwind CSS v4, and Shadcn UI. It uses the official YouTube Data API v3 and YouTube IFrame Player API to allow browsing, searching, and organizing YouTube content with an enterprise-grade local database layer for watch history, playlist organization, subscriptions, and favorites.

## 🚀 Key Features

* **Secure Authentication**: Official Google OAuth logging using Auth.js (NextAuth v5).
* **Trending & Dynamic Queries**: Browse trending categories by global regions.
* **Smart Search**: Search autocomplete matching channels, playlists, and video categories.
* **Premium Playback**: watch videos in a responsive, high-performance IFrame wrapper.
* **Custom User Library**: Create custom playlists, maintain watch logs, save watch-later queues, subscribe locally to channels, and mark favorites.
* **Premium UX System**: OKLCH colors, glassmorphism overlays, custom loading shimmers, and dark/light themes.
* **Docker Support**: Standalone production image packaging.
* **100% API Policy Compliant**: Access YouTube strictly via authorized APIs and embedded player bounds without bypassing advertisements or restriction policies.

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (App Router, Server Actions)
* **Styling**: Tailwind CSS v4, CSS-first design tokens
* **Components**: Shadcn UI, Lucide icons, Framer Motion
* **Database**: PostgreSQL 16
* **ORM**: Prisma Client
* **Auth**: Auth.js (NextAuth v5) Google OAuth Provider
* **Query Caching**: TanStack Query (React Query v5)

## 📋 Prerequisites

* **Node.js**: v20 or higher
* **PostgreSQL**: Local database or cloud provider
* **Google Cloud Console Project**:
  * Enable the **YouTube Data API v3**
  * Generate an **API Key**
  * Configure an **OAuth client ID (Web Application)** with callback: `http://localhost:3000/api/auth/callback/google`

## ⚙️ Environment Variables

Create a `.env.local` file at the root:

```env
# Database Connections
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/viewtube?schema=public"

# Auth configurations
AUTH_SECRET="generate-with-npx-auth-secret"
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# YouTube Access Key
YOUTUBE_API_KEY="your-google-youtube-v3-api-key"

# App Deployment URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🛠️ Quick Start (Local Development)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Start local dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) inside your browser.

## 🐳 Docker Deployment

1. **Launch stack (Database + stand-alone app)**:
   Ensure you set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `YOUTUBE_API_KEY` in your environment or compose parameters, then run:
   ```bash
   docker-compose up --build -d
   ```
   The application will boot at [http://localhost:3000](http://localhost:3000).

## 📄 License

This project is licensed under the MIT License.
