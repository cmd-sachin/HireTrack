export async function GET(req) {
  const url = new URL(req.url);
  const params = Object.fromEntries(url.searchParams.entries());

  console.log("Query Params:", params);

  return new Response(JSON.stringify(params), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
