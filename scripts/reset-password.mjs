import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 🔐 Use your production env vars
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,               // e.g., https://xyz.supabase.co
  process.env.SUPABASE_SERVICE_ROLE_KEY   // server-only service key
);

// CHANGE THESE
const userId = '6d8a7f6b-4de3-44b1-9ddd-568086ce2529';           // get from Supabase Dashboard → Auth → Users
const newPassword = 'dinakida';

async function resetPassword() {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    console.error('❌ Error resetting password:', error.message);
    process.exit(1);
  }

  console.log('✅ Password reset successfully for user:', userId);
}

resetPassword();