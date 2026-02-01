import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔐 server only
  );

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    user_id: userId,
    redirect_to: 'https://dina-admin-panel.vercel.app/reset-password' // your live site
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ link: data?.properties?.action_link });
}