// app/api/server/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message || message.type !== "assistant-request") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    return NextResponse.json({ message: "Request processed successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}
