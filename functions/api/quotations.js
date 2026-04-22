import { getUser, unauthorized } from '../_auth.js'

export async function onRequestGet(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const where = user.role === 'manager' ? '' : 'WHERE q.owner_id = ?'
  const params = user.role === 'manager' ? [] : [user.id]

  const result = await context.env.DB.prepare(`
    SELECT q.*, u.name as owner_name, u.email as owner_email
    FROM quotations q
    LEFT JOIN users u ON q.owner_id = u.id
    ${where}
    ORDER BY q.created_at DESC
  `).bind(...params).all()

  return Response.json(result.results || [])
}

export async function onRequestPost(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const body = await context.request.json()

  const usd = parseFloat(body.usdPrice) || 0
  const er  = parseFloat(body.exchangeRate) || 91
  const fr  = parseFloat(body.freight) || 0
  const mg  = parseFloat(body.marginPct) || 25
  const qty = parseInt(body.quantity) || 1

  const unitInr = usd * er
  const ins     = (unitInr + fr) * 0.0113
  const cif     = unitInr + fr + ins
  const bcd     = cif * 0.075
  const cess    = bcd * 0.1
  const igst    = (cif + bcd + cess) * 0.18
  const cha     = cif * 0.005
  const stamp   = cif * 0.001
  const landed  = cif + bcd + cess + igst + cha + stamp
  const net     = landed - igst
  const quoted  = net * (1 + mg / 100)
  const mval    = quoted - net
  const total   = quoted * qty

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await context.env.DB.prepare(`
    INSERT INTO quotations (
      id, owner_id, market, company, contact, email, phone, city, gst_number,
      country, currency, equipment, sub_type, model, quantity, usd_price,
      exchange_rate, freight, margin_pct, cif_value, landed_cost, net_price,
      quoted_price, margin_value, total_value, status, close_date, notes, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    id, user.id, body.market||'india', body.company||'', body.contact||'',
    body.email||'', body.phone||'', body.city||'', body.gstNumber||'',
    body.country||'', body.currency||'INR', body.equipment||'', body.subType||'',
    body.model||'', qty, usd, er, fr, mg,
    Math.round(cif), Math.round(landed), Math.round(net),
    Math.round(quoted), Math.round(mval), Math.round(total),
    'Sent', body.closeDate||'', body.notes||'', now
  ).run()

  const created = await context.env.DB.prepare(
    'SELECT * FROM quotations WHERE id = ?'
  ).bind(id).first()

  return Response.json(created)
}
