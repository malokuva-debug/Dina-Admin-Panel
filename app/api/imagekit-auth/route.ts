// app/api/imagekit-auth/route.ts
import ImageKit from 'imagekit';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Force Next.js to never cache this route
export const dynamic = 'force-dynamic';

const imagekit = new ImageKit({
  publicKey:   process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
  try {
    const token = randomUUID();
    const auth = imagekit.getAuthenticationParameters(token);
    return NextResponse.json(auth, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    console.error('ImageKit auth error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}