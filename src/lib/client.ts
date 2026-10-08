export async function api<T>(path: string, data?: unknown): Promise<T> {
  const result = await fetch('/api/' + path, {
    method: data === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: data === undefined ? {} : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: 'no-store',
  });
  const json = await result.json();
  if (!result.ok) throw new Error(json.error || 'Please try again.');
  return json as T;
}
