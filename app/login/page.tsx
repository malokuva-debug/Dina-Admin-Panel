'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally, redirect if already logged in
    // const current = localStorage.getItem('currentUser');
    // if (current) router.push('/admin-dashboard');
  }, [router]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    const user = await login('admin', password);

    setLoading(false);

    if (!user) {
      setError('Wrong password');
      return;
    }

    setUser(user);
    router.push('/admin-dashboard'); // only admin dashboard for now
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ marginBottom: '24px', color: '#333' }}>Admin Login</h1>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '16px',
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#667eea',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseOver={(e) =>
            ((e.target as HTMLButtonElement).style.background = '#556cd6')
          }
          onMouseOut={(e) =>
            ((e.target as HTMLButtonElement).style.background = '#667eea')
          }
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && (
          <p style={{ color: 'red', marginTop: '16px', fontWeight: 'bold' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}