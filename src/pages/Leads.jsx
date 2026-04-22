import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR } from '../api.js'

function rnd(a){ return a[Math.floor(Math.random()*a.length)] }
function ri(mn,mx){ return Math.floor(Math.random()*(mx-mn+1))+mn }

const EQUIPS = [
  {id:'ef',name:'Electric Forklift',sub:'1.5T–5T Li-Ion',color:'#185FA5',industries:['Automotive','Logistics & Warehousing','E-commerce','Pharmaceutical'],reasons:['Zero emission indoor ops','Lower running cost vs diesel','Battery-powered yard movement']},
  {id:'df',name:'Diesel Forklift',sub:'1.5T–10T Outdoor',color:'#854F0B',industries:['Steel & Metal','Port Logistics','Heavy Industry','Automotive'],reasons:['Heavy outdoor yard ops','Container stuffing','No charging infra needed']},
  {id:'rt',name:'Reach Truck',sub:'6m–12m high-bay',color:'#7c3aed',industries:['E-commerce','Logistics & Warehousing','Pharmaceutical','Retail'],reasons:['High-bay racking optimization','Narrow aisle storage','SKU density improvement']},
  {id:'bp',name:'BOPT',sub:'Battery Operated Pallet',color:'#0F6E56',industries:['FMCG','Food & Beverage','Retail','Cold Chain'],reasons:['Level-floor movement','Loading dock ops','Cold storage movement']},
  {id:'st',name:'Stacker',sub:'Electric walkie 1–2T',color:'#854F0B',industries:['Chemicals','Food & Beverage','Textile'],reasons:['Small-space stacking','Low-height racking','Manual-to-electric upgrade']},
  {id:'vn',name:'VNA',sub:'Very Narrow Aisle',color:'#0c447c',industries:['E-commerce','Pharmaceutical','Retail'],reasons:['Maximum space utilization','Ultra-narrow aisles','High-SKU density']},
  {id:'op',name:'Order Picker',sub:'Elevated picking',color:'#166534',industries:['E-commerce','Logistics','Automotive'],reasons:['SKU-level picking','Order fulfillment accuracy','High-velocity picking zones']},
  {id:'oe',name:'OEHPT',sub:'Over Electric High Platform',color:'#7c2d12',industries:['Automotive','Steel & Metal','Port Logistics'],reasons:['High-platform access','Heavy load at height']},
  {id:'eh',name:'EHPT',sub:'Electric High Platform',color:'#991b1b',industries:['FMCG','Food & Beverage','Retail'],reasons:['Medium-height shelf access','Supermarket replenishment']},
  {id:'ht',name:'HPT',sub:'Hand / Electric Pallet',color:'#374151',industries:['FMCG','Retail','Food & Beverage'],reasons:['Low-investment upgrade','Short-distance pallet move']},
]

const CO_TYPES = {
  'Automotive':['Auto Component Maker','OEM Tier-1 Supplier'],'Logistics & Warehousing':['3PL Operator','Distribution Center'],
  'E-commerce':['Fulfillment Center','D2C Brand Warehouse'],'Pharmaceutical':['Pharma Manufacturer','API Distributor'],
  'Steel & Metal':['Steel Processor','Metal Fabricator'],'Food & Beverage':['Beverage Manufacturer','Food Processing Plant'],
  'FMCG':['FMCG Distributor','Consumer Goods Manufacturer'],'Retail':['Hypermarket Chain','Supermarket Operator'],
  'Cold Chain':['Cold Chain Logistics','Frozen Foods DC'],'Port Logistics':['CFS Operator','ICD Logistics'],
  'Heavy Industry':['Heavy Engineering Plant','Industrial Manufacturer'],'Chemicals':['Chemical Manufacturer','Plastics Processor'],
  'Textile':['Textile Manufacturer','Garment Exporter'],
}

const PERSONS = ['Rajesh Verma','Priya Sharma','Amit Patel','Sunita Joshi','Vikram Singh','Ananya Nair','Deepak Mehta','Kavita Reddy']
const CITIES  = ['Mumbai','Pune','Delhi NCR','Bangalore','Chennai','Hyderabad','Ahmedabad','Kolkata','Nashik','Bhiwandi']

