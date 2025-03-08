// // app/api/server/route.js
// import { NextResponse } from "next/server";

// export async function POST(request) {
//   const body = await request.json();
//   const { message } = body;

//   // Validate the request body
//   if (!message || message.type !== "assistant-request") {
//     return NextResponse.json(
//       { error: "Invalid request payload" },
//       { status: 400 }
//     );
//   }
//   console.log(message);
//   return NextResponse.json({ message: "" });
// }

// src/app/api/hrAnalysis/route.js
import { NextResponse } from "next/server";

// export function GET(request) {
//   return NextResponse.json({ message: "Hello from Next.js!" });
// }

export async function GET(request) {
  return NextResponse.json({ test: "" }, { status: 200 });
}
