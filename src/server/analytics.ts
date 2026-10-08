import { getFirestore, AggregateField, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firebaseAdmin } from './firebase';
import { withIndexFallback } from './aggregate';
export async function analytics() {
  const db = getFirestore(firebaseAdmin());
  const [
    students,
    active,
    courses,
    enrollments,
    completed,
    revenue,
    pending,
    certificates,
    ai,
    tokens,
  ] = await Promise.all([
    db.collection('users').where('role', '==', 'STUDENT').count().get(),
    withIndexFallback(
      () =>
        db
          .collection('users')
          .where('role', '==', 'STUDENT')
          .where('suspended', '==', false)
          .count()
          .get()
          .then((result) => result.data().count),
      async () => {
        let count = 0;
        for await (const doc of db
          .collection('users')
          .where('role', '==', 'STUDENT')
          .select('suspended')
          .stream())
          if ((doc as unknown as QueryDocumentSnapshot).get('suspended') === false) count++;
        return count;
      },
    ),
    db.collection('courses').count().get(),
    db.collection('enrollments').count().get(),
    db.collection('certificates').count().get(),
    withIndexFallback(
      () =>
        db
          .collection('payments')
          .where('status', '==', 'APPROVED')
          .aggregate({ sum: AggregateField.sum('amountCents') })
          .get()
          .then((result) => result.data().sum),
      async () => {
        let sum = 0;
        for await (const doc of db
          .collection('payments')
          .where('status', '==', 'APPROVED')
          .select('amountCents')
          .stream()) {
          const amount = (doc as unknown as QueryDocumentSnapshot).get('amountCents');
          if (typeof amount === 'number' && Number.isFinite(amount)) sum += amount;
        }
        return sum;
      },
    ),
    db.collection('payments').where('status', '==', 'PENDING').count().get(),
    db.collection('certificates').where('revoked', '==', false).count().get(),
    db.collection('aiUsage').count().get(),
    db
      .collection('aiUsage')
      .aggregate({ tokens: AggregateField.sum('tokens') })
      .get(),
  ]);
  return {
    students: students.data().count,
    activeStudents: active,
    courses: courses.data().count,
    enrollments: enrollments.data().count,
    completed: completed.data().count,
    revenueCents: revenue,
    pending: pending.data().count,
    certificates: certificates.data().count,
    aiRequests: ai.data().count,
    aiTokens: tokens.data().tokens,
  };
}
