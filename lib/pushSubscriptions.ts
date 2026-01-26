// lib/pushSubscriptions.ts
export const g = global as typeof globalThis & {
  pushSubscriptions: Map<string, any>;
};

if (!g.pushSubscriptions) {
  g.pushSubscriptions = new Map<string, any>();
}
