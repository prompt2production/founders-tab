---
active: true
iteration: 1
max_iterations: 25
completion_promise: "COMPLETE"
started_at: "2026-01-14T09:25:43Z"
---

You are working on this project.

  BEFORE EACH ITERATION:
  1. Read CLAUDE.md for project context
  2. Read features/db-console/prd.json and find the first story with passes: false

  YOUR TASK:
  1. Implement the story following all acceptance criteria
  2. This is a console application - no unit tests or e2e tests required
  3. Verify the code compiles and runs

  WHEN STORY COMPLETE:
  1. Update features/db-console/prd.json - set passes: true
  2. Append to features/db-console/progress.txt with format:
     ---
     Story: [ID] [Title]
     Files changed: [list]
     Notes: [any learnings or issues]
     ---
  3. Commit: git add -A && git commit -m 'feat([ID]): [title]'

  WHEN ALL STORIES COMPLETE:
  Output <promise>COMPLETE</promise>

  If stuck after 3 attempts, document blockers and move to next story.
