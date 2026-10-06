# 💍 ForeverVows — Luxury Digital Wedding Invitation Platform

A modern, high-converting SaaS platform for creating, customizing, and sharing digital wedding invitations with live preview, background music, RSVP management, and real-time analytics.

---

## ✨ Features

- **Luxury Aesthetics & Typography**: Built with Cormorant Garamond serif headings, warm gold & ivory tones, smooth glassmorphism, and Framer Motion micro-animations.
- **Template Marketplace**: 4 curated wedding themes (*Royal Gold*, *Modern Minimalist*, *Vintage Romance*, *Garden Bloom*) with instant preview and cloning.
- **Live Interactive Studio**:
  - **Couple Details**: Names, date, time, venue address, and Google Maps integration.
  - **Love Story Timeline**: Editable narrative with rich formatting.
  - **Schedule / Events**: Multi-event itinerary (Ceremony, Reception, Sangeet, Afterparty) with date, time, and location pins.
  - **Photo Gallery**: Drag-and-drop image uploads directly to Supabase Storage with cover selection.
  - **Background Music**: Upload audio files or choose royalty-free presets with play/pause controls.
  - **Palette & Font Customizer**: Real-time theme styling with instant preview.
- **Unique Shareable URLs**: Slug generation (`/w/groom-and-bride`) with dynamic OpenGraph cards and view tracking.
- **Digital RSVP System**: Guests RSVP with meal/attendance choices, guest counts, and personal congratulations notes.
- **Host Dashboard & Analytics**:
  - Total view counter and guest RSVP counts.
  - RSVP table with status badges and attendee export.
  - Audio play tracking and traffic metrics.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict type checking)
- **Styling**: Tailwind CSS & Vanilla CSS Design System
- **Animations**: Framer Motion
- **Database & Auth**: Supabase PostgreSQL & Supabase SSR
- **Storage**: Supabase Storage (`wedding-photos`, `wedding-music`)
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form & Zod

---

## 🚀 Getting Started

### 1. Prerequisites & Environment Variables

Copy `.env.example` to `.env.local` and provide your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

Execute the provided SQL schema in your Supabase SQL Editor:

```bash
# File: supabase-schema.sql
```

This creates:
- `profiles`, `templates`, `weddings`, `events`, `gallery`, `music`, `rsvps`, and `analytics` tables.
- Row Level Security (RLS) policies for secure multi-tenant isolation.
- Automatic view counter stored procedures.
- Storage buckets for photos and music.

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the landing page.

---

## 📂 Project Structure

```
forever-vows/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, Register, Forgot Password
│   │   ├── dashboard/          # User Dashboard, RSVPs, Analytics
│   │   ├── editor/[id]/        # Wedding Invitation Studio
│   │   ├── templates/          # Template Marketplace
│   │   ├── w/[slug]/           # Public Wedding Invitation Route
│   │   ├── globals.css         # Typography, Colors, Glassmorphism
│   │   ├── layout.tsx          # Root Layout
│   │   └── page.tsx            # High-conversion Landing Page
│   ├── components/
│   │   ├── dashboard/          # Dashboard cards & charts
│   │   ├── editor/             # Live Editor & sidebar panels
│   │   ├── landing/            # Hero, Features, FAQ, Pricing
│   │   ├── rsvp/               # Digital RSVP Modal & Form
│   │   └── wedding/            # Published Wedding Page & Music Player
│   ├── lib/
│   │   └── supabase/           # Server, Client & Middleware SSR helpers
│   └── types/                  # Typed Database & Wedding interfaces
├── supabase-schema.sql         # Complete PostgreSQL schema & RLS rules
└── tailwind.config.ts          # Brand palette & typography configuration
```
