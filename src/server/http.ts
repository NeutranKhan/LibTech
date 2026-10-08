import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, ensure } from '@/lib/domain';
import { appOrigin } from './origin';
export function originGuard(request: Request) {
  const origin = request.headers.get('origin');
  const expected = appOrigin();
  ensure(
    origin === expected,
    403,
    'This request could not be verified. Refresh the page and try again.',
  );
  ensure(request.headers.get('content-type')?.includes('application/json'), 415, 'Send JSON data.');
}
export async function body<T>(r: Request, schema: z.ZodType<T>): Promise<T> {
  originGuard(r);
  const length = Number(r.headers.get('content-length') || 0);
  ensure(length <= 350000, 413, 'This request is too large.');
  const reader = r.body?.getReader();
  ensure(reader, 400, 'A request body is required.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 350000) {
      await reader.cancel();
      throw new AppError(413, 'This request is too large.');
    }
    chunks.push(value);
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  } catch (e) {
    if (e instanceof z.ZodError) throw e;
    throw new AppError(400, 'Invalid request data.');
  }
}
export function failure(error: unknown) {
  if (error instanceof AppError)
    return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError)
    return NextResponse.json(
      {
        error: 'Please check your entries.',
        fields: error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
      { status: 400 },
    );
  console.error('LibTech request failed', error instanceof Error ? error.name : 'UnknownError');
  return NextResponse.json(
    { error: 'Something went wrong. Please try again shortly.' },
    { status: 500 },
  );
}
