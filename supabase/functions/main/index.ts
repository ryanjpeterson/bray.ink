// Main edge function router — forwards requests to named functions
const FUNCTIONS = new Set(['send-booking-email', 'refresh-instagram-token'])

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const funcName = url.pathname.split('/').filter(Boolean)[0]

  if (!funcName || !FUNCTIONS.has(funcName)) {
    return new Response('Not Found', { status: 404 })
  }

  const { default: handler } = await import(`../${funcName}/index.ts`)
  return handler(req)
})
