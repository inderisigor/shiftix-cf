import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR, getUser, StatusBadge } from '../api.js'
import { Link } from 'react-router-dom'

const ST_COLORS = { Sent: '#3b82f6', Warm: '#f59e0b', 'On Hold': '#10b981', Won: '#22c55e', Lost: '#ef4444' }

export default function Dashboard() {
  const [quots, setQuots] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getUser()
  const isManager = user.role === 'manager'

  useEffect(() => {
    apiFetch('/api/quotations').then(d => { setQuots(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  const won = quots.filter(q => q.status === 'Won')
  const warm = quots.filter(q => q.status === 'Warm' || q.status === 'On Hold')
  const wonVal = won.reduce((s, q) => s + (q.total_value || 0), 0)
  const avgMg = quots.length ? quots.reduce((s, q) => s + (q.margin_pct || 0), 0) / quots.length : 0
  const statuses = ['Sent', 'Warm', 'On Hold', 'Won', 'Lost']
  const counts = statuses.map(s => quots.filter(q => q.status === s).length)
  const maxCount = Math.max(...counts, 1)
  const now = new Date().toISOString().slice(0, 7)
  const closures = quots.filter(q => q.close_date?.startsWith(now) && q.status !== 'Lost')

  const metrics = [
    { label: 'Total Quotations', value: quots.length, sub: isManager ? 'All team' : 'My quotes', color: '#185FA5' },
    { label: 'Won Orders', value: won.length, sub: fmtINR(wonVal) + ' revenue', color: '#3B6D11' },
    { label: 'In Pipeline', value: warm.length, sub: 'Warm + On Hold', color: '#854F0B' },
    { label: 'Avg. Margin', value: Math.round(avgMg) + '%', sub: 'across all quotes', color: '#7c3aed' },
  ]

  const card = { background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 12 }
  const th = { textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 500, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }
  const td = { padding: '9px 16px', borderBottom: '1px solid #f9fafb', fontSize: 12 }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600 }}>{isManager ? 'Team Dashboard' : `Welcome, ${user.name?.split(' ')[0]}`}</h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{isManager ? 'Viewing all team data' : 'Your personal sales dashboard'}</p>
          </div>
          {isManager && <span style={{ background: '#1e3a5f', color: '#60a5fa', fontSize: 11, padding: '3px 10px', borderRadius: 20 }}>Manager View</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ background: '#f9fafb', borderRadius: 12, padding: 16, borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{loading ? '—' : m.value}</div>
              <div style={{ fontSize: 11, color: m.color, marginTop: 2 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={card}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Quotations</span>
              <Link to="/quotations" style={{ fontSize: 12, color: '#185FA5', textDecoration: 'none' }}>View all</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Customer</th><th style={th}>Equipment</th><th style={th}>Value</th><th style={th}>Status</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                : quots.slice(0, 5).length === 0 ? <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: '#9ca3af' }}>No quotations yet</td></tr>
                : quots.slice(0, 5).map(q => (
                  <tr key={q.id}>
                    <td style={td}><div style={{ fontWeight: 500 }}>{q.company}</div></td>
                    <td style={{ ...td, color: '#6b7280' }}>{q.equipment}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{fmtINR(q.total_value)}</td>
                    <td style={td}><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={card}>
            <div style={{ padding: '11px 16px', borderBottom: '1px solid #f3f4f6' }}><span style={{ fontSize: 13, fontWeight: 600 }}>Pipeline by Status</span></div>
            <div style={{ padding: 16 }}>
              {statuses.map((s, i) => (
                <div key={s} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', marginBottom: 4 }}>
                    <span>{s}</span><span style={{ fontWeight: 600, color: ST_COLORS[s] }}>{counts[i]}</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(counts[i] / maxCount * 100)}%`, background: ST_COLORS[s], borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ padding: '11px 16px', borderBottom: '1px solid #f3f4f6' }}><span style={{ fontSize: 13, fontWeight: 600 }}>Expected Closures — This Month</span></div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Customer</th><th style={th}>Equipment</th><th style={th}>Value</th><th style={th}>Close Date</th><th style={th}>Status</th></tr></thead>
            <tbody>
              {closures.length === 0
                ? <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9ca3af' }}>No closures this month</td></tr>
                : closures.map(q => (
                  <tr key={q.id}>
                    <td style={{ ...td, fontWeight: 500 }}>{q.company}</td>
                    <td style={{ ...td, color: '#6b7280' }}>{q.equipment}</td>
                    <td style={{ ...td, fontWeight: 500 }}>{fmtINR(q.total_value)}</td>
                    <td style={{ ...td, color: '#6b7280' }}>{q.close_date}</td>
                    <td style={td}><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
