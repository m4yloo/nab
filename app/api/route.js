export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Forward to actual Cobalt API
    const response = await fetch('https://cobalt-api-production-f5b2.up.railway.app/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`server error: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { status: 'error', error: { msg: error.message } },
      { status: 500 }
    );
  }
}