export default function Leads() {
  const navigate = useNavigate()
  const [selEquips, setSelEquips] = useState([])
  const [industry, setIndustry] = useState('')
  const [city, setCity] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [pushed, setPushed] = useState({})

  function toggleEq(id){ setSelEquips(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]) }

  function generate(){
    if(!selEquips.length){ alert('Select at least one equipment'); return }
    setLoading(true)
    setTimeout(()=>{
      const all=[]
      selEquips.forEach(eid=>{
        const eq=EQUIPS.find(e=>e.id===eid); if(!eq) return
        const inds=industry?[industry]:eq.industries
        for(let i=0;i<ri(3,5);i++){
          const ind=rnd(inds), types=CO_TYPES[ind]||['Industrial Company']
          const person=rnd(PERSONS), units=ri(1,5)
          all.push({ id:eid+Date.now()+i, equipment:eq.name, eqColor:eq.color,
            industry:ind, companyType:rnd(types), city:city||rnd(CITIES),
            contactName:person, email:person.split(' ')[0].toLowerCase()+'@company.in',
            phone:'+91 '+ri(70000,99999)+''+ri(10000,99999),
            score:ri(55,95), units, estValue:units*ri(200000,600000), reason:rnd(eq.reasons) })
        }
      })
      all.sort((a,b)=>b.score-a.score)
      setResults(all); setLoading(false)
    },700)
  }

  async function pushLead(lead){
    await apiFetch('/api/leads',{method:'POST',body:JSON.stringify(lead)})
    setPushed(p=>({...p,[lead.id]:true}))
  }

  async function pushAndEmail(lead){ await pushLead(lead); navigate('/email') }

  function exportCSV(){
    const rows=[['Equipment','Company','Industry','City','Contact','Email','Phone','Units','Est.Value','Score']]
    results.forEach(l=>rows.push([l.equipment,l.companyType,l.industry,l.city,l.contactName,l.email,l.phone,l.units,Math.round(l.estValue),l.score+'%']))
    const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n')
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv)
    a.download='shiftix_leads.csv'; a.click()
  }

  const sc=s=>s>=80?'#3B6D11':s>=65?'#854F0B':'#475569'
  const sf=s=>s>=80?'#22c55e':s>=65?'#f59e0b':'#94a3b8'
  const btn=(bg,c='white')=>({padding:'7px 14px',background:bg,color:c,border:'none',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer'})

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar/>
      <main style={{flex:1,padding:24,overflowY:'auto'}}>
        <h1 style={{fontSize:20,fontWeight:600,marginBottom:20}}>Lead Finder</h1>

        <div style={{background:'white',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:13,fontWeight:600}}>Select Equipment Type</span>
            <span style={{fontSize:12,color:'#9ca3af'}}>Multi-select allowed</span>
          </div>
          <div style={{padding:14,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
            {EQUIPS.map(e=>(
              <button key={e.id} onClick={()=>toggleEq(e.id)}
                style={{padding:'10px',borderRadius:10,border:selEquips.includes(e.id)?'2px solid #185FA5':'1px solid #e5e7eb',background:selEquips.includes(e.id)?'#eff6ff':'white',cursor:'pointer',textAlign:'left'}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  <div style={{width:22,height:22,borderRadius:4,background:e.color+'22',color:e.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>{e.id.toUpperCase().slice(0,2)}</div>
                  <span style={{fontSize:11,fontWeight:500,color:selEquips.includes(e.id)?'#1e40af':'#374151'}}>{e.name}</span>
                </div>
                <div style={{fontSize:10,color:'#9ca3af'}}>{e.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'white',borderRadius:12,border:'1px solid #e5e7eb',marginBottom:14}}>
          <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6'}}><span style={{fontSize:13,fontWeight:600}}>Filters</span></div>
          <div style={{padding:14,display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:12,alignItems:'end'}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:500,color:'#6b7280',marginBottom:4}}>Industry</label>
              <select style={{width:'100%',padding:'8px 10px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:12,background:'white'}} value={industry} onChange={e=>setIndustry(e.target.value)}>
                <option value="">All Industries</option>
                {[...new Set(EQUIPS.flatMap(e=>e.industries))].map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:500,color:'#6b7280',marginBottom:4}}>City</label>
              <select style={{width:'100%',padding:'8px 10px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:12,background:'white'}} value={city} onChange={e=>setCity(e.target.value)}>
                <option value="">All Cities</option>
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={generate} disabled={loading} style={{...btn('#0c1a2e'),flex:1,marginTop:20}}>{loading?'Generating...':'Generate Leads'}</button>
              <button onClick={()=>{setSelEquips([]);setResults([]);setIndustry('');setCity('')}} style={{...btn('#f3f4f6','#374151'),marginTop:20}}>Clear</button>
            </div>
          </div>
        </div>

        {results.length>0&&<>
          <div style={{background:'white',borderRadius:12,border:'1px solid #e5e7eb',marginBottom:12}}>
            <div style={{padding:14,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
              <div><div style={{fontSize:10,color:'#9ca3af',marginBottom:3}}>LEADS FOUND</div><div style={{fontSize:20,fontWeight:600}}>{results.length}</div></div>
              <div><div style={{fontSize:10,color:'#9ca3af',marginBottom:3}}>HIGH PRIORITY</div><div style={{fontSize:20,fontWeight:600,color:'#3B6D11'}}>{results.filter(r=>r.score>=80).length}</div></div>
              <div><div style={{fontSize:10,color:'#9ca3af',marginBottom:3}}>EST. VALUE</div><div style={{fontSize:20,fontWeight:600,color:'#185FA5'}}>{fmtINR(results.reduce((s,r)=>s+r.estValue,0))}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <button onClick={()=>results.forEach(l=>pushLead(l))} style={{...btn('#3B6D11'),flex:1}}>Push All</button>
                <button onClick={exportCSV} style={btn('#f3f4f6','#374151')}>CSV</button>
              </div>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {results.map(l=>(
              <div key={l.id} style={{background:'white',border:`1px solid ${pushed[l.id]?'#3B6D11':'#e5e7eb'}`,borderRadius:12,padding:14,display:'grid',gridTemplateColumns:'1fr 72px',gap:12}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:30,height:30,borderRadius:7,background:l.eqColor+'22',color:l.eqColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>{l.equipment.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{l.companyType}</div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>{l.industry} · {l.city}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:7}}>
                    <span style={{background:'#dbeafe',color:'#1e40af',padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:500}}>{l.equipment}</span>
                    <span style={{background:'#f3f4f6',color:'#6b7280',padding:'2px 8px',borderRadius:12,fontSize:11}}>{l.units} unit{l.units>1?'s':''}</span>
                    <span style={{background:'#eff6ff',color:'#185FA5',padding:'2px 8px',borderRadius:12,fontSize:11,fontWeight:500}}>{fmtINR(l.estValue)}</span>
                  </div>
                  <div style={{fontSize:11,color:'#9ca3af',borderLeft:'2px solid #e5e7eb',paddingLeft:8,marginBottom:7,fontStyle:'italic'}}>{l.reason}</div>
                  <div style={{fontSize:11,color:'#6b7280',marginBottom:10}}>Contact: <strong style={{color:'#374151'}}>{l.contactName}</strong> · {l.email} · {l.phone}</div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={()=>pushLead(l)} disabled={pushed[l.id]} style={btn(pushed[l.id]?'#3B6D11':'#0c1a2e')}>{pushed[l.id]?'✓ Pushed':'Push to Email'}</button>
                    <button onClick={()=>pushAndEmail(l)} style={btn('#0F6E56')}>Push & Open Email</button>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:10,color:'#9ca3af',marginBottom:2}}>Score</div>
                  <div style={{fontSize:22,fontWeight:600,color:sc(l.score)}}>{l.score}%</div>
                  <div style={{height:5,background:'#f3f4f6',borderRadius:3,overflow:'hidden',marginTop:4}}>
                    <div style={{height:'100%',width:l.score+'%',background:sf(l.score),borderRadius:3}}/>
                  </div>
                  <div style={{fontSize:10,color:'#9ca3af',marginTop:3}}>{l.score>=80?'High':l.score>=65?'Medium':'Low'}</div>
                </div>
              </div>
            ))}
          </div>
        </>}
      </main>
    </div>
  )
}
