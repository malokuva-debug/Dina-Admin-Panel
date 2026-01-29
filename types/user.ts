// types/user.ts
export type Worker = 'dina' | 'kida';
export type Role = 'admin' | 'worker';

export interface User {
  id: string;
  email: string;
  name: string;       // ALWAYS required
  role: Role;
  worker?: Worker;    // only for workers
}