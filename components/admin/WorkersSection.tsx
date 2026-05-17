'use client';

interface Props {
  selectedWorker?: string | null;
}

export default function WorkersSection({ selectedWorker }: Props) {
  return (
    <div>
      <h2>Workers Section</h2>
      <p>Selected worker: {selectedWorker || 'None'}</p>
    </div>
  );
}