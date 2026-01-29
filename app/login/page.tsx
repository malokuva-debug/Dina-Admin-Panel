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

  // Redirect after successful login
  useEffect(() => {
    if (redirectTo) router.push(redirectTo);
  }, [redirectTo, router]);

  const handleLogin = async () => {
    setError('');

    const authUser = await login(userKey, password);

    if (!authUser) {
      setError('Wrong password!');
      return;
    }

    // Update global auth state
    setUser(authUser);

    // Redirect based on role
    if (authUser.role === 'admin') setRedirectTo('/admin-dashboard');
    else setRedirectTo('/worker-dashboard');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '5rem',
      }}
    >
      <h1>Login</h1>

      <label style={{ marginTop: '1rem' }}>
        Who are you?
        <select
          value={userKey}
          onChange={(e) => setUserKey(e.target.value as UserKey)}
          style={{ marginLeft: '0.5rem' }}
        >
          <option value="dina">Dina</option>
          <option value="kida">Kida</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label style={{ marginTop: '1rem' }}>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          style={{ marginLeft: '0.5rem' }}
        />
      </label>

      <button
        onClick={handleLogin}
        style={{ marginTop: '1.5rem', padding: '0.5rem 1rem' }}
      >
        Login
      </button>

      {error && (
        <p style={{ color: 'red', marginTop: '1rem', fontWeight: 'bold' }}>
          {error}
        </p>
      )}
    </div>
  );
}