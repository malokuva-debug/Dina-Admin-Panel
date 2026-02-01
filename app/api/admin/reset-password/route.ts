// app/api/admin/reset-password/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const { email, newPassword } = await req.json();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1️⃣ Get user by email
  const { data: users, error: fetchError } = await supabaseAdmin.auth.admin.listUsers({
    filter: `email=eq.${email}`
  });

  if (fetchError || !users?.users?.length) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const userId = users.users[0].id;

  // 2️⃣ Update password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}