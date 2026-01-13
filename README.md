# Prompt2Production Starter

A production-ready Next.js boilerplate optimised for AI-driven development using the [Ralph Wiggum](https://ghuntley.com/ralph/) iterative workflow.

## What is Prompt2Production?

**Prompt2Production** is a methodology for building production-quality software using AI coding assistants. It bridges the gap between "vibe coding" and professional engineering by combining:

- **Structured AI workflows** — Repeatable patterns that produce consistent, high-quality output
- **Proper engineering discipline** — Testing, validation, design systems, and documentation
- **Iterative development** — Let AI agents build features autonomously while you sleep

This starter template embodies these principles, giving you a foundation where AI assistants can work effectively within defined constraints.

## What is Ralph Wiggum?

Ralph is an iterative AI development technique created by [Geoffrey Huntley](https://ghuntley.com/ralph/). At its core, it's simple:

```bash
while :; do cat PROMPT.md | claude; done
```

The AI agent picks up a task, implements it, tests it, commits — then picks up the next task. Repeat until done.

**Real-world results:**
- 6 repositories generated overnight at a Y Combinator hackathon
- $50k contract delivered for $297 in API costs
- Complete CRUD applications built in ~25 minutes

This starter is pre-configured for Ralph with `prd.json` (user stories), `progress.txt` (iteration log), and documentation that guides AI behaviour.

## What's Included

- **Next.js 15** — App Router, TypeScript, Tailwind CSS
- **PostgreSQL + Prisma** — Database with type-safe ORM
- **shadcn/ui** — Beautiful, accessible component library
- **Testing** — Vitest (unit) + Playwright (e2e) configured
- **AI-Ready Documentation:**
  - `CLAUDE.md` — Project context for AI assistants
  - `DESIGN_SYSTEM.md` — UI/UX patterns for consistent output
  - `prd.json` — User story template for Ralph workflow
- **Docker** — PostgreSQL infrastructure compose file

## Quick Start

### 1. Clone and Rename

```bash
git clone https://github.com/YOUR_USERNAME/prompt2production-starter.git my-project
cd my-project
rm -rf .git
git init
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialise shadcn/ui

```bash
npx shadcn@latest init
```

When prompted, select:
- **Style:** Default
- **Base color:** Slate
- **CSS variables:** Yes

(Components are installed on-demand by the AI agent as needed)

### 4. Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env with your database password
# Update values in both the variables AND the DATABASE_URL
```

### 5. Start Database

**Windows users:** Ensure Docker Desktop is running first.

```bash
docker-compose -f docker-compose.infrastructure.yml up -d
```

### 6. Run Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 7. Verify Setup

```bash
# Run tests
npm run test

# Start dev server
npm run dev
```

Open http://localhost:3000 — you should see the starter page.

## Using with Ralph

### 1. Plan Your Feature

Start Claude Code and use the trigger phrase:

```bash
claude
> "Plan feature: [describe what you want to build]"
```

Claude will create a feature folder with planning documents:

```
features/
└── your-feature/
    ├── PRD.md        # Requirements
    ├── prd.json      # User stories
    └── progress.txt  # For Ralph logs
```

### 2. Review Generated Files

Check `features/[your-feature]/` and adjust if needed.

### 3. Run Ralph

```bash
# Start Claude Code in YOLO mode
claude --dangerously-skip-permissions

# Install Ralph plugin (first time only)
/plugin install ralph-loop@claude-plugins-official

# Run the loop (replace [feature-name] with your folder name)
/ralph-loop:ralph-loop "You are working on this project.

BEFORE EACH ITERATION:
1. Read CLAUDE.md for project context
2. Read DESIGN_SYSTEM.md for UI patterns
3. Read features/[feature-name]/prd.json and find the first story with passes: false

YOUR TASK:
1. Implement the story following all acceptance criteria
2. Run tests to verify (npm run test for unit, npx playwright test for e2e)
3. Fix any failures before proceeding

WHEN STORY COMPLETE:
1. Update features/[feature-name]/prd.json - set passes: true
2. Append to features/[feature-name]/progress.txt
3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

WHEN ALL STORIES COMPLETE:
Output <promise>COMPLETE</promise>

If stuck after 3 attempts, document blockers and move to next story." --max-iterations 25 --completion-promise COMPLETE
```

### 4. Monitor Progress

- Watch Claude Code output in real-time
- Check `features/[feature-name]/progress.txt` for iteration logs
- Use `/cancel-ralph` to stop if needed

## Project Structure

```
├── features/                 # Feature planning folders
│   └── [feature-name]/
│       ├── PRD.md            # Product requirements
│       ├── prd.json          # User stories for Ralph
│       └── progress.txt      # Ralph iteration log
├── prisma/
│   └── schema.prisma         # Database schema (customise this)
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── ui/               # shadcn components (don't modify)
│   │   └── [feature]/        # Your feature components
│   └── lib/
│       ├── prisma.ts         # Prisma client singleton
│       └── validations/      # Zod schemas
├── tests/
│   ├── unit/                 # Vitest tests
│   └── e2e/                  # Playwright tests
├── CLAUDE.md                 # AI project context
├── DESIGN_SYSTEM.md          # UI/UX patterns
└── GETTING_STARTED.md        # How to build features
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

## Customisation Checklist

When starting a new project:

- [ ] Update `package.json` name and description
- [ ] Update database name in `docker-compose.infrastructure.yml`
- [ ] Update database credentials in `.env`
- [ ] Update `prisma/schema.prisma` with your models
- [ ] Update `CLAUDE.md` with project-specific context
- [ ] Customise `DESIGN_SYSTEM.md` colours/branding if needed
- [ ] Write your `PRD.md` and `prd.json`
- [ ] Update the home page (`src/app/page.tsx`)

## Design System

The included design system uses:
- **Primary:** Indigo
- **Neutral:** Slate
- **Success:** Emerald
- **Warning:** Amber
- **Danger:** Rose

See `DESIGN_SYSTEM.md` for full component patterns and usage guidelines.

## Requirements

- Node.js 18+
- Docker (for PostgreSQL)
- Claude Code with Ralph plugin

## Learn More

- [Prompt2Production](https://prompt2production.com) — AI-driven development methodology
- [Ralph Wiggum Technique](https://ghuntley.com/ralph/) — Original concept by Geoffrey Huntley
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Prisma](https://www.prisma.io/) — Database ORM

## License

MIT — Use freely for your own projects.

---

Built with the [Prompt2Production](https://prompt2production.com) methodology.
