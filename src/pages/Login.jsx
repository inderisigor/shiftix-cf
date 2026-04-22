import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const USERS = [
  { name: 'Neha Singh',           email: 'neha.singh@shiftix.in',          role: 'sales' },
  { name: 'Ritwik Kundu',         email: 'ritwik.kundu@shiftix.in',         role: 'manager' },
  { name: 'Harshshikha Nandan',   email: 'harshshikha.nandan@shiftix.in',   role: 'sales' },
  { name: 'Siddhant Prajapati',   email: 'siddhant.prajapati@shiftix.in',   role: 'sales' },
]

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('sx_token', data.token)
        localStorage.setItem('sx_user', JSON.stringify(data.user))
        navigate('/dashboard')
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0c1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, width: '100%' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', background: 'white', padding: '8px 16px', borderRadius: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#0c1a2e', letterSpacing: '0.06em' }}>SHIFTIX</span>
          </div>
          <div style={{ color: 'white', fontWeight: 700, letterSpacing: '0.1em', fontSize: 13 }}>INTRA SHIFTIX PVT LTD</div>
          <div style={{ color: '#93c5fd', fontSize: 12, marginTop: 4 }}>Sales & CRM Platform</div>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, color: '#111827' }}>Sign in to your account</h1>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Email address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@shiftix.in"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            </div>
            {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626', marginBottom: 14 }}>{error}</div>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#0c1a2e', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Team accounts — click to fill:</div>
            {USERS.map(u => (
              <button key={u.email} onClick={() => setEmail(u.email)}
                style={{ width: '100%', textAlign: 'left', padding: '6px 8px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: 2 }}
                onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{u.name}{u.role === 'manager' ? ' (Manager)' : ''}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{u.email}</div>
              </button>
            ))}
            <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
              Default password: <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6b7280' }}>Shiftix@2026</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#93c5fd' }}>
          Mumbai · +91-9004450518 · info@shiftix.in
        </div>
      </div>
    </div>
  )
}
