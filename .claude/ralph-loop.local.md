---
active: true
iteration: 1
max_iterations: 10
completion_promise: "COMPLETE"
started_at: "2026-01-14T09:57:43Z"
---

You are working on this project.

  BEFORE EACH ITERATION:
  1. Read CLAUDE.md for project context
  2. Read DESIGN_SYSTEM.md for UI patterns
  3. Read features/db-console-seed-refactor/prd.json and find the first story with passes: false

  YOUR TASK:
  1. Implement the story following all acceptance criteria
  2. Run tests to verify:
     - npm run test (for unit tests)
  3. Fix any failures before proceeding

  WHEN STORY COMPLETE:
  1. Update features/dev-quick-login/prd.json - set passes: true
  2. Append to features/dev-quick-login/progress.txt with format:
     ---
     Story: [ID] [Title]
     Files changed: [list]
     Notes: [any learnings or issues]
     ---
  3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

  WHEN ALL STORIES COMPLETE:
  Output <promise>COMPLETE</promise>

  If stuck after 3 attempts, document blockers and move to next story.
