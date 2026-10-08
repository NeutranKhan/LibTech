import { NextResponse } from 'next/server';
import { appOrigin } from '@/server/origin';
import { profilePhotosEnabled } from '@/server/features';
import sharp from 'sharp';
import { getStorage } from 'firebase-admin/storage';
import { createHash } from 'node:crypto';
import { requireUser } from '@/server/auth';
import { firebaseAdmin } from '@/server/firebase';
import { store } from '@/server/store';
import { failure } from '@/server/http';
import { ensure, type User } from '@/lib/domain';
import { rateLimit } from '@/server/rate-limit';
export const runtime = 'nodejs';
export const maxDuration = 30;
function objectPath(uid: string) {
  return 'avatars/' + createHash('sha256').update(uid).digest('hex') + '.webp';
}
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    ensure(profilePhotosEnabled(), 503, 'Profile photos are currently unavailable.');
    rateLimit('photo:' + user.id, 10);
    const expected = appOrigin();
    ensure(
      request.headers.get('origin') === new URL(expected).origin,
      403,
      'Request could not be verified.',
    );
    ensure(
      ['image/png', 'image/jpeg', 'image/webp'].includes(request.headers.get('content-type') || ''),
      415,
      'Choose a PNG, JPEG, or WebP image.',
    );
    ensure(
      Number(request.headers.get('content-length') || 0) <= 2097152,
      413,
      'Choose an image smaller than 2 MB.',
    );
    const reader = request.body?.getReader();
    ensure(reader, 400, 'Choose an image.');
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2097152) {
        await reader.cancel();
        throw new Error('Too large');
      }
      chunks.push(value);
    }
    let image: Buffer;
    try {
      image = await sharp(Buffer.concat(chunks), { limitInputPixels: 16000000 })
        .rotate()
        .resize(256, 256, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: 'This image could not be processed. Try a smaller PNG or JPEG.' },
        { status: 400 },
      );
    }
    await getStorage(firebaseAdmin())
      .bucket()
      .file(objectPath(user.id))
      .save(image, {
        contentType: 'image/webp',
        metadata: { cacheControl: 'private,max-age=0' },
      });
    await store().transaction(async (tx) => {
      const u = await tx.get<User>('users', user.id);
      ensure(u && !u.suspended, 403, 'Account unavailable.');
      tx.set('users', user.id, { ...u, photoURL: '/api/profile/photo' });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
export async function GET() {
  try {
    const user = await requireUser();
    const [bytes] = await getStorage(firebaseAdmin()).bucket().file(objectPath(user.id)).download();
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    return failure(e);
  }
}
