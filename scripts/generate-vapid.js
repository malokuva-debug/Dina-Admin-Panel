// scripts/generate-vapid.js
// Generate VAPID keys for web push notifications

const webpush = require('web-push');

console.log('\n🔑 Generating VAPID Keys for Web Push Notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID Keys Generated!\n');
console.log('Copy these to your .env.local file:\n');
console.log('─────────────────────────────────────────────────────────');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=mailto:your-email@example.com`);
console.log('─────────────────────────────────────────────────────────\n');

console.log('⚠️  IMPORTANT:');
console.log('  1. Copy the keys above to your .env.local file');
console.log('  2. Change VAPID_EMAIL to your actual email');
console.log('  3. Never commit these keys to Git!');
console.log('  4. Add same keys to Vercel environment variables\n');
