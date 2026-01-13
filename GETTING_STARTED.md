# Getting Started: Building Your First Feature

This guide shows you how to build features using the Prompt2Production workflow. 

## The Four-Phase Workflow

| Phase | You Do | Claude Does |
|-------|--------|-------------|
| **0. Project** | Say "Project:" + what you're building | Updates CLAUDE.md with project context |
| **1. Design** | Say "Design system:" + style preferences | Updates DESIGN_SYSTEM.md, globals.css, creates `/design` page |
| **2. Planning** | Say "Plan feature:" + description | Creates `features/[name]/` folder with PRD.md, prd.json |
| **3. Building** | Run the Ralph command | Implements all user stories autonomously |

---

## Phase 0: Project Brief (One-Time)

Before designing or building, give Claude context about what you're creating.

### Start Claude Code

```bash
claude
```

### Describe Your Project

Use the trigger phrase **"Project:"** followed by a brief description:

**Example prompts:**

> "Project: A recipe management app for home cooks. Users can save their favourite recipes, organise them by category, and quickly find what to cook for dinner. Target audience is everyday people who want to digitise their recipe collection."

> "Project: Internal sales CRM for our team of 10. Track leads, log customer interactions, and see pipeline status. Needs to be fast and no-nonsense."

> "Project: Personal finance tracker. Users log expenses, set monthly budgets, and see where their money goes. Simple and private - no bank connections."

### What Claude Does

Updates `CLAUDE.md` with:
- Project name
- Brief description  
- Target audience
- Key goals

This context informs all subsequent design and feature decisions.

---

## Phase 1: Design System (One-Time)

Now establish your app's look and feel, informed by the project context.

### Describe Your Design

Use the trigger phrase **"Design system:"** followed by your style preferences. Optionally attach an inspiration image.

**Example prompts:**

> "Design system: warm and inviting, like a home cooking blog. Orange/amber primary colour, cream backgrounds, cards with subtle shadows. Top navigation."

> "Design system: clean and professional. Blues and grays, minimal design, data-focused. Sidebar navigation."

> "Design system: [attach Dribbble screenshot] Something like this - modern, lots of whitespace, rounded corners."

### What Claude Generates

1. **Updates `DESIGN_SYSTEM.md`** — Colours, typography, spacing, component patterns
2. **Updates `src/app/globals.css`** — CSS variables for the colour palette  
3. **Creates `src/app/design/page.tsx`** — Visual reference showing all components

### Review the Design

```bash
npm run dev
# Open http://localhost:3000/design
```

### Iterate if Needed

Refine conversationally:

- "Make the primary colour more muted"
- "Try a darker background"
- "I want sharper corners, less rounded"

### Confirm and Move On

When happy:

> "Design looks good, let's move on"

---

## Phase 2: Planning Features

Now plan your first feature.

### Use the Trigger Phrase

**"Plan feature:"** followed by your description:

**Example prompts:**

> "Plan feature: recipe management. Users can create recipes with a title, description, ingredients list, instructions, prep time and cook time. Show recipes in a card grid on the home page. Click a recipe to see full details. Allow editing and deleting."

> "Plan feature: contact form with name, email, subject and message. Validate all fields, save to database, show success toast."

### What Claude Generates

```
features/
└── recipe-crud/
    ├── PRD.md           # Detailed requirements
    ├── prd.json         # User stories for Ralph
    └── progress.txt     # Empty, ready for logs
```

### Review Before Building

Check the files make sense, adjust if needed.

---

## Phase 3: Building with Ralph

Let Ralph build the feature autonomously.

### Start YOLO Mode

```bash
claude --dangerously-skip-permissions
```

### Install Ralph Plugin (First Time)

```
/plugin install ralph-loop@claude-plugins-official
```

### Run Ralph

Replace `[feature-name]` with your folder name (e.g., `recipe-crud`):

```
/ralph-loop:ralph-loop "You are working on this project.

BEFORE EACH ITERATION:
1. Read CLAUDE.md for project context
2. Read DESIGN_SYSTEM.md for UI patterns
3. Read features/[feature-name]/prd.json and find the first story with passes: false

YOUR TASK:
1. Implement the story following all acceptance criteria
2. Run tests to verify:
   - npm run test (for unit tests)
   - npx playwright test (only for e2e stories)
3. Fix any failures before proceeding

WHEN STORY COMPLETE:
1. Update features/[feature-name]/prd.json - set passes: true
2. Append to features/[feature-name]/progress.txt with format:
   ---
   Story: [ID] [Title]
   Files changed: [list]
   Notes: [any learnings or issues]
   ---
3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

WHEN ALL STORIES COMPLETE:
Output <promise>COMPLETE</promise>

If stuck after 3 attempts, document blockers and move to next story." --max-iterations 25 --completion-promise COMPLETE
```

### Monitor & Stop

- Watch terminal for progress
- Check `features/[name]/progress.txt` for logs
- Use `/cancel-ralph` to stop

---

## Review & Repeat

After Ralph completes:

```bash
npm run test
npx playwright test
npm run dev  # Manual testing
```

For more features, repeat Phase 2 & 3 (skip Project and Design phases).

---

## Quick Reference

### Phase 0: Project (One-Time)
```bash
claude
> "Project: [what you're building and who it's for]"
```

### Phase 1: Design (One-Time)
```bash
> "Design system: [style preferences or attach image]"
# Review http://localhost:3000/design
# Iterate if needed
> "Design looks good"
```

### Phase 2: Planning (Per Feature)
```bash
> "Plan feature: [description]"
# Review features/[name]/ files
```

### Phase 3: Building (Per Feature)
```bash
claude --dangerously-skip-permissions
/ralph-loop:ralph-loop "..." --max-iterations 25 --completion-promise COMPLETE
```

---

## Tips

### Project Brief
- Keep it short — 2-3 sentences is enough
- Mention the target user
- Don't detail features yet, just the overall purpose

### Design Phase
- Attach inspiration images when possible
- Get colours and layout right before building
- The `/design` page is your reference

### Story Count
- Simple feature: 5-10 stories
- Medium feature: 10-20 stories
- Complex feature: 20-30 stories

---

## Next Steps

1. `claude`
2. "Project: [brief description]"
3. "Design system: [style preferences]"
4. Review `/design`, iterate
5. "Plan feature: [first feature]"
6. Run Ralph
7. Test and ship

You're ready to build! 🚀
