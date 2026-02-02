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
    router.push('/admin-dashboard/kida');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4f4f4f 0%, #040404 100%)',
        padding: '20px',
        gap: '16px',
      }}
    >
      <label style={{ width: '100%', maxWidth: '400px' }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box',
            background: 'white',
            color: 'black',
          }}
        />
      </label>

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '14px 16px',
          borderRadius: '8px',
          border: 'none',
          background: 'white',
          color: 'black',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && (
        <p style={{ color: '#ff6b6b', fontSize: '14px', maxWidth: '400px' }}>
          {error}
        </p>
      )}
    </div>
  );
}