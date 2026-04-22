import { getUser, unauthorized } from '../_auth.js'

export async function onRequestPost(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const { to, cc, subject, body } = await context.request.json()

  if (!to || !subject) {
    return Response.json({ error: 'Missing to or subject' }, { status: 400 })
  }

  const userData = await context.env.DB.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(user.id).first()

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px">
      <div style="background:#111827;padding:12px 20px;display:flex;justify-content:space-between;align-items:center">
        <div style="background:white;padding:3px 10px;font-size:16px;font-weight:900;color:#111827;letter-spacing:0.06em">SHIFTIX</div>
        <div style="color:white;font-size:10px;font-weight:700">INTRA SHIFTIX PVT LTD</div>
      </div>
      <div style="padding:24px 20px;line-height:1.7;font-size:14px">${body.replace(/\n/g, '<br>')}</div>
      <div style="border-top:1px solid #e5e7eb;padding:16px 20px;font-size:12px;color:#6b7280">
        <strong style="color:#111">${userData?.name || user.name}</strong><br>
        Intra Shiftix Pvt Ltd<br>
        D-08, Ground Floor, Eastern Business District, LBS Marg, Bhandup West, Mumbai - 400078<br>
        Ph: +91-9004450518 | info@shiftix.in | www.shiftix.in
      </div>
    </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${context.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: context.env.EMAIL_FROM || 'SHIFTIX CRM <onboarding@resend.dev>',
        to: [to],
        cc: cc ? [cc] : undefined,
        subject,
        html: htmlBody
      })
    })
    const data = await res.json()
    if (data.id) return Response.json({ success: true, id: data.id })
    return Response.json({ error: data.message || 'Send failed' }, { status: 500 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
