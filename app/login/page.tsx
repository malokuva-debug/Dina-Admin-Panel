'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, UserKey } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [userKey, setUserKey] = useState<UserKey>('dina');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const user = await login(userKey, password);
    if (!user) {
      setError('Wrong password!');
      return;
    }

    // Redirect based on role
    if (user.role === 'admin') {
      router.push('/admin-dashboard');
    } else if (user.role === 'worker') {
      router.push('/worker-dashboard');
    } else {
      setError('Unknown role!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}>
      <h1>Login</h1>

      <label>
        Who are you?
        <select value={userKey} onChange={(e) => setUserKey(e.target.value as UserKey)}>
          <option value="dina">Dina</option>
          <option value="kida">Kida</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
      </label>

      <button onClick={handleLogin} style={{ marginTop: '1rem' }}>
        Login
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}