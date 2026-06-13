# Sokoni — Peer-to-Peer Marketplace

Sokoni is a peer-to-peer marketplace prototype for Uganda and East Africa. Browse listings, negotiate offers, pay through a demo escrow flow, chat in real time, and build seller reputation with ratings.

## Stack

Next.js 14 · Supabase · Tailwind CSS · shadcn/ui · Cloudinary

## Setup

1. Clone and install:

```bash
git clone https://github.com/MuyanjaKevin/Sokoni-demo.git
cd sokoni-demo
npm install
```

2. Environment:

```bash
cp .env.example .env.local
```

Fill in Supabase and Cloudinary keys in `.env.local` (never commit this file).

3. Supabase (one-time):

- Run `SOKONI_DATABASE.sql` in the SQL Editor (or your project schema)
- Create a public Storage bucket named `listings`
- Enable Email auth provider
- Enable Realtime on the `messages` table

4. Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo login

- Phone: any Uganda number (`+256` + 9 digits)
- OTP: **`123456`**
- Payments are simulated (MTN MoMo UI is demo only)

## Main routes

| Route | Description |
|-------|-------------|
| `/` | Home feed |
| `/search` | Search and filters |
| `/listings/create` | Sell an item |
| `/login` | Phone OTP sign-in |
| `/profile/me` | Your profile, listings, purchases |
| `/profile/[id]` | Public seller profile |
| `/inbox` | Active transactions |
| `/transactions/[id]` | Payment and delivery |
| `/transactions/[id]/chat` | Real-time chat |
| `/ratings/[txId]` | Rate after a completed deal |

## Scripts

```bash
npm run dev    # development
npm run build  # production build
npm start      # run production build
npm run lint   # ESLint
```
