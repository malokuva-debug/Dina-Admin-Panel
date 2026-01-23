import { Worker } from '@/types';

interface WorkerNavProps {
  selectedWorker: Worker;
  onWorkerChange: (worker: Worker) => void;
}

export default function WorkerNav({ selectedWorker, onWorkerChange }: WorkerNavProps) {
  return (
    <div className="worker-nav full-width">
      <button
        className={`worker-btn ${selectedWorker === 'dina' ? 'active' : ''}`}
        onClick={() => onWorkerChange('dina')}
      >
        Dina
      </button>
      <button
        className={`worker-btn ${selectedWorker === 'kida' ? 'active' : ''}`}
        onClick={() => onWorkerChange('kida')}
      >
        Kida
      </button>
    </div>
  );
}