import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR, getUser } from '../api.js'

const COLS = [
  { key:'Sent',     color:'#3b82f6', bg:'#eff6ff' },
  { key:'Warm',     color:'#f59e0b', bg:'#fffbeb' },
  { key:'On Hold',  color:'#10b981', bg:'#f0fdf4' },
  { key:'Won',      color:'#22c55e', bg:'#f0fdf4' },
]

export default function Pipeline() {
  const [quots, setQuots] = useState([])
  const user = getUser()
  const isManager = user.role === 'manager'

  useEffect(() => {
    apiFetch('/api/quotations').then(d => setQuots(Array.isArray(d)?d:[]))
  }, [])

  async function move(id, status) {
    await apiFetch(`/api/quotations/${id}`, { method:'PATCH', body: JSON.stringify({ status }) })
    setQuots(q => q.map(x => x.id===id ? {...x,status} : x))
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, padding:24, overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:600 }}>Pipeline</h1>
          {isManager && <span style={{ background:'#1e3a5f', color:'#60a5fa', fontSize:11, padding:'3px 10px', borderRadius:20 }}>Manager — All Team</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {COLS.map(col => {
            const items = quots.filter(q => q.status===col.key)
            const total = items.reduce((s,q)=>s+(q.total_value||0),0)
            return (
              <div key={col.key} style={{ background:col.bg, borderRadius:12, padding:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:8, marginBottom:8, borderBottom:`2px solid ${col.color}` }}>
                  <span style={{ fontSize:12, fontWeight:600, color:col.color }}>{col.key}</span>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{items.length} deals</div>
                    <div style={{ fontSize:11, fontWeight:500, color:col.color }}>{fmtINR(total)}</div>
                  </div>
                </div>
                {items.length===0
                  ? <div style={{ fontSize:12, color:'#9ca3af', textAlign:'center', padding:24 }}>No deals</div>
                  : items.map(q => (
                    <div key={q.id} style={{ background:'white', border:'1px solid #e5e7eb', borderLeft:`3px solid ${col.color}`, borderRadius:8, padding:10, marginBottom:8 }}>
                      <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{q.company}</div>
                      <div style={{ fontSize:11, color:'#9ca3af', marginBottom:4 }}>{q.equipment}{q.sub_type?` — ${q.sub_type}`:''}</div>
                      <div style={{ fontSize:12, fontWeight:500, color:'#185FA5', marginBottom:4 }}>{fmtINR(q.total_value)}</div>
                      {q.close_date && <div style={{ fontSize:10, color:'#9ca3af', marginBottom:6 }}>Close: {q.close_date}</div>}
                      {isManager && <div style={{ fontSize:10, background:'#f3f4f6', color:'#6b7280', padding:'2px 6px', borderRadius:6, display:'inline-block', marginBottom:6 }}>{q.owner_name?.split(' ')[0]}</div>}
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {COLS.filter(c=>c.key!==col.key).map(c=>(
                          <button key={c.key} onClick={()=>move(q.id,c.key)}
                            style={{ fontSize:10, padding:'2px 6px', border:'1px solid #e5e7eb', borderRadius:6, background:'white', cursor:'pointer', color:'#6b7280' }}>
                            → {c.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
