# HMM ITB Learning & Community Platform

Full-stack learning and community platform for Himpunan Mahasiswa Mesin ITB.

**Live:** [hmmitb.com](https://hmmitb.com)

## Features

- Courses, resources, enrollment, and progress tracking
- Assessments with multiple question types, scoring, and history
- Events with RSVP and attendance flows
- Announcements, discussions, and rich-text content
- Dynamic forms for registration, surveys, and feedback
- Role-based admin tools
- PWA support and push notifications

## Stack

`Next.js 16` `React 19` `TypeScript` `tRPC` `PostgreSQL` `Prisma` `Auth.js` `Tailwind CSS` `TipTap` `Zod` `Vitest`

## Architecture

```text
Next.js / React PWA
        │
       tRPC
        │
 ┌──────┼─────────┐
 ▼      ▼         ▼
Auth   Services   Media
 │      │          │
 └──────┼──────────┘
        ▼
      Prisma
        │
        ▼
   PostgreSQL
```

## Development

```bash
git clone https://github.com/soezyxstt/hmm-lms.git
cd hmm-lms
npm install
cp .env.example .env
npm run db:push
npm run dev
```

Validation:

```bash
npm run typecheck
npm test
npm run build
```

Use development credentials only. Never commit secrets or environment files.

Built as an operational platform for the HMM ITB community. Primary development by [Adi Haditya Nursyam](https://github.com/soezyxstt), with contributions from the HMM ITB IT team.
