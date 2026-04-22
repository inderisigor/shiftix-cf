import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR, getUser, StatusBadge } from '../api.js'

export default function Quotations() {
  const [quots, setQuots] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const user = getUser()
  const isManager = user.role === 'manager'

  useEffect(() => {
    apiFetch('/api/quotations').then(d => { setQuots(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  async function updateStatus(id, status) {
    await apiFetch(`/api/quotations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
    setQuots(q => q.map(x => x.id === id ? { ...x, status } : x))
  }

  async function deleteQuot(id) {
    if (!confirm('Delete this quotation?')) return
    await apiFetch(`/api/quotations/${id}`, { method: 'DELETE' })
    setQuots(q => q.filter(x => x.id !== id))
  }

  const displayed = filter ? quots.filter(q => q.status === filter) : quots
  const th = { textAlign: 'left', padding: '8px 14px', fontSize: 11, fontWeight: 500, color: '#6b7280', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }
  const td = { padding: '9px 14px', borderBottom: '1px solid #f9fafb', fontSize: 12 }
  const sel = { fontSize: 11, padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Quotations</h1>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select style={sel} value={filter} onChange={e => setFilter(e.target.value)}>
              {['', 'Sent', 'Warm', 'On Hold', 'Won', 'Lost'].map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
            </select>
            <Link to="/quotations/new" style={{ padding: '7px 14px', background: '#0c1a2e', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>+ New Quotation</Link>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead><tr>
              <th style={th}>Quot No.</th><th style={th}>Date</th><th style={th}>Customer</th>
              <th style={th}>Equipment</th><th style={th}>Qty</th><th style={th}>Value</th>
              <th style={th}>Margin</th><th style={th}>Close</th>
              {isManager && <th style={th}>Owner</th>}
              <th style={th}>Status</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={11} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 40 }}>Loading...</td></tr>
              : displayed.length === 0 ? <tr><td colSpan={11} style={{ ...td, textAlign: 'center', color: '#9ca3af', padding: 40 }}>No quotations found</td></tr>
              : displayed.map(q => (
                <tr key={q.id} style={{ cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = '#f9fafb'} onMouseOut={e => e.currentTarget.style.background = ''}>
                  <td style={{ ...td, fontFamily: 'monospace', fontWeight: 500, color: '#374151' }}>ISPL/Q/{q.id?.slice(0,6)}</td>
                  <td style={{ ...td, color: '#6b7280' }}>{q.created_at?.slice(0, 10)}</td>
                  <td style={td}><div style={{ fontWeight: 500 }}>{q.company}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{q.contact}</div></td>
                  <td style={td}><div>{q.equipment}</div>{q.sub_type && <div style={{ fontSize: 11, color: '#9ca3af' }}>{q.sub_type}</div>}</td>
                  <td style={td}>{q.quantity}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{fmtINR(q.total_value)}</td>
                  <td style={{ ...td, color: '#3B6D11', fontWeight: 500 }}>{Math.round(q.margin_pct || 0)}%</td>
                  <td style={{ ...td, color: '#6b7280' }}>{q.close_date || '—'}</td>
                  {isManager && <td style={td}><span style={{ background: '#f3f4f6', color: '#374151', padding: '2px 6px', borderRadius: 8, fontSize: 11 }}>{q.owner_name?.split(' ')[0]}</span></td>}
                  <td style={td}>
                    <select value={q.status} onChange={e => updateStatus(q.id, e.target.value)} style={sel}>
                      {['Sent', 'Warm', 'On Hold', 'Won', 'Lost'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/email?quotId=${q.id}`} style={{ padding: '3px 8px', border: '1px solid #e5e7eb', borderRadius: 6, textDecoration: 'none', color: '#374151', fontSize: 11 }}>Email</Link>
                      <button onClick={() => deleteQuot(q.id)} style={{ padding: '3px 8px', border: '1px solid #fecaca', borderRadius: 6, color: '#dc2626', background: 'none', cursor: 'pointer', fontSize: 11 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
