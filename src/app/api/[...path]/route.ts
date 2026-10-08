import { enrollFree } from '@/server/enrollment';
import { NextResponse } from 'next/server';
import { aiFeedbackEnabled, profilePhotosEnabled } from '@/server/features';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { body, failure } from '@/server/http';
import { currentUser, requireUser, establishSession } from '@/server/auth';
import { store, configured } from '@/server/store';
import { catalog } from '@/server/catalog';
import { access, saveDraft, submitAnswer, completeLesson, reserveAI, key } from '@/server/learning';
import { manualProvider, reviewPayment } from '@/server/payments';
import {
  saveCourse,
  saveSettings,
  manageUser,
  revokeCertificate,
  studentDetail,
} from '@/server/admin';
import { openAIProvider } from '@/server/ai';
import { analytics } from '@/server/analytics';
import { rateLimit } from '@/server/rate-limit';
import {
  ensure,
  idSchema,
  defaultSettings,
  lessons,
  learnerLesson,
  publicCourse,
  type User,
  type Course,
  type Progress,
  type Enrollment,
  type Payment,
  type Notification,
  type Certificate,
  type Settings,
} from '@/lib/domain';
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ path: string[] }> };
const exercise = z.object({
  courseId: idSchema,
  lessonId: idSchema,
  blockId: idSchema,
  answer: z.string().min(1).max(3000),
});
const response = (data: unknown) =>
  NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
