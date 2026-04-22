// functions/_middleware.js - runs before all functions
export async function onRequest(context) {
  return context.next()
}
