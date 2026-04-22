import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR, getUser } from '../api.js'
import StatusBadge from '../components/StatusBadge.jsx'

export default function Reports() {
  const [quots, setQuots] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const user = getUser()
  const isManager = user.role === 'manager'

  useEffect(() => {
    apiFetch('/api/quotations').then(d => setQuots(Array.isArray(d)?d:[]))
  }, [])

  const filtered = quots.filter(q => {
    if (from && q.created_at?.slice(0,10) < from) return false
    if (to   && q.created_at?.slice(0,10) > to)   return false
    return true
  })

  const won    = filtered.filter(q=>q.status==='Won')
  const tv     = filtered.reduce((s,q)=>s+(q.total_value||0),0)
  const wv     = won.reduce((s,q)=>s+(q.total_value||0),0)
  const cr     = filtered.length?Math.round(won.length/filtered.length*100):0
  const avgMg  = won.length?Math.round(won.reduce((s,q)=>s+(q.margin_pct||0),0)/won.length):0
  const indV   = filtered.filter(q=>q.market==='india').reduce((s,q)=>s+(q.total_value||0),0)
  const expV   = filtered.filter(q=>q.market==='export').reduce((s,q)=>s+(q.total_value||0),0)
  const indPct = Math.round(indV/(indV+expV||1)*100)

  const statuses=['Sent','Warm','On Hold','Won','Lost']
  const stColors=['#3b82f6','#f59e0b','#10b981','#22c55e','#ef4444']
  const stCounts=statuses.map(s=>filtered.filter(q=>q.status===s).length)
  const stVals=statuses.map(s=>filtered.filter(q=>q.status===s).reduce((a,q)=>a+(q.total_value||0),0))
  const maxCount=Math.max(...stCounts,1)

  const eqMap={}
  filtered.forEach(q=>{ eqMap[q.equipment]=(eqMap[q.equipment]||0)+(q.total_value||0) })
  const eqSorted=Object.entries(eqMap).sort((a,b)=>b[1]-a[1]).slice(0,6)
  const eqColors=['#3b82f6','#6366f1','#8b5cf6','#a855f7','#c084fc','#e879f9']

  function downloadCSV(){
    const rows=[['Quot No.','Date','Owner','Company','Equipment','Value','Margin%','Close','Status','Market']]
    filtered.forEach(q=>rows.push([
      'ISPL/Q/'+q.id?.slice(0,6), q.created_at?.slice(0,10)||'', q.owner_name||'',
      q.company||'', q.equipment, Math.round(q.total_value||0),
      Math.round(q.margin_pct||0)+'%', q.close_date||'', q.status||'Sent',
      q.market==='india'?'India':'Export'
    ]))
    const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')
    const a=document.createElement('a')
    a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv)
    a.download='shiftix_report_'+new Date().toISOString().slice(0,10)+'.csv'
    a.click()
  }

  const card={background:'white',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden',marginBottom:14}
  const th={textAlign:'left',padding:'8px 14px',fontSize:11,fontWeight:500,color:'#6b7280',background:'#f9fafb',borderBottom:'1px solid #f3f4f6'}
  const td={padding:'9px 14px',borderBottom:'1px solid #f9fafb',fontSize:12}

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar/>
      <main style={{flex:1,padding:24,overflowY:'auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <h1 style={{fontSize:20,fontWeight:600}}>Reports {isManager&&<span style={{fontSize:14,color:'#9ca3af',fontWeight:400}}> — All team</span>}</h1>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
          {[
            {label:'Total Quoted',value:fmtINR(tv),sub:filtered.length+' quotations',color:'#185FA5'},
            {label:'Won Revenue',value:fmtINR(wv),sub:won.length+' orders',color:'#3B6D11'},
            {label:'Avg Won Margin',value:avgMg+'%',sub:'across won orders',color:'#7c3aed'},
            {label:'Conversion Rate',value:cr+'%',sub:filtered.filter(q=>q.status==='Warm').length+' warm leads',color:'#f59e0b'},
          ].map(m=>(
            <div key={m.label} style={{background:'#f9fafb',borderRadius:12,padding:14,borderTop:`3px solid ${m.color}`}}>
              <div style={{fontSize:10,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:20,fontWeight:600,color:m.color}}>{m.value}</div>
              <div style={{fontSize:11,color:m.color,marginTop:2}}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          <div style={card}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',fontSize:13,fontWeight:600}}>Status Breakdown</div>
            <div style={{padding:14}}>
              {statuses.map((s,i)=>(
                <div key={s} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                    <span>{s}</span><span style={{fontWeight:500,color:stColors[i]}}>{stCounts[i]} · {fmtINR(stVals[i])}</span>
                  </div>
                  <div style={{height:6,background:'#f3f4f6',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${Math.round(stCounts[i]/maxCount*100)}%`,background:stColors[i],borderRadius:3}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{...card,marginBottom:10}}>
              <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',fontSize:13,fontWeight:600}}>Revenue by Equipment</div>
              <div style={{padding:14}}>
                {eqSorted.length===0?<div style={{fontSize:12,color:'#9ca3af',textAlign:'center',padding:16}}>No data yet</div>
                :eqSorted.map(([k,v],i)=>(
                  <div key={k} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                      <span style={{color:'#374151'}}>{k}</span>
                      <span style={{fontWeight:500,color:eqColors[i]}}>{fmtINR(v)}</span>
                    </div>
                    <div style={{height:5,background:'#f3f4f6',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${Math.round(v/(eqSorted[0][1]||1)*100)}%`,background:eqColors[i],borderRadius:3}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={card}>
              <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',fontSize:13,fontWeight:600}}>India vs Export</div>
              <div style={{padding:14}}>
                <div style={{display:'flex',height:16,borderRadius:8,overflow:'hidden',gap:2,marginBottom:8}}>
                  <div style={{flex:indPct,background:'#3b82f6',borderRadius:'8px 0 0 8px'}}/>
                  <div style={{flex:100-indPct,background:'#ec4899',borderRadius:'0 8px 8px 0'}}/>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#6b7280'}}>
                  <span>India {indPct}% — {fmtINR(indV)}</span>
                  <span>Export {100-indPct}% — {fmtINR(expV)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
            <span style={{fontSize:13,fontWeight:600}}>Quotation Report</span>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e5e7eb',borderRadius:6,fontSize:12}}/>
              <span style={{fontSize:12,color:'#9ca3af'}}>to</span>
              <input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{padding:'5px 8px',border:'1px solid #e5e7eb',borderRadius:6,fontSize:12}}/>
              <button onClick={downloadCSV} style={{padding:'6px 14px',background:'#3B6D11',color:'white',border:'none',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer'}}>Download CSV</button>
            </div>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
              <thead><tr>
                <th style={th}>Quot No.</th><th style={th}>Company</th><th style={th}>Equipment</th>
                <th style={th}>Value</th><th style={th}>Margin</th><th style={th}>Close</th>
                {isManager&&<th style={th}>Owner</th>}
                <th style={th}>Status</th><th style={th}>Market</th>
              </tr></thead>
              <tbody>
                {filtered.length===0
                  ?<tr><td colSpan={isManager?9:8} style={{...td,textAlign:'center',color:'#9ca3af',padding:32}}>No data in selected range</td></tr>
                  :filtered.map(q=>(
                    <tr key={q.id} onMouseOver={e=>e.currentTarget.style.background='#f9fafb'} onMouseOut={e=>e.currentTarget.style.background=''}>
                      <td style={{...td,fontFamily:'monospace',fontWeight:500}}>ISPL/Q/{q.id?.slice(0,6)}</td>
                      <td style={td}><div style={{fontWeight:500}}>{q.company}</div><div style={{fontSize:11,color:'#9ca3af'}}>{q.contact}</div></td>
                      <td style={td}><div>{q.equipment}</div>{q.sub_type&&<div style={{fontSize:11,color:'#9ca3af'}}>{q.sub_type}</div>}</td>
                      <td style={{...td,fontWeight:500}}>{fmtINR(q.total_value)}</td>
                      <td style={{...td,color:'#3B6D11',fontWeight:500}}>{Math.round(q.margin_pct||0)}%</td>
                      <td style={{...td,color:'#6b7280'}}>{q.close_date||'—'}</td>
                      {isManager&&<td style={{...td,color:'#6b7280'}}>{q.owner_name?.split(' ')[0]}</td>}
                      <td style={td}><StatusBadge status={q.status}/></td>
                      <td style={td}><span style={{padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:500,background:q.market==='india'?'#ede9fe':'#fce7f3',color:q.market==='india'?'#4c1d95':'#831843'}}>{q.market==='india'?'India':'Export'}</span></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
