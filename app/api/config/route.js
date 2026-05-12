export async function GET() {
  return Response.json({
    services: [
      { id: 'youtube', name: 'YouTube', enabled: true },
      { id: 'twitter', name: 'Twitter', enabled: true },
      { id: 'tiktok', name: 'TikTok', enabled: true },
    ]
  });
}
