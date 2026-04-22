// functions/_auth.js
export function getUser(request) {
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const data = JSON.parse(atob(token))
    if (data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
