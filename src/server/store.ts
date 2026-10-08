import type { Firestore, Transaction as FireTransaction, Query } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseAdmin } from './firebase';
export type Filter = { field: string; value: string | boolean };
export interface Reader {
  get<T>(collection: string, id: string): Promise<T | null>;
  list<T>(collection: string, filter?: Filter, limit?: number, after?: string): Promise<T[]>;
}
export interface Transaction extends Reader {
  set<T>(collection: string, id: string, value: T): void;
  delete(collection: string, id: string): void;
}
export interface Store extends Reader {
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
class FirebaseStore implements Store {
  private get db(): Firestore {
    return getFirestore(firebaseAdmin());
  }
  private reader(transaction?: FireTransaction): Reader {
    const db = this.db;
    return {
      get: async <T>(c: string, id: string) => {
        const ref = db.collection(c).doc(id);
        const doc = await (transaction ? transaction.get(ref) : ref.get());
        return doc.exists ? (doc.data() as T) : null;
      },
      list: async <T>(c: string, f?: Filter, limit = 100, after = '') => {
        let q: Query = db.collection(c);
        if (f) q = q.where(f.field, '==', f.value);
        q = q.orderBy('__name__');
        if (after) q = q.startAfter(after);
        q = q.limit(limit);
        const snap = await (transaction ? transaction.get(q) : q.get());
        return snap.docs.map((d) => d.data() as T);
      },
    };
  }
  get<T>(c: string, id: string) {
    return this.reader().get<T>(c, id);
  }
  list<T>(c: string, f?: Filter, l?: number, a?: string) {
    return this.reader().list<T>(c, f, l, a);
  }
  transaction<T>(fn: (tx: Transaction) => Promise<T>) {
    return this.db.runTransaction(async (tx) => {
      const writes: (() => void)[] = [];
      const reader = this.reader(tx);
      const result = await fn({
        ...reader,
        set: <V>(c: string, id: string, v: V) =>
          writes.push(() => tx.set(this.db.collection(c).doc(id), v as Record<string, unknown>)),
        delete: (c, id) => writes.push(() => tx.delete(this.db.collection(c).doc(id))),
      });
      writes.forEach((write) => write());
      return result;
    });
  }
}
export function configured() {
  return !!process.env.FIREBASE_PROJECT_ID;
}
const globalStore = globalThis as unknown as { libtechStore?: Store };
export function store(): Store {
  return (globalStore.libtechStore ??= new FirebaseStore());
}
