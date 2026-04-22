export async function apiFetch(path, options = {}) {
 const token = localStorage.getItem('sx_token')
 const res = await fetch(path, {
   ...options,
   headers: {
     'Content-Type': 'application/json',
     ...(token ? { Authorization: `Bearer ${token}` } : {}),
     ...options.headers,
   },
 })
 if (res.status === 401) {
   localStorage.removeItem('sx_token')
   localStorage.removeItem('sx_user')
   window.location.href = '/login'
   return null
 }
 return res.json()
}
export function fmtINR(n) {
 return '₹' + Math.round(n || 0).toLocaleString('en-IN')
}
export function getUser() {
 return JSON.parse(localStorage.getItem('sx_user') || '{}')
}
