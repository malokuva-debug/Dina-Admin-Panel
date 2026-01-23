export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-blue-500" />
        <p className="text-neutral-400">Loading…</p>
      </div>
    </div>
  );
}