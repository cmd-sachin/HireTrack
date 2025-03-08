// app/api/server/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;

    // Validate the request body
    if (!message || message.type !== "assistant-request") {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }
    console.log(body);
    console.log(message);
    return NextResponse.json({ message: "" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error?.toString() });
  }
}
