import type { Store, Transaction, Filter } from '../../src/server/store';
export type Records = Record<string, Record<string, unknown>>;
export class MemoryStore implements Store {
  protected data: Records = {};
  private tail: Promise<unknown> = Promise.resolve();
  constructor(initial: Records = {}) {
    this.data = structuredClone(initial);
  }
  protected async initialize() {}
  protected async persist(_data: Records) {
    void _data;
  }
  async get<T>(c: string, id: string) {
    await this.initialize();
    return structuredClone((this.data[c]?.[id] as T) ?? null);
  }
  async list<T>(c: string, f?: Filter, limit = 100, after = '') {
    await this.initialize();
    return this.readList<T>(this.data, c, f, limit, after);
  }
  private readList<T>(data: Records, c: string, f?: Filter, limit = 100, after = '') {
    return Object.entries(data[c] ?? {})
      .sort(([a], [b]) => a.localeCompare(b))
      .filter(
        ([id, v]) => id > after && (!f || (v as Record<string, unknown>)[f.field] === f.value),
      )
      .slice(0, limit)
      .map(([, v]) => structuredClone(v as T));
  }
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    const operation = this.tail.then(async () => {
      await this.initialize();
      const copy = structuredClone(this.data);
      const tx: Transaction = {
        get: async <T>(c: string, id: string) => structuredClone((copy[c]?.[id] as T) ?? null),
        list: async <T>(c: string, f?: Filter, l = 100, a = '') =>
          this.readList<T>(copy, c, f, l, a),
        set: <T>(c: string, id: string, v: T) => {
          copy[c] ??= {};
          copy[c][id] = structuredClone(v);
        },
        delete: (c, id) => {
          delete copy[c]?.[id];
        },
      };
      const result = await fn(tx);
      await this.persist(copy);
      this.data = copy;
      return result;
    });
    this.tail = operation.catch(() => {});
    return operation;
  }
}
