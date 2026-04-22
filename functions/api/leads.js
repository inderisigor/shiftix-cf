import { getUser, unauthorized } from '../_auth.js'

export async function onRequestGet(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const where = user.role === 'manager' ? '' : 'WHERE owner_id = ?'
  const params = user.role === 'manager' ? [] : [user.id]

  const result = await context.env.DB.prepare(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC`
  ).bind(...params).all()

  return Response.json(result.results || [])
}

export async function onRequestPost(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const body = await context.request.json()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await context.env.DB.prepare(`
    INSERT INTO leads (id, owner_id, equipment, company_type, industry, city, size, turnover, contact_name, email, phone, score, est_value, units, reason, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id, user.id, body.equipment||'', body.companyType||'', body.industry||'',
    body.city||'', body.size||'', body.turnover||'', body.contactName||'',
    body.email||'', body.phone||'', body.score||70, body.estValue||0,
    body.units||1, body.reason||'', now
  ).run()

  return Response.json({ id, ...body })
}
