import { z } from 'zod';
export const idSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const blockTypes = [
  'TEXT',
  'HEADING',
  'CALLOUT',
  'EXAMPLE',
  'IMAGE',
  'CODE',
  'PROMPT_EXAMPLE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'FILL_BLANK',
  'SHORT_ANSWER',
  'MATCHING',
  'ORDERING',
  'SCENARIO',
  'PRACTICE_EXERCISE',
  'AI_EXERCISE',
  'TIP',
  'WARNING',
  'SUMMARY',
  'CHECKPOINT',
] as const;
export const blockSchema = z.object({
  id: idSchema,
  type: z.enum(blockTypes),
  text: z.string().max(6000),
  options: z.array(z.string().max(500)).max(20).default([]),
  answer: z.string().max(2000).default(''),
  explanation: z.string().max(2000).default(''),
  rubric: z.array(z.string().max(250)).max(10).default([]),
  required: z.boolean().default(true),
});
export type Block = z.infer<typeof blockSchema>;
export const lessonSchema = z.object({
  id: idSchema,
  title: z.string().min(3).max(150),
  minutes: z.number().int().min(1).max(180),
  published: z.boolean(),
  final: z.boolean().default(false),
  blocks: z.array(blockSchema).min(1).max(40),
});
export type Lesson = z.infer<typeof lessonSchema>;
export const courseSchema = z.object({
  id: idSchema,
  slug: z.string().regex(/^[a-z0-9-]{3,80}$/),
  title: z.string().min(3).max(150),
  description: z.string().min(20).max(2000),
  category: z.string().min(2).max(60),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  priceCents: z.number().int().min(0).max(100000),
  duration: z.string().max(60),
  instructor: z.string().min(2).max(100),
  ownerId: idSchema,
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  order: z.number().int().min(0).max(10000),
  revision: z.number().int().min(0),
  thumbnail: z
    .string()
    .max(1000)
    .refine((v) => !v || /^https:\/\//.test(v), 'Use an HTTPS image URL.')
    .default(''),
  outcomes: z.array(z.string().max(200)).max(12),
  requirements: z.string().max(1000),
  passingPercent: z.number().int().min(50).max(100),
  modules: z
    .array(
      z.object({
        id: idSchema,
        title: z.string().min(2).max(150),
        lessons: z.array(lessonSchema).max(30),
      }),
    )
    .max(20),
});
export type Course = z.infer<typeof courseSchema>;
export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  suspended: boolean;
  createdAt: string;
  xp: number;
  streak: number;
  lastLearned: string;
  country: string;
  bio: string;
  photoURL: string;
  achievements: string[];
}
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  active: boolean;
  createdAt: string;
  source: string;
}
export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amountCents: number;
  currency: 'USD';
  method: 'MANUAL';
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reason?: string;
}
export interface Feedback {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  example: string;
  source: 'rules' | 'ai';
}
export interface Attempt {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  blockId: string;
  answer: string;
  feedback: Feedback;
  passed: boolean;
  createdAt: string;
}
export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  completed: string[];
  passedModules: string[];
  drafts: Record<string, string>;
  lastLessonId: string;
  updatedAt: string;
  certificateId?: string;
}
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  courseName: string;
  issuedAt: string;
  organization: string;
  revoked: boolean;
}
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  createdAt: string;
}
export interface Audit {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  createdAt: string;
}
export interface Settings {
  id: string;
  paymentInstructions: string;
  paymentsEnabled: boolean;
  aiDailyLimit: number;
  aiLessonLimit: number;
  lessonXP: number;
  exerciseXP: number;
  moduleXP: number;
  courseXP: number;
}
export const defaultSettings: Settings = {
  id: 'platform',
  paymentInstructions: '',
  paymentsEnabled: false,
  aiDailyLimit: 10,
  aiLessonLimit: 3,
  lessonXP: 20,
  exerciseXP: 10,
  moduleXP: 50,
  courseXP: 100,
};
export const lessons = (course: Course) =>
  course.modules.flatMap((m) => m.lessons.filter((l) => l.published));
export const isExercise = (b: Block) =>
  [
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'FILL_BLANK',
    'SHORT_ANSWER',
    'MATCHING',
    'ORDERING',
    'SCENARIO',
    'PRACTICE_EXERCISE',
    'AI_EXERCISE',
    'CHECKPOINT',
  ].includes(b.type);
export function canManage(user: User, course: Course) {
  return user.role === 'ADMIN' || (user.role === 'INSTRUCTOR' && course.ownerId === user.id);
}
export function canAccess(user: User, course: Course, enrollment: Enrollment | null) {
  return !user.suspended && (canManage(user, course) || !!enrollment?.active);
}
export function level(xp: number) {
  const names = [
    'AI Explorer',
    'AI Learner',
    'Prompt Builder',
    'AI Practitioner',
    'AI Professional',
  ];
  return {
    number: Math.min(5, Math.floor(xp / 250) + 1),
    name: names[Math.min(4, Math.floor(xp / 250))],
  };
}
export function nextStreak(last: string, streak: number, now: string) {
  const today = now.slice(0, 10);
  if (last === today) return streak;
  const yesterday = new Date(Date.parse(today) - 86400000).toISOString().slice(0, 10);
  return last === yesterday ? streak + 1 : 1;
}
export function grade(block: Block, answer: string): Feedback {
  const norm = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.!?]+$/g, '')
      .replace(/\s+/g, ' ');
  const accepted = block.answer.split('|').map(norm);
  const criteria = block.rubric.filter((r) => norm(answer).includes(norm(r)));
  const scored = ['AI_EXERCISE', 'PRACTICE_EXERCISE', 'SHORT_ANSWER', 'SCENARIO'].includes(
    block.type,
  );
  const score =
    scored && block.rubric.length
      ? Math.round((criteria.length / block.rubric.length) * 10)
      : accepted.includes(norm(answer))
        ? 10
        : 0;
  return {
    score,
    feedback: scored
      ? score >= 7
        ? 'Your response includes the practice terms. Compare its meaning with the example; this checklist does not assess factual accuracy or writing quality.'
        : 'Add the missing practice terms, then compare your reasoning with the example.'
      : (score >= 7 ? 'Correct. ' : 'Not quite. ') +
        (block.explanation || 'Review the example and try again.'),
    strengths: criteria.map((c) => 'Included: ' + c),
    improvements: score >= 7 ? [] : [block.explanation || 'Review the example and try again.'],
    example: block.answer,
    source: 'rules',
  };
}
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function ensure(condition: unknown, status: number, message: string): asserts condition {
  if (!condition) throw new AppError(status, message);
}
export function publicCourse(c: Course) {
  return {
    ...c,
    modules: c.modules.map((m) => ({
      ...m,
      lessons: m.lessons.filter((l) => l.published).map((l) => ({ ...l, blocks: [] })),
    })),
  };
}
export function learnerLesson(l: Lesson) {
  return {
    ...l,
    blocks: l.blocks.map((b) => ({
      ...b,
      answer: '',
      rubric: [],
      explanation: isExercise(b) ? '' : b.explanation,
    })),
  };
}
