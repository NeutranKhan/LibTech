export async function withIndexFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    const failure = error as { code?: number; message?: string };
    if (failure.code !== 9 || !/requires an index/i.test(failure.message || '')) throw error;
    return fallback();
  }
}
