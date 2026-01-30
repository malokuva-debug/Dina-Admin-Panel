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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '48px 40px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <h1
          style={{
            marginBottom: '32px',
            color: '#1a202c',
            fontSize: '28px',
            fontWeight: '600',
            textAlign: 'center',
            letterSpacing: '-0.5px',
          }}
        >
          Admin Login
        </h1>

        <label
          style={{
            display: 'block',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#4a5568',
              fontSize: '14px',
              fontWeight: '500',
              letterSpacing: '0.025em',
            }}
          >
            Password
          </span>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '8px',
              border: error ? '2px solid #f56565' : '2px solid #e2e8f0',
              fontSize: '15px',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#f56565' : '#e2e8f0';
              e.target.style.boxShadow = 'none';
            }}
          />
        </label>

        {error && (
          <p
            style={{
              color: '#f56565',
              fontSize: '14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              style={{ flexShrink: 0 }}
            >
              <path
                fillRule="evenodd"
                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 4a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0V4zm1 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              />
            </svg>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#a0aec0' : '#667eea',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(102, 126, 234, 0.4)',
          }}
          onMouseOver={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.background = '#5568d3';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLButtonElement).style.boxShadow =
                '0 6px 20px rgba(102, 126, 234, 0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              (e.target as HTMLButtonElement).style.background = '#667eea';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.target as HTMLButtonElement).style.boxShadow =
                '0 4px 14px rgba(102, 126, 234, 0.4)';
            }
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}