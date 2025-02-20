
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/random');
    } catch (err) {
      setError('Failed to sign in');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
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
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
          Log In
        </button>
      </form>
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/signup')} 
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Need an account? Sign up
        </button>
        <br />
        <button 
          onClick={() => navigate('/reset-password')} 
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer', marginTop: '5px' }}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

export default Login;
