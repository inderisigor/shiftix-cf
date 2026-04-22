import { getUser, unauthorized } from '../../_auth.js'

export async function onRequestPatch(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const id = context.params.id
  const body = await context.request.json()

  const existing = await context.env.DB.prepare(
    'SELECT * FROM quotations WHERE id = ?'
  ).bind(id).first()

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  if (existing.owner_id !== user.id && user.role !== 'manager') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (body.status) {
    await context.env.DB.prepare(
      'UPDATE quotations SET status = ? WHERE id = ?'
    ).bind(body.status, id).run()
  }

  const updated = await context.env.DB.prepare(
    'SELECT * FROM quotations WHERE id = ?'
  ).bind(id).first()

  return Response.json(updated)
}

export async function onRequestDelete(context) {
  const user = getUser(context.request)
  if (!user) return unauthorized()

  const id = context.params.id
  const existing = await context.env.DB.prepare(
    'SELECT * FROM quotations WHERE id = ?'
  ).bind(id).first()

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  if (existing.owner_id !== user.id && user.role !== 'manager') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  await context.env.DB.prepare('DELETE FROM quotations WHERE id = ?').bind(id).run()
  return Response.json({ success: true })
}
