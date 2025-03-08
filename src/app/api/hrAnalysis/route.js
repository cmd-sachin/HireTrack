export async function GET(req) {
  const data = req.json();
  console.log(req);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
