# AI Essentials: beginner guide

Editorial edition: 6 October 2026. 6 modules, 19 lessons, 66 interactive activities (including one optional reflection), and a ten-question final assessment. Suggested duration is about six hours including writing, checking answers, revision, and the capstone; this is an estimate, not six hours of video.

Content lives in `src/lib/ai-guide.ts` and `src/lib/seed.ts`. The guide progresses through understanding AI, using assistants, writing prompts, everyday work, responsible use, and a capstone. It uses fictional examples and does not require a paid external AI subscription. Rule-based practice remains available while optional live AI feedback is disabled.

Written practice uses an explicitly disclosed keyword checklist. It is not a semantic assessment or a guarantee of correctness. Multiple-choice feedback explains the reasoning. The final assessment uses ten objective activities, with an 80% pass mark. Learners must complete the preceding lessons; optional reflection does not affect the final pass mark.

## Editorial references

Definitions and limitations were checked against [IBM Research’s introduction to generative AI](https://research.ibm.com/blog/what-is-generative-AI?country=101) and the [NIST Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf). These support the distinction between generation and factual reliability, and the importance of managing privacy and bias. Lessons and fictional scenarios are original LibTech teaching material. Product-specific capabilities and data settings must be checked in the relevant product documentation when used.

## Publishing changes

`npm run seed` creates a missing course; it deliberately never overwrites an existing course. To update this introductory course before enrollment, run `npx tsx scripts/update-ai-course.ts CURRENT_REVISION` after reviewing changes. The transaction checks the current revision and refuses to replace a course with enrollments, progress, or certificates. It preserves the previous content in `courseRevisions` and retains the existing price and owner. For a course with learners, create a separate edition.
