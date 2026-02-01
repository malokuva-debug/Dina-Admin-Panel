export default function ResetPasswordButton() {
  const resetPassword = async () => {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '6d8a7f6b-4de3-44b1-9ddd-568086ce2529',
        newPassword: 'dinakida',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
    } else {
      alert('Password reset successfully');
    }
  };

  return (
    <button onClick={resetPassword}>
      Reset Password
    </button>
  );
}