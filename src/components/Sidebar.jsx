import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const links = [
  { href: '/dashboard',      label: 'Dashboard',      icon: '⊞' },
  { href: '/quotations/new', label: 'New Quotation',  icon: '＋' },
  { href: '/quotations',     label: 'Quotations',     icon: '≡' },
  { href: '/pipeline',       label: 'Pipeline',       icon: '▦' },
  { href: '/leads',          label: 'Lead Finder',    icon: '◎' },
  { href: '/email',          label: 'Email Composer', icon: '✉' },
  { href: '/reports',        label: 'Reports',        icon: '▶' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('sx_user') || '{}')
  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'
  const isManager = user.role === 'manager'

  function logout() {
    localStorage.removeItem('sx_token')
    localStorage.removeItem('sx_user')
    navigate('/login')
  }

  const sb = {
    width: 192, background: '#0c1a2e', display: 'flex', flexDirection: 'column',
    height: '100vh', position: 'sticky', top: 0, flexShrink: 0
  }

  return (
    <aside style={sb}>
      <div style={{ padding: '16px 14px 14px', borderBottom: '1px solid #1e3a5f' }}>
        <div style={{ background: 'white', padding: '3px 8px', borderRadius: 3, fontSize: 13, fontWeight: 900, color: '#0c1a2e', letterSpacing: '0.06em', display: 'inline-block' }}>SHIFTIX</div>
        <div style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', marginTop: 6, lineHeight: 1.3 }}>INTRA SHIFTIX<br />PVT LTD</div>
      </div>
      <nav style={{ flex: 1, padding: '10px 7px', overflowY: 'auto' }}>
        {links.map(item => {
          const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          return (
            <Link key={item.href} to={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px',
              borderRadius: 7, marginBottom: 2, textDecoration: 'none', fontSize: 12,
              color: active ? '#f1f5f9' : '#94a3b8', fontWeight: active ? 500 : 400,
              background: active ? '#1e3a5f' : 'transparent',
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '12px 13px', borderTop: '1px solid #1e3a5f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ color: 'white', fontSize: 11, fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{isManager ? 'Manager' : 'Sales'}</div>
          </div>
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: '#475569', fontSize: 11, cursor: 'pointer', padding: 0 }}>Sign out →</button>
      </div>
    </aside>
  )
}
