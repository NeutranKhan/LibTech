import { randomUUID, createHash } from 'node:crypto';
import {
  ensure,
  defaultSettings,
  type Course,
  type User,
  type Payment,
  type Enrollment,
  type Settings,
} from '@/lib/domain';
import type { Store } from './store';
import { audit, key, notify } from './learning';
export interface PaymentProvider {
  name: string;
  submit(db: Store, user: User, courseId: string, reference: string): Promise<Payment>;
}
export const manualProvider: PaymentProvider = {
  name: 'MANUAL',
  submit: async (db, actor, courseId, reference) =>
    db.transaction(async (tx) => {
      const user = await tx.get<User>('users', actor.id);
      ensure(user && !user.suspended, 403, 'Account unavailable.');
      const course = await tx.get<Course>('courses', courseId);
      ensure(course?.status === 'PUBLISHED', 404, 'Course unavailable.');
      const settings = (await tx.get<Settings>('settings', 'platform')) ?? defaultSettings;
      ensure(
        settings.paymentsEnabled && settings.paymentInstructions.trim(),
        503,
        'Payments are not open yet. Please check back soon.',
      );
      const id = key(actor.id, courseId);
      const prior = await tx.get<Payment>('payments', id);
      const enrollment = await tx.get<Enrollment>('enrollments', id);
      ensure(!enrollment?.active, 409, 'You already have access to this course.');
      ensure(
        !prior || prior.status === 'REJECTED' || prior.status === 'REFUNDED',
        409,
        'A payment request already exists for this course.',
      );
      const refId = createHash('sha256').update(reference.trim().toLowerCase()).digest('hex');
      const used = await tx.get('paymentReferences', refId);
      ensure(!used, 409, 'That reference has already been submitted.');
      const payment: Payment = {
        id,
        userId: actor.id,
        courseId,
        amountCents: course.priceCents,
        currency: 'USD',
        method: 'MANUAL',
        reference,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      if (prior) tx.set('paymentHistory', randomUUID(), prior);
      tx.set('payments', id, payment);
      tx.set('paymentReferences', refId, { paymentId: id });
      return payment;
    }),
};
export async function reviewPayment(
  db: Store,
  actor: User,
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'REFUNDED',
  reason: string,
) {
  return db.transaction(async (tx) => {
    const admin = await tx.get<User>('users', actor.id);
    ensure(admin?.role === 'ADMIN' && !admin.suspended, 403, 'Administrator access required.');
    const p = await tx.get<Payment>('payments', id);
    ensure(p, 404, 'Payment not found.');
    ensure(
      status === 'REFUNDED' ? p.status === 'APPROVED' : p.status === 'PENDING',
      409,
      'This payment has already been reviewed.',
    );
    const eId = key(p.userId, p.courseId);
    const existing = await tx.get<Enrollment>('enrollments', eId);
    const instant = new Date().toISOString();
    p.status = status;
    p.reviewedAt = instant;
    p.reviewedBy = actor.id;
    p.reason = reason;
    if (status === 'APPROVED')
      tx.set<Enrollment>('enrollments', eId, {
        id: eId,
        userId: p.userId,
        courseId: p.courseId,
        active: true,
        createdAt: existing?.createdAt ?? instant,
        source: 'MANUAL',
      });
    if (status === 'REFUNDED' && existing)
      tx.set('enrollments', eId, { ...existing, active: false });
    tx.set('payments', id, p);
    audit(tx, actor.id, 'PAYMENT_' + status, id);
    notify(
      tx,
      p.userId,
      'Payment ' + status.toLowerCase(),
      status === 'APPROVED'
        ? 'Your course is ready. Let’s start learning.'
        : reason || 'Check your payment details for more information.',
      '/dashboard',
    );
    return p;
  });
}
