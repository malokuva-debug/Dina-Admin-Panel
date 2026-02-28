// app/api/imagekit-auth/route.ts
import ImageKit from 'imagekit';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const imagekit = new ImageKit({
  publicKey:   process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

export async function GET() {
  try {
    // Fresh UUID every call — ImageKit rejects reused tokens
    const token = randomUUID();
    const auth = imagekit.getAuthenticationParameters(token);
    return NextResponse.json(auth);
  } catch (err) {
    console.error('ImageKit auth error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}