# HMM ITB Learning & Community Platform

A full-stack learning and community platform for **Himpunan Mahasiswa Mesin (HMM) Institut Teknologi Bandung**.

The application combines learning management, assessments, events, announcements, forms, administrative workflows, analytics, and PWA features in one production-oriented system.

**Live:** [hmmitb.com](https://hmmitb.com)

## What the platform includes

- Course management, learning resources, enrollment, and progress tracking
- Practice assessments with multiple question types, scoring, explanations, and history
- Event management with RSVP and attendance workflows
- Announcements, discussions, and rich-text content
- Dynamic forms for surveys, registration, and feedback
- Role-based administration for students, admins, and superadmins
- Resource library, job and scholarship information, and link-shortening tools
- Progressive Web App support and web push notifications

## Tech stack

- **Next.js 15** + React + TypeScript
- **tRPC** for end-to-end typed APIs
- **PostgreSQL** + **Prisma**
- **NextAuth.js** for authentication
- **Tailwind CSS** + shadcn/ui
- **TipTap** for rich-text editing
- **React Hook Form** + **Zod**
- **AWS S3** for object storage
- **Bun** for development tooling

## Engineering highlights

### Typed full-stack architecture
The frontend and backend share typed contracts through tRPC, reducing duplicated API models and making feature changes easier to propagate safely across the application.

### Multi-domain product design
The system is not limited to courses. Academic content, assessments, events, announcements, forms, administration, and community information live in one application with shared authentication and role-based access control.

### Assessment workflows
The assessment system supports multiple-choice, short-answer, and essay-style questions, with scoring, explanations, media support, and student performance history.

### Event and form infrastructure
Events can operate as simple listings, RSVP flows, attendance-tracked activities, or a combination of both. Dynamic forms provide reusable registration, survey, and feedback workflows.

### Mobile-first PWA experience
The application is designed to behave as an installable mobile experience with service-worker support and push notifications for important updates.

## High-level architecture

```text
                       ┌─────────────────┐
                       │   Next.js App   │
                       │  React / PWA    │
                       └────────┬────────┘
                                │
                              tRPC
                                │
                 ┌──────────────┼──────────────┐
                 ▼              ▼              ▼
          Authentication    Application     File / Media
            NextAuth          Services         Storage
                 │              │                │
                 └──────┬───────┘              S3
                        ▼
                 Prisma ORM
                        │
                        ▼
                   PostgreSQL
```

## Local development

```bash
git clone https://github.com/soezyxstt/hmm-lms.git
cd hmm-lms
bun install
cp .env.example .env
bun run db:generate
bun run db:push
bun run dev
```

Use local or development credentials only. Never commit `.env` files, database credentials, storage secrets, or private keys.

## Project structure

```text
src/
├── app/          # Next.js routes and layouts
├── components/   # Product and UI components
├── server/       # tRPC, auth, and backend logic
├── lib/          # Shared utilities
├── hooks/        # Reusable client hooks
└── styles/       # Application styling

prisma/
├── schema.prisma
└── migrations/
```

## Project context

Built for the HMM ITB community as a real operational platform rather than a tutorial or demo application.

Primary development by [Adi Haditya Nursyam](https://github.com/soezyxstt), with contributions from the HMM ITB information-technology team.
