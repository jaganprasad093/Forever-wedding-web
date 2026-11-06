# 💍 Wedora — Luxury Digital Wedding Invitation Platform

A modern, full-featured SaaS platform for couples to design, personalize, and share interactive digital wedding invitations. Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, Framer Motion, and Supabase.

---

## 🌟 Overview

**Wedora** transforms traditional wedding cards into immersive digital celebration experiences. Couples can choose from 9 artisanal templates, customize schedules, photo galleries, background soundtracks, and love stories in a real-time multi-device editor, share their invites via WhatsApp with branded QR codes, and manage RSVPs and analytics directly from a personal host dashboard.

---

## ✨ Core Features

### 🎨 9 Handcrafted Designer Templates
Curated aesthetic themes designed for cultural traditions, modern minimalist ceremonies, and opulent luxury celebrations:

| Template | Category | Aesthetic & Highlights |
| :--- | :--- | :--- |
| **Kerala Traditional** | Traditional / Kerala | Kasavu gold borders, temple brass tones, traditional melam vibes, and cultural auspiciousness. |
| **Royal Gold** | Royal / Luxury | Dark cinematic velvet, burnished gold foils, royal darbar ornaments, and majestic typography. |
| **Minimal White** | Modern / Minimal | Editorial typography, clean lines, crop marks, generous whitespace, and modern elegance. |
| **Floral Romantic** | Romantic / Floral | Soft blush pastels, watercolor botanical blooms, heart dividers, and dreamy serif lettering. |
| **Celestial Starlight**| Luxury / Cosmic | Midnight indigo, interactive moon phase, constellation glows, and animated shooting stars. |
| **Sunset Boho** | Boho / Modern | Warm terracotta, desert sand, swaying pampas grass, and wax-sealed save-the-date envelopes. |
| **Vintage Botanical** | Botanical / Rustic | Antique parchment, eucalyptus leaves, herbarium plates, and vintage pocket watch countdown. |
| **Rajputana Palace** | Royal / Heritage | Regal ruby velvet, marigold flower showers, Jharokha window reveals, and palace grandeur. |
| **Ocean Breeze** | Seaside / Elegant | Coastal aquamarine, animated sea waves, shimmering pearl bubbles, and message-in-a-bottle reveals. |

---

### 🛠️ Interactive Wedding Studio (Editor)
- **Real-Time Multi-Device Preview**: Seamlessly toggle between Mobile (390px), Tablet (820px), and Full-Width Desktop frames without leaving the editor.
- **Couple Details**: Couple names, wedding date, ceremony time, venue name, address, and interactive Google Maps link.
- **Love Story Narrative**: Rich editorial storytelling section honoring the couple's journey.
- **Multi-Event Timeline**: Schedule multi-day celebrations (Haldi, Mehendi, Sangeet, Ceremony, Reception, Afterparty) with custom timestamps, venues, and order indexing.
- **Photo Gallery Manager**: Drag-and-drop photo uploads directly to Supabase Storage with instant cover-photo designation and reordering.
- **Background Music Player**: Upload custom audio tracks or select curated presets with persistent floating player controls (rotating vinyl animation, play/pause, mute).
- **Theme & Palette Customizer**: Real-time palette presets (*Rose*, *Wine*, *Gold*, *Ivory*, *Sage*, *Terracotta*, *Midnight*), custom hex color pickers, and typography font selection.
- **Debounced Auto-Save**: Seamless background synchronization with visual status indicators (`Saving…`, `Saved`, `Error`).
- **Publish / Unpublish Controls**: One-click publishing with automated slug generation (`/w/groom-and-bride`) and conflict resolution.

---

### 💌 Social Sharing & QR Code Suite
- **Interactive Share Modal**: Teleported directly to the document root for a distraction-free experience across desktop and mobile.
- **Personalized Message Customizer**:
  - Live editable textarea to craft personalized invitation messages.
  - 4 one-tap presets: **✨ Classic**, **💍 Formal**, **🥂 Casual**, and **💌 Short**.
  - Automatic invitation link attachment and live character counter.
- **1-Tap Social Integrations**:
  - **WhatsApp**: Pre-fills the chat with your personalized message and link.
  - **Telegram**: Instant channel and chat sharing.
  - **Copy Message with Link**: Copies formatted invitation text with link for iMessage, SMS, or WhatsApp Web.
  - **Social Platforms**: Facebook, X (Twitter), and Instagram (with story/bio clipboard helpers).
  - **Native System Share Sheet**: Leverages `navigator.share` on mobile devices for AirDrop and native messenger sharing.
- **Branded QR Code Generator**:
  - High-res QR code with Level H error correction for reliable scanning.
  - Instant **Download PNG** button for printing on physical invitation cards, welcome boards, and save-the-dates.

---

### 📋 RSVP Management System
- **Guest RSVP Form**: Guests can submit attendance status, number of attendees, phone number, and personalized congratulatory notes.
- **Optional RSVP Toggle**: Hosts can toggle the RSVP section **ON** or **OFF** per invitation directly in the editor. All 9 templates adapt dynamically.
- **Host RSVP Dashboard (`/dashboard/rsvp`)**:
  - Key metric tiles: Total Responses, Attending Guests, Declined Guests, and Attendance Rate.
  - Searchable and filterable guest list with attendance status tags, timestamps, and guest counts.

