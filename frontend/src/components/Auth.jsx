import React, { useState } from 'react';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('password', password);

                const res = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData
                });
                
                if (!res.ok) {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const data = await res.json();
                        throw new Error(data.detail || 'Login failed');
                    } else {
                        throw new Error(`Login failed: ${res.statusText}`);
                    }
                }
                const data = await res.json();
                onLogin(data.access_token);
            } else {
                const res = await fetch('/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                
                if (!res.ok) {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const data = await res.json();
                        throw new Error(data.detail || 'Registration failed');
                    } else {
                        throw new Error(`Registration failed: ${res.statusText}`);
                    }
                }
                // Automatically login after register
                setIsLogin(true);
                setError("Registration successful! Please login.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{maxWidth: '400px', margin: '2rem auto', padding: '2rem', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '16px', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)'}}>
            <h2 style={{textAlign: 'center', marginBottom: '1.5rem'}}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            {error && (
                <div className="app-error" role="alert" style={{marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(220, 38, 38)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)'}}
                />
                
                {!isLogin && (
                    <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)'}}
                    />
                )}

                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    style={{padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)'}}
                />

                <button type="submit" disabled={loading} style={{padding: '0.75rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem'}}>
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
            </form>

            <div style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={() => {setIsLogin(!isLogin); setError(null);}} 
                    style={{background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'}}
                >
                    {isLogin ? 'Register' : 'Login'}
                </button>
            </div>
        </div>
    );
}
