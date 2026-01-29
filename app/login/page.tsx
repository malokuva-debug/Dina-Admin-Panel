'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, UserKey } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [userKey, setUserKey] = useState<UserKey>('dina');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (redirectTo) router.push(redirectTo);
  }, [redirectTo]);

  const handleLogin = async () => {
    setError('');
    const user = await login(userKey, password);
    if (!user) {
      setError('Wrong password!');
      return;
    }

    // Update global auth state
    setUser(user);

    // Redirect safely
    if (user.role === 'admin') setRedirectTo('/admin-dashboard');
    else setRedirectTo('/worker-dashboard');
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