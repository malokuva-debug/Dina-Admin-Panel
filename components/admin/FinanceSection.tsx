'use client';

interface Props {
  selectedWorker?: string | null;
}

export default function FinanceSection({ selectedWorker }: Props) {
  return (
    <div>
      <h2>Finance Section</h2>
      <p>Worker: {selectedWorker || 'All'}</p>
    </div>
  );
}