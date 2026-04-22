import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR, getUser } from '../api.js'

const SUBTYPES = {
  'Electric Forklift': ['CPD15-A7 1.5T Li-Ion','CPD20-A7 2T Li-Ion','CPD25-A7 2.5T Li-Ion','CPD30-A7 3T Li-Ion','CPD35-A7 3.5T Li-Ion'],
  'Diesel Forklift':   ['H15 1.5T Diesel','H20 2T Diesel','H25 2.5T Diesel','H30 3T Diesel','H35 3.5T Diesel'],
  'Reach Truck':       ['CQD14-A4LI 1.4T','CQD16-A4LI 1.6T','CQD20-A7LI 2T','RS14-27 1.4T'],
  'BOPT':              ['CBD10 1T','CBD15 1.5T','CBD20 2T','CBD25 2.5T'],
  'Stacker':           ['CDD10 1T','CDD15 1.5T','CDD20 2T'],
  'VNA':               ['VNA14-A 1.4T','VNA16-A 1.6T','VNA20-A 2T'],
  'Order Picker':      ['CQD10H Low-Level','CQD10H Mid-Level','CQD10H High-Level'],
  'OEHPT':             ['PTE10-A 1T','PTE15-A 1.5T'],
  'EHPT':              ['PSE10-A 1T','PSE15-A 1.5T'],
  'HPT':               ['HPT25 2.5T Manual','HPT30 3T Manual','EHPT20 2T Electric'],
}
const HSN = { 'Diesel Forklift':'8427.20.00' }

function calc(usd, er, fr, mg, qty) {
  if (!usd) return null
  const ui=usd*er, ins=(ui+fr)*0.0113, cif=ui+fr+ins
  const bcd=cif*0.075, cess=bcd*0.1, igst=(cif+bcd+cess)*0.18
  const cha=cif*0.005, stamp=cif*0.001
  const landed=cif+bcd+cess+igst+cha+stamp
  const net=landed-igst, quoted=net*(1+mg/100)
  const mval=quoted-net, total=quoted*qty
  return { cif:Math.round(cif), landed:Math.round(landed), net:Math.round(net), quoted:Math.round(quoted), mval:Math.round(mval), total:Math.round(total) }
}

export default function NewQuotation() {
  const navigate = useNavigate()
  const user = getUser()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(null)
  const [form, setForm] = useState({
    market:'india', company:'', contact:'', email:'', phone:'', city:'',
    gstNumber:'', country:'', currency:'USD',
    equipment:'', subType:'', model:'',
    quantity:1, usdPrice:'', exchangeRate:91, freight:80000, marginPct:25,
    closeDate:'', notes:''
  })

  function set(k,v){ setForm(f=>({...f,[k]:v})) }
  const subtypes = SUBTYPES[form.equipment] || []
  const pricing = calc(parseFloat(form.usdPrice), parseFloat(form.exchangeRate), parseFloat(form.freight), parseFloat(form.marginPct), parseInt(form.quantity)||1)

  useEffect(() => { if (subtypes.length) set('subType', subtypes[0]) }, [form.equipment])

  async function handleSave() {
    if (!form.company){ alert('Enter company name'); return }
    if (!form.equipment){ alert('Select equipment'); return }
    if (!form.usdPrice){ alert('Enter USD price'); return }
    setSaving(true)
    const data = await apiFetch('/api/quotations', { method:'POST', body: JSON.stringify(form) })
    if (data?.id){ setSaved(data); setSaving(false) }
    else { alert('Save failed'); setSaving(false) }
  }

  function printPDF() {
    if (!saved){ alert('Save first'); return }
    const qno = `ISPL/Q/${saved.id?.slice(0,6)}/${saved.created_at?.slice(0,10)||''}`
    const hsn = HSN[saved.equipment] || '8427.10.00'
    const eqFull = saved.equipment + (saved.sub_type ? ` — ${saved.sub_type}` : '')
    const w = window.open('','_blank')
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${qno}</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;color:#111;margin:0;padding:20px}
.hdr{background:#111827;display:flex;justify-content:space-between;align-items:center;padding:10px 16px}
.logo{background:white;padding:3px 10px;border-radius:2px;font-size:14px;font-weight:900;color:#111827;letter-spacing:.06em}
.co{font-size:10px;font-weight:700;color:white;letter-spacing:.1em}
.addr{padding:7px 16px;background:#f9fafb;font-size:8px;color:#374151;border-bottom:1px solid #e5e7eb}
.rule{height:3px;background:#111827}.body{padding:14px 16px}
.cbar{background:#111827;text-align:center;padding:5px;margin:8px 0}
.cbar span{color:white;font-size:11px;font-weight:700;letter-spacing:.06em}
.sbar{background:#111827;display:inline-block;padding:3px 8px;margin-bottom:7px}
.sbar span{color:white;font-size:9px;font-weight:700}
table{width:100%;border-collapse:collapse;margin-bottom:10px}
th{background:#111827;color:white;padding:5px 7px;text-align:center;font-size:8.5px}
td{border:1px solid #d1d5db;padding:5px 7px;font-size:8.5px}
.lbl{font-weight:700;background:#f9fafb;width:28%}
.nb td{border:none;border-bottom:.5px solid #f3f4f6;padding:4px 0}
.tot td{border:none;border-top:2px solid #111827;padding-top:6px;font-size:12px;font-weight:700}
.tc td{border:.5px solid #e5e7eb;font-size:8px;padding:4px 6px}
.foot{border-top:1px solid #e5e7eb;padding:8px 16px;display:flex;justify-content:space-around;font-size:8.5px;color:#374151}
@media print{@page{margin:10mm}}</style></head>
<body onload="window.print()">
<div class="hdr"><div class="logo">SHIFTIX</div><div class="co">INTRA SHIFTIX PVT LTD</div></div>
<div class="addr">D-08, Ground Floor, Eastern Business District, LBS Marg, Bhandup West, Mumbai - 400078 | GST: 27AAICI1434M1ZD | CIN: U46599MH2025PTC445318</div>
<div class="rule"></div><div class="body">
<div class="cbar"><span>QUOTATION</span></div>
<table><thead><tr><th>Quotation No.</th><th>Date</th><th>Prepared By</th><th>Valid For</th></tr></thead>
<tbody><tr>
<td style="text-align:center">${qno}</td>
<td style="text-align:center">${saved.created_at?.slice(0,10)||''}</td>
<td style="text-align:center">${user.name}</td>
<td style="text-align:center">30 Days</td>
</tr></tbody></table>
<table>
<tr><td class="lbl">Company Name</td><td colspan="3">${saved.company}</td></tr>
<tr><td class="lbl">Contact Person</td><td>${saved.contact||'—'}</td><td class="lbl">Location</td><td>${saved.city||'—'}</td></tr>
<tr><td class="lbl">Email</td><td>${saved.email||'—'}</td><td class="lbl">Phone</td><td>${saved.phone||'—'}</td></tr>
${saved.gst_number?`<tr><td class="lbl">GST No.</td><td colspan="3">${saved.gst_number}</td></tr>`:''}
</table>
<div class="sbar"><span>Commercial Offer — ${eqFull}</span></div>
<table class="nb" style="font-size:9.5px">
<tr><td style="font-weight:700">Unit Price (excl. GST)</td><td>Rs.</td><td style="text-align:right;font-weight:600">${fmtINR(saved.quoted_price)}</td></tr>
<tr><td style="font-weight:700">Quantity</td><td></td><td style="text-align:right;font-weight:600">${saved.quantity} unit(s)</td></tr>
<tr class="tot"><td><b>Total Price (excl. GST)</b></td><td><b>Rs.</b></td><td style="text-align:right"><b>${fmtINR(saved.total_value)}</b></td></tr>
</table>
<div class="sbar" style="margin-top:10px"><span>Terms and Conditions</span></div>
<table class="tc">
<tr><td style="font-weight:700;background:#f9fafb;width:35%">Payment Terms</td><td>50% advance with PO, 50% before dispatch</td></tr>
<tr><td style="font-weight:700;background:#f9fafb">Delivery Period</td><td>14-16 weeks from advance payment</td></tr>
<tr><td style="font-weight:700;background:#f9fafb">Warranty</td><td>12 months or 600 hrs whichever is earlier</td></tr>
<tr><td style="font-weight:700;background:#f9fafb">Taxes</td><td>GST @18% extra at customer scope</td></tr>
<tr><td style="font-weight:700;background:#f9fafb">Offer Validity</td><td>30 days from submission</td></tr>
<tr><td style="font-weight:700;background:#f9fafb">HSN Code</td><td>${hsn}</td></tr>
</table>
${saved.notes?`<p style="font-size:8px;color:#6b7280;margin-top:8px"><b>Notes:</b> ${saved.notes}</p>`:''}
<p style="margin-top:16px;font-size:9px">Yours Faithfully,<br><b>${user.name}</b><br>Intra Shiftix Pvt Ltd<br>+91-9004450518 | info@shiftix.in | www.shiftix.in</p>
</div>
<div class="foot"><span>+91-9004450518</span><span>info@shiftix.in</span><span>www.shiftix.in</span></div>
</body></html>`)
    w.document.close()
  }

  const inp = { width:'100%', padding:'8px 10px', border:'1px solid #e5e7eb', borderRadius:8, fontSize:12, outline:'none', boxSizing:'border-box' }
  const lbl = { display:'block', fontSize:11, fontWeight:500, color:'#6b7280', marginBottom:4 }
  const card = { background:'white', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden', marginBottom:16 }
  const ph = { padding:'11px 16px', borderBottom:'1px solid #f3f4f6', fontSize:13, fontWeight:600 }
  const pb = { padding:'14px 16px' }
  const g2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }
  const btn = (bg,c='white') => ({ padding:'8px 16px', background:bg, color:c, border:'none', borderRadius:8, fontSize:12, fontWeight:500, cursor:'pointer' })

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, padding:24, overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h1 style={{ fontSize:20, fontWeight:600 }}>New Quotation</h1>
          {saved && <span style={{ color:'#3B6D11', fontSize:13, fontWeight:500 }}>✓ Saved as ISPL/Q/{saved.id?.slice(0,6)}</span>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div style={card}>
            <div style={ph}>Customer Details</div>
            <div style={pb}>
              <div style={{ marginBottom:10 }}>
                <label style={lbl}>Market Type</label>
                <select style={inp} value={form.market} onChange={e=>set('market',e.target.value)}>
                  <option value="india">India (Domestic)</option>
                  <option value="export">Export (Outside India)</option>
                </select>
              </div>
              <div style={g2}>
                <div><label style={lbl}>Company Name *</label><input style={inp} value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Company name"/></div>
                <div><label style={lbl}>Contact Person</label><input style={inp} value={form.contact} onChange={e=>set('contact',e.target.value)} placeholder="Full name"/></div>
              </div>
              <div style={g2}>
                <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@company.com"/></div>
                <div><label style={lbl}>Phone</label><input style={inp} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 XXXXX XXXXX"/></div>
              </div>
              <div style={g2}>
                <div><label style={lbl}>City</label><input style={inp} value={form.city} onChange={e=>set('city',e.target.value)} placeholder="City, State"/></div>
                {form.market==='india'
                  ?<div><label style={lbl}>GST Number</label><input style={inp} value={form.gstNumber} onChange={e=>set('gstNumber',e.target.value)} placeholder="27AAAAA0000A1ZA"/></div>
                  :<div><label style={lbl}>Country</label><input style={inp} value={form.country} onChange={e=>set('country',e.target.value)} placeholder="Country"/></div>}
              </div>
            </div>
          </div>

          <div style={card}>
            <div style={ph}>Equipment & Pricing</div>
            <div style={pb}>
              <div style={g2}>
                <div>
                  <label style={lbl}>Equipment Category *</label>
                  <select style={inp} value={form.equipment} onChange={e=>set('equipment',e.target.value)}>
                    <option value="">Select...</option>
                    <optgroup label="Forklift"><option>Electric Forklift</option><option>Diesel Forklift</option></optgroup>
                    <optgroup label="Warehouse">{Object.keys(SUBTYPES).filter(e=>!e.includes('Forklift')).map(e=><option key={e}>{e}</option>)}</optgroup>
                  </select>
                </div>
                {subtypes.length>0&&<div>
                  <label style={lbl}>Model / Capacity</label>
                  <select style={inp} value={form.subType} onChange={e=>{set('subType',e.target.value);set('model',e.target.value)}}>
                    {subtypes.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>}
              </div>
              <div style={{ marginBottom:10 }}><label style={lbl}>Model / Spec</label><input style={inp} value={form.model} onChange={e=>set('model',e.target.value)} placeholder="e.g. CPD20-A7 2T Li-Ion"/></div>
              <div style={g2}>
                <div><label style={lbl}>Quantity</label><input style={inp} type="number" min="1" value={form.quantity} onChange={e=>set('quantity',e.target.value)}/></div>
                <div><label style={lbl}>USD Price (FOB)</label><input style={inp} type="number" value={form.usdPrice} onChange={e=>set('usdPrice',e.target.value)} placeholder="11300"/></div>
              </div>
              <div style={g2}>
                <div><label style={lbl}>Exchange Rate (Rs/USD)</label><input style={inp} type="number" value={form.exchangeRate} onChange={e=>set('exchangeRate',e.target.value)}/></div>
                <div><label style={lbl}>Sea Freight/unit (Rs)</label><input style={inp} type="number" value={form.freight} onChange={e=>set('freight',e.target.value)}/></div>
              </div>
              <div style={g2}>
                <div><label style={lbl}>Margin %</label><input style={inp} type="number" value={form.marginPct} onChange={e=>set('marginPct',e.target.value)}/></div>
                <div><label style={lbl}>Expected Close Date</label><input style={inp} type="date" value={form.closeDate} onChange={e=>set('closeDate',e.target.value)}/></div>
              </div>
              <div><label style={lbl}>Notes</label><textarea style={{...inp,resize:'vertical',minHeight:52}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Accessories, requirements..."/></div>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={ph}>Auto-Calculated Pricing (BCD 7.5% + IGST 18%)</div>
          <div style={pb}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:14, marginBottom:10 }}>
              {[['CIF Value',pricing?.cif],['Landed Cost (with IGST)',pricing?.landed],['Net Purchase Price',pricing?.net]].map(([l,v])=>(
                <div key={l}><div style={{ fontSize:11, color:'#185FA5', marginBottom:4 }}>{l}</div><div style={{ fontSize:16, fontWeight:600, color:'#1e3a8a' }}>{v?fmtINR(v):'—'}</div></div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:10, padding:14, marginBottom:14 }}>
              {[['Quoted Price/unit',pricing?.quoted],['Margin Value',pricing?.mval],[`Total (${form.quantity||1}×Quoted)`,pricing?.total]].map(([l,v])=>(
                <div key={l}><div style={{ fontSize:11, color:'#166534', marginBottom:4 }}>{l}</div><div style={{ fontSize:16, fontWeight:600, color:'#14532d' }}>{v?fmtINR(v):'—'}</div></div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={printPDF} style={btn('#f3f4f6','#374151')}>Preview & Print PDF</button>
              <button onClick={handleSave} disabled={saving} style={btn('#0c1a2e')}>{saving?'Saving...':'+ Save Quotation'}</button>
              {saved&&<>
                <button onClick={printPDF} style={btn('#3B6D11')}>Download PDF</button>
                <button onClick={()=>navigate(`/email?quotId=${saved.id}`)} style={btn('#0F6E56')}>Attach & Send Email</button>
              </>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
