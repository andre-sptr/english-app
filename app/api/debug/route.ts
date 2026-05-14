export async function GET() {
  return Response.json({
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    keyPreview: process.env.ANTHROPIC_API_KEY
      ? process.env.ANTHROPIC_API_KEY.slice(0, 10) + '...'
      : null,
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
  });
}
