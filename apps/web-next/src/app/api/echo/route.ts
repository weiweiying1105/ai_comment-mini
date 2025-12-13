export async function POST(request: Request) {
  try {
    const data = await request.json();
    return Response.json({ ok: true, data });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
}