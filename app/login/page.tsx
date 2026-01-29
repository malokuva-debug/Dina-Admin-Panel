'use client';

import { useState } from 'react';
import { login, EMAIL_MAP, UserKey } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [userKey, setUserKey] = useState<UserKey>('dina');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const user = await login(userKey, password);
    if (user) {
      // Redirect after login
      if (user.role === 'admin') router.push('/admin-dashboard'); 
      else router.push('/worker-dashboard'); 
    } else {
      setError('Wrong password!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}>
      <h1>Login</h1>

      <label>
        Who are you?
        <select value={userKey} onChange={(e) => setUserKey(e.target.value as UserKey)}>
          {Object.keys(EMAIL_MAP).map((key) => (
            <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
          ))}
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

      <button onClick={handleLogin} style={{ marginTop: '1rem' }}>Login</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}