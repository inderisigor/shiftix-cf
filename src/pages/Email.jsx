import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { apiFetch, fmtINR, getUser } from '../api.js'

const TPLS = {
  intro:    (eq,city)=>`I hope this message finds you well.\n\nI am reaching out from INTRA SHIFTIX PVT LTD, a leading material handling equipment company based in Mumbai, specialising in HELI forklifts, reach trucks, BOPTs, stackers, and all MHE solutions.\n\nWe believe our ${eq||'equipment'} solutions could bring measurable productivity improvements to your operations in ${city||'your facility'}.`,
  formal:   (eq)=>`Thank you for the opportunity to present our proposal.\n\nWe at INTRA SHIFTIX PVT LTD are pleased to submit our quotation for your consideration. Our team has tailored this offer to best suit your requirements for ${eq||'material handling equipment'}.`,
  followup: ()=>`I hope this message finds you well.\n\nWe are following up on our earlier quotation and would like to understand where you are in your evaluation process. We remain keen to support your material handling requirements.`,
  cold:     (eq,city)=>`Greetings from INTRA SHIFTIX PVT LTD, Mumbai!\n\nWe are a specialist MHE company supplying HELI-brand ${eq||'equipment'} across India and internationally. Companies in your sector have seen 20-30% productivity improvement with our solutions in ${city||'your region'}.`,
}