export async function GET(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join('/');
    const url = new URL(request.url);
    if (path === 'config') return response({ configured: configured() });
    if (path === 'catalog') return response(await catalog());
    if (path === 'me') return response({ user: await currentUser() });
    if (path === 'settings/public') {
      return response({
        paymentInstructions: '',
        paymentsEnabled: false,
      });
    }
    if (path.startsWith('certificate/')) {
      const id = idSchema.parse(path.split('/')[1]);
      const c = configured() ? await store().get<Certificate>('certificates', id) : null;
      ensure(c && !c.revoked, 404, 'Certificate not found or no longer valid.');
      return response({
        id: c.id,
        studentName: c.studentName,
        courseName: c.courseName,
        issuedAt: c.issuedAt,
        organization: c.organization,
      });
    }
    const user = await requireUser();
    const db = store();
    if (path === 'admin/analytics') {
      ensure(user.role === 'ADMIN', 403, 'Administrator access required.');
      return response(await analytics());
    }
    if (path === 'dashboard') {
      const filter = { field: 'userId', value: user.id };
      const [enrollments, progress, payments, notifications, certificates] = await Promise.all([
        db.list<Enrollment>('enrollments', filter),
        db.list<Progress>('progress', filter),
        db.list<Payment>('payments', filter),
        db.list<Notification>('notifications', filter),
        db.list<Certificate>('certificates', filter),
      ]);
      const courses = (
        await Promise.all(
          enrollments.filter((e) => e.active).map((e) => db.get<Course>('courses', e.courseId)),
        )
      )
        .filter((c): c is Course => !!c)
        .map(publicCourse);
      return response({
        user,
        enrollments,
        profilePhotosEnabled: profilePhotosEnabled(),
        progress,
        payments,
        notifications: notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        certificates,
        courses,
      });
    }
    if (path === 'learn') {
      const courseId = idSchema.parse(url.searchParams.get('course'));
      const { course } = await access(db, user, courseId);
      const requested = url.searchParams.get('lesson');
      const progress = await db.get<Progress>('progress', key(user.id, courseId));
      const lesson =
        lessons(course).find((l) => l.id === (requested || progress?.lastLessonId)) ??
        lessons(course)[0];
      ensure(lesson, 404, 'No lesson is available.');
      return response({
        course: publicCourse(course),
        lesson: learnerLesson(lesson),
        aiEnabled: aiFeedbackEnabled(),
        progress,
        user,
      });
    }
    if (path === 'admin/course') {
      ensure(user.role !== 'STUDENT', 403, 'Course author access required.');
      const c = await db.get<Course>('courses', idSchema.parse(url.searchParams.get('id')));
      ensure(c && (user.role === 'ADMIN' || c.ownerId === user.id), 404, 'Course not found.');
      return response(c);
    }
    if (path === 'admin/settings') {
      ensure(user.role === 'ADMIN', 403, 'Administrator access required.');
      return response((await db.get<Settings>('settings', 'platform')) ?? defaultSettings);
    }
    if (path === 'admin/student') {
      ensure(user.role === 'ADMIN', 403, 'Administrator access required.');
      return response(await studentDetail(db, idSchema.parse(url.searchParams.get('id'))));
    }
    if (path === 'admin') {
      const section = z
        .enum([
          'courses',
          'users',
          'enrollments',
          'payments',
          'certificates',
          'aiUsage',
          'auditLogs',
        ])
        .parse(url.searchParams.get('section') ?? 'courses');
      ensure(
        user.role === 'ADMIN' || (user.role === 'INSTRUCTOR' && section === 'courses'),
        403,
        'Administrator access required.',
      );
      const cursor = url.searchParams.get('cursor') || '';
      if (cursor) idSchema.parse(cursor);
      const data = await db.list<Record<string, unknown>>(
        section,
        user.role === 'INSTRUCTOR' ? { field: 'ownerId', value: user.id } : undefined,
        51,
        cursor,
      );
      return response({
        items: data.slice(0, 50),
        nextCursor: data.length > 50 ? data[49].id : null,
      });
    }
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join('/');
    rateLimit('ingress:' + path, 600);
    if (path === 'session') {
      const data = await body(
        request,
        z.object({
          idToken: z.string().min(10).max(10000),
          name: z.string().min(1).max(80).optional(),
        }),
      );
      const token = await establishSession(data.idToken, data.name);
      (await cookies()).set('libtech-session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 432000,
      });
      return response({ ok: true });
    }
    if (path === 'demo') return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    if (path === 'logout') {
      await body(request, z.object({}));
      (await cookies()).delete('libtech-session');
      return response({ ok: true });
    }
    const user = await requireUser();
    const db = store();
    rateLimit('user:' + user.id, 180);
    if (path === 'enroll') {
      const d = await body(request, z.object({ courseId: idSchema }));
      return response(await enrollFree(db, user, d.courseId));
    }
    if (path === 'draft') {
      const d = await body(request, exercise.extend({ answer: z.string().max(3000) }));
      return response(await saveDraft(db, user, d.courseId, d.lessonId, d.blockId, d.answer));
    }
    if (path === 'answer' || path === 'ai') {
      const d = await body(request, exercise);
      if (path === 'answer')
        return response(await submitAnswer(db, user, d.courseId, d.lessonId, d.blockId, d.answer));
      ensure(
        aiFeedbackEnabled(),
        503,
        'AI feedback is not connected yet. Use the practice checklist instead.',
      );
      const reservation = await reserveAI(db, user, d.courseId, d.lessonId, d.blockId, d.answer);
      if (reservation.cached)
        return response(
          await submitAnswer(
            db,
            user,
            d.courseId,
            d.lessonId,
            d.blockId,
            d.answer,
            reservation.cached,
          ),
        );
      try {
        const evaluated = await openAIProvider.evaluate(reservation.block, d.answer);
        await db.transaction(async (tx) => {
          const prior = await tx.get<Record<string, unknown>>('aiUsage', reservation.id);
          tx.set('aiUsage', reservation.id, {
            ...prior,
            status: 'COMPLETED',
            tokens: evaluated.tokens,
            feedback: evaluated.feedback,
          });
        });
        return response(
          await submitAnswer(
            db,
            user,
            d.courseId,
            d.lessonId,
            d.blockId,
            d.answer,
            evaluated.feedback,
          ),
        );
      } catch (e) {
        await db.transaction(async (tx) => {
          const prior = await tx.get<Record<string, unknown>>('aiUsage', reservation.id);
          tx.set('aiUsage', reservation.id, { ...prior, status: 'FAILED' });
        });
        throw e;
      }
    }
    if (path === 'complete') {
      const d = await body(request, z.object({ courseId: idSchema, lessonId: idSchema }));
      return response(await completeLesson(db, user, d.courseId, d.lessonId));
    }
    if (path === 'payments') {
      ensure(false, 403, 'All courses are free. Course payments are disabled.');
      const d = await body(
        request,
        z.object({ courseId: idSchema, reference: z.string().trim().min(5).max(120) }),
      );
      return response(await manualProvider.submit(db, user, d.courseId, d.reference));
    }
    if (path === 'profile') {
      const d = await body(
        request,
        z.object({
          name: z.string().trim().min(2).max(80),
          country: z.string().max(80),
          bio: z.string().max(500),
        }),
      );
      await db.transaction(async (tx) => {
        const u = await tx.get<User>('users', user.id);
        ensure(u && !u.suspended, 403, 'Account unavailable.');
        tx.set('users', user.id, { ...u, ...d });
      });
      return response({ ok: true });
    }
    if (path === 'notifications/read') {
      const d = await body(request, z.object({ id: idSchema }));
      await db.transaction(async (tx) => {
        const n = await tx.get<Notification>('notifications', d.id);
        ensure(n?.userId === user.id, 404, 'Notification not found.');
        tx.set('notifications', d.id, { ...n, read: true });
      });
      return response({ ok: true });
    }
    if (path === 'admin/course') {
      const d = await body(request, z.unknown());
      return response(await saveCourse(db, user, d));
    }
    if (path === 'admin/settings') {
      const d = await body(request, z.unknown());
      return response(await saveSettings(db, user, d));
    }
    if (path === 'admin/payment') {
      const d = await body(
        request,
        z.object({
          id: idSchema,
          status: z.enum(['APPROVED', 'REJECTED', 'REFUNDED']),
          reason: z.string().max(500),
        }),
      );
      return response(await reviewPayment(db, user, d.id, d.status, d.reason));
    }
    if (path === 'admin/user') {
      const d = await body(
        request,
        z.object({
          id: idSchema,
          action: z.enum(['suspend', 'restore', 'role', 'enroll', 'remove']),
          value: z.string().max(100),
        }),
      );
      return response(await manageUser(db, user, d.id, d.action, d.value));
    }
    if (path === 'admin/certificate') {
      const d = await body(request, z.object({ id: idSchema }));
      return response(await revokeCertificate(db, user, d.id));
    }
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  } catch (e) {
    return failure(e);
  }
}
