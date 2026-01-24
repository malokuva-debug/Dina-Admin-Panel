// lib/push.ts
export async function subscribeUser() {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.register("/service-worker.js");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
  });

  // Send subscription object to your server
  await fetch("/api/notifications", {
    method: "POST",
    body: JSON.stringify({ subscription }),
    headers: { "Content-Type": "application/json" }
  });

  return subscription;
}

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}