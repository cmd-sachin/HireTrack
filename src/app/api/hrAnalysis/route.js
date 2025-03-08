export async function GET(req) {
  const data = { message: "Analysis Report Received" };
  console.log(req);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
