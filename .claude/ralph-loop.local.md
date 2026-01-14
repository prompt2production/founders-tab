---
active: true
iteration: 1
max_iterations: 50
completion_promise: "COMPLETE"
started_at: "2026-01-14T00:40:15Z"
---

You are working on this project.

  BEFORE EACH ITERATION:
  1. Read CLAUDE.md for project context
  2. Read DESIGN_SYSTEM.md for UI patterns
  3. Read features/expense-list-filtering/prd.json and find the first story with passes: false

  YOUR TASK:
  1. Implement the story following all acceptance criteria
  2. Run tests to verify:
     - npm run test (for unit tests)
     - npx playwright test (only for e2e stories)
  3. Fix any failures before proceeding

  WHEN STORY COMPLETE:
  1. Update features/expense-list-filtering/prd.json - set passes: true
  2. Append to features/expense-list-filtering/progress.txt
  3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

  WHEN ALL STORIES COMPLETE:
  Output <promise>COMPLETE</promise>