---

### 📊 Real-Time Analytics Dashboard (`/dashboard/analytics`)
- **Traffic Tracking**: Total page views powered by database RPC procedures and analytics logging.
- **Engagement Insights**: Background music plays and RSVP submission conversion rates.
- **Visual Breakdown**: Interactive attendance charts and engagement metrics.

---

### 🔐 Authentication & Security
- **Supabase SSR Auth**: Secure authentication with server-side cookie sessions.
- **Authentication Flows**: Email and password registration, email verification links, password reset, and Google OAuth Single Sign-On (PKCE flow).
- **Proxy Middleware Session Protection**: Route guards protecting `/dashboard`, `/editor`, `/preview`, and `/create`.
- **Row-Level Security (RLS)**: PostgreSQL policies ensuring users can only read, edit, or delete their own wedding assets.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.3.8](https://nextjs.org/) (App Router, Turbopack, Proxy Middleware)
- **UI Library**: [React 19.2.8](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Motion & Animations**: [Framer Motion 14](https://www.framer.com/motion/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Supabase SSR, Row-Level Security)
- **File Storage**: Supabase Storage (`wedding-photos`, `wedding-music`)
- **QR Code Generation**: [qrcode](https://www.npmjs.com/package/qrcode)
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Utilities**: [date-fns](https://date-fns.org/)

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Supabase](https://supabase.com/) project

---

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Site URL (Use http://localhost:3000 for local development, production domain in deployment)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### 3. Supabase Database & Auth Setup

#### A. Database Schema
Execute [`supabase-schema.sql`](./supabase-schema.sql) in your **Supabase Dashboard > SQL Editor**. This creates:
- Tables: `profiles`, `weddings`, `events`, `gallery`, `music`, `rsvps`, `analytics`, and `templates`.
- Storage buckets: `wedding-photos` and `wedding-music` with public access policies.
- Database RPC functions like `increment_views`.
- Row-Level Security (RLS) rules restricting CRUD access to the resource owner.

#### B. Auth URL Configuration (Google OAuth & Redirects)
In **Supabase Dashboard > Authentication > URL Configuration**:
1. Set **Site URL**: `http://localhost:3000` (or `https://your-production-domain.com`)
2. Add to **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/**`
   - `https://your-production-domain.com/auth/callback`

---

### 4. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
wedora/
├── public/                     # Static assets, template thumbnails, audio presets
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication routes
│   │   │   ├── login/          # Email/Password + Google OAuth login
│   │   │   ├── register/       # New user onboarding
│   │   │   └── forgot-password/# Password recovery flow
│   │   ├── auth/callback/      # OAuth & email verification callback handler
│   │   ├── create/             # Template cloning & invitation initialization
│   │   ├── dashboard/          # User management area
│   │   │   ├── analytics/      # Traffic and engagement metrics
│   │   │   ├── profile/        # Account & profile management
│   │   │   ├── rsvp/           # Guest RSVP responses table & stats
│   │   │   └── page.tsx        # Invitations manager & quick actions
│   │   ├── editor/[id]/        # Studio editor route
│   │   ├── preview/[id]/       # Fullscreen invitation preview
│   │   ├── templates/          # Template showcase & category browsing
│   │   ├── w/[slug]/           # Public live wedding invitation route
│   │   ├── globals.css         # Tailwind v4 directives & typography styles
│   │   ├── layout.tsx          # Root HTML shell & fonts
│   │   └── page.tsx            # Marketing landing page
│   ├── components/
│   │   ├── dashboard/          # Cards, stats, and ShareModal
│   │   ├── editor/             # Live studio layout & settings panels
│   │   │   └── panels/         # Couple, Story, Events, Gallery, Music, Theme panels
│   │   ├── landing/            # Hero, Features, Showcase, FAQ, Nav & Footer
│   │   ├── rsvp/               # Interactive RSVP modal & form
│   │   └── wedding/            # 9 template engines & floating music player
│   ├── data/
│   │   └── templates.ts        # Catalog of 9 templates, themes & metadata
│   ├── lib/
│   │   ├── supabase/           # Client, Server, and Proxy session utilities
│   │   └── utils.ts            # Formatting, slugs, date countdown & URL helpers
│   ├── services/
│   │   └── auth.service.ts     # Client auth services & OAuth methods
│   ├── types/
│   │   ├── supabase.ts         # Generated PostgreSQL database types
│   │   └── wedding.ts          # Core application domain interfaces
│   └── proxy.ts                # Next.js 16 route proxy & auth session guards
├── supabase-schema.sql         # Complete PostgreSQL schema, functions & RLS policies
└── package.json                # Project dependencies and npm scripts
```

---

## 📦 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server with Turbopack. |
| `npm run build` | Compiles an optimized production build. |
| `npm run start` | Boots the compiled Next.js production server. |
| `npm run lint` | Runs ESLint across all TypeScript and React files. |

---

## 📄 License

Private and proprietary. Developed for **Wedora**. All rights reserved.
