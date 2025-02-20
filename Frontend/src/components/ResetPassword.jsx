
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setMessage('');
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (err) {
      setError('Failed to reset password');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2>Reset Password</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          Reset Password
        </button>
      </form>
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/login')} 
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
