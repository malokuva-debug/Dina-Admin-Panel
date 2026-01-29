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
  }, [redirectTo, router]);

  const handleLogin = async () => {
    setError('');
    const user = await login(userKey, password);

    if (!user) {
      setError('Wrong password');
      return;
    }

    setUser(user);

    setRedirectTo(
      user.role === 'admin' ? '/admin-dashboard' : '/worker-dashboard'
    );
  };

  return (
    <div className="login">
      <h1>Login</h1>

      <select value={userKey} onChange={(e) => setUserKey(e.target.value as UserKey)}>
        <option value="dina">Dina</option>
        <option value="kida">Kida</option>
        <option value="admin">Admin</option>
      </select>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}