export default function Email() {
  const [searchParams] = useSearchParams()
  const preloadId = searchParams.get('quotId')
  const user = getUser()
  const [quots, setQuots] = useState([])
  const [selQuot, setSelQuot] = useState(null)
  const [attached, setAttached] = useState(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [preview, setPreview] = useState('')
  const [form, setForm] = useState({ to:'',cc:'',subject:'',salutation:'',notes:'',template:'intro' })

  function setF(k,v){ setForm(f=>({...f,[k]:v})) }

  useEffect(()=>{
    apiFetch('/api/quotations').then(d=>{
      const arr=Array.isArray(d)?d:[]
      setQuots(arr)
      if(preloadId){ const q=arr.find(x=>x.id===preloadId); if(q) loadQuot(q) }
    })
  },[preloadId])

  function loadQuot(q){
    setSelQuot(q); setAttached(q)
    setF('to',q.email||'')
    setF('subject',`Quotation ISPL/Q/${q.id?.slice(0,6)} — ${q.equipment}${q.sub_type?' ('+q.sub_type+')':''} — Intra Shiftix Pvt Ltd`)
    setF('salutation',`Dear ${q.contact?q.contact.split(' ').pop():'Sir/Madam'},`)
    setF('template','formal')
  }

  function genPreview(){
    const fn=TPLS[form.template]||TPLS.intro
    const base=fn(selQuot?.equipment,selQuot?.city)
    const det=selQuot?`\n\nQuotation Summary:\n  Reference: ISPL/Q/${selQuot.id?.slice(0,6)}\n  Equipment: ${selQuot.equipment}${selQuot.sub_type?' — '+selQuot.sub_type:''}\n  Qty: ${selQuot.quantity} unit(s)\n  Value (excl. GST): ${fmtINR(selQuot.total_value)}\n\nPlease find the quotation attached for your review.`:''
    const extra=form.notes?`\n\n${form.notes}`:''
    const closing=`\n\nWe would welcome a brief call or site visit at your convenience.\n\nWarm Regards,\n${user.name}\nIntra Shiftix Pvt Ltd\nD-08, Ground Floor, Eastern Business District, LBS Marg, Bhandup West, Mumbai - 400078\nPh: +91-9004450518 | info@shiftix.in | www.shiftix.in`
    setPreview(`To: ${form.to||'—'}\nCC: ${form.cc||'—'}\nSubject: ${form.subject}${attached?`\nAttachment: ISPL-Q-${attached.id?.slice(0,6)}.pdf`:''}\n\n${form.salutation}\n\n${base}${det}${extra}${closing}`)
  }

  async function handleSend(){
    if(!form.to){ alert('Enter recipient email'); return }
    if(!form.subject){ alert('Enter subject'); return }
    if(!preview){ alert('Generate preview first'); return }
    setSending(true)
    const data=await apiFetch('/api/email',{method:'POST',body:JSON.stringify({to:form.to,cc:form.cc,subject:form.subject,body:preview})})
    if(data?.success){ setSent(true) } else { alert('Send failed: '+(data?.error||'Unknown')) }
    setSending(false)
  }

  function openMail(){
    window.open(`mailto:${form.to}?cc=${form.cc}&subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(preview)}`)
    if(attached) alert('Mail client opened! Please manually attach the PDF.')
  }

  const inp={width:'100%',padding:'8px 10px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:12,outline:'none',boxSizing:'border-box'}
  const lbl={display:'block',fontSize:11,fontWeight:500,color:'#6b7280',marginBottom:4}
  const btn=(bg,c='white')=>({padding:'8px 14px',background:bg,color:c,border:'none',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer'})

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar/>
      <main style={{flex:1,padding:24,overflowY:'auto'}}>
        <h1 style={{fontSize:20,fontWeight:600,marginBottom:20}}>Email Composer</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{background:'white',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',fontSize:13,fontWeight:600}}>Compose</div>
            <div style={{padding:16,display:'flex',flexDirection:'column',gap:10}}>
              <div>
                <label style={lbl}>Load from Quotation</label>
                <select style={inp} onChange={e=>{const q=quots.find(x=>x.id===e.target.value);if(q)loadQuot(q)}}>
                  <option value="">— Select quotation to auto-fill —</option>
                  {quots.map(q=><option key={q.id} value={q.id}>ISPL/Q/{q.id?.slice(0,6)} — {q.company} — {q.equipment}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>PDF Attachment</label>
                {attached?(
                  <div style={{display:'flex',alignItems:'center',gap:10,background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 12px'}}>
                    <div style={{width:30,height:30,background:'#fee2e2',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#dc2626',flexShrink:0}}>PDF</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:500}}>ISPL-Q-{attached.id?.slice(0,6)} — {attached.company}.pdf</div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>{attached.equipment} | {attached.quantity} unit(s) | {fmtINR(attached.total_value)}</div>
                    </div>
                    <button onClick={()=>setAttached(null)} style={{background:'none',border:'none',color:'#dc2626',cursor:'pointer',fontSize:16}}>✕</button>
                  </div>
                ):(
                  <select style={inp} onChange={e=>{const q=quots.find(x=>x.id===e.target.value);if(q)setAttached(q)}}>
                    <option value="">— Attach a quotation PDF —</option>
                    {quots.map(q=><option key={q.id} value={q.id}>ISPL/Q/{q.id?.slice(0,6)} — {q.company}</option>)}
                  </select>
                )}
              </div>
              <div><label style={lbl}>To *</label><input style={inp} type="email" value={form.to} onChange={e=>setF('to',e.target.value)} placeholder="customer@company.com"/></div>
              <div><label style={lbl}>CC</label><input style={inp} value={form.cc} onChange={e=>setF('cc',e.target.value)} placeholder="cc@company.com"/></div>
              <div><label style={lbl}>Subject *</label><input style={inp} value={form.subject} onChange={e=>setF('subject',e.target.value)} placeholder="Subject line"/></div>
              <div><label style={lbl}>Salutation</label><input style={inp} value={form.salutation} onChange={e=>setF('salutation',e.target.value)} placeholder="Dear Mr. Sharma,"/></div>
              <div>
                <label style={lbl}>Template</label>
                <select style={inp} value={form.template} onChange={e=>setF('template',e.target.value)}>
                  <option value="intro">First Introduction</option>
                  <option value="formal">Formal / Corporate</option>
                  <option value="followup">Follow-up</option>
                  <option value="cold">Cold Outreach</option>
                </select>
              </div>
              <div><label style={lbl}>Additional Notes</label><textarea style={{...inp,resize:'vertical',minHeight:60}} value={form.notes} onChange={e=>setF('notes',e.target.value)} placeholder="Additional context..."/></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={genPreview} style={{...btn('#0c1a2e'),flex:1}}>Generate Preview</button>
                <button onClick={openMail} style={btn('#0F6E56')}>Open in Mail</button>
                <button onClick={()=>navigator.clipboard.writeText(preview)} style={btn('#f3f4f6','#374151')}>Copy</button>
              </div>
              {sent&&<div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#166534'}}>✓ Email sent via Resend!</div>}
              {attached&&<div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#92400e'}}>ℹ️ "Open in Mail" → attach PDF manually from Quotations page.</div>}
              <button onClick={handleSend} disabled={sending} style={btn('#3B6D11')}>
                {sending?'Sending...':`Send via Resend${attached?' (with attachment)':''}`}
              </button>
            </div>
          </div>
          <div style={{background:'white',borderRadius:12,border:'1px solid #e5e7eb',overflow:'hidden'}}>
            <div style={{padding:'11px 16px',borderBottom:'1px solid #f3f4f6',fontSize:13,fontWeight:600}}>Email Preview</div>
            <div style={{padding:16}}>
              {preview
                ?<pre style={{fontSize:11,fontFamily:'monospace',background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:8,padding:14,whiteSpace:'pre-wrap',overflowY:'auto',maxHeight:480,color:'#374151'}}>{preview}</pre>
                :<div style={{fontSize:13,color:'#9ca3af',textAlign:'center',padding:'80px 0'}}>Select a quotation and click Generate Preview</div>
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
