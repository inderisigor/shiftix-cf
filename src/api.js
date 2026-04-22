// src/api.js - shared fetch helper
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('sx_token')
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (res.status === 401) {
    localStorage.removeItem('sx_token')
    localStorage.removeItem('sx_user')
    window.location.href = '/login'
    return null
  }
  return res.json()
}

export function fmtINR(n) {
  return '₹' + Math.round(n || 0).toLocaleString('en-IN')
}

export function getUser() {
  return JSON.parse(localStorage.getItem('sx_user') || '{}')
}

export function StatusBadge({ status }) {
  const colors = {
    Sent: { bg: '#dbeafe', color: '#1e40af' },
    Won: { bg: '#dcfce7', color: '#166534' },
    Lost: { bg: '#fee2e2', color: '#991b1b' },
    Warm: { bg: '#fef3c7', color: '#92400e' },
    'On Hold': { bg: '#d1fae5', color: '#065f46' },
  }
  const c = colors[status] || colors.Sent
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: c.bg, color: c.color }}>
      {status || 'Sent'}
    </span>
  )
}
