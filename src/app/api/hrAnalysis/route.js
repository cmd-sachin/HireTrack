// app/api/server/route.js
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    console.log("Request body:", req);
    const body = await req.json();

    const { message } = body;

    if (!message || message.type !== "assistant-request") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Request processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}
