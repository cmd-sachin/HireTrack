import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

async function extractPDFData(pdfUrl) {
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }
  const pdfBuffer = await response.arrayBuffer(); // Use arrayBuffer in Next.js
  const buffer = Buffer.from(pdfBuffer);
  const data = await pdfParse(buffer);

  return {
    text: data.text,
    numPages: data.numpages,
    info: data.info,
    metadata: data.metadata,
    version: data.version,
  };
}

export async function GET(request) {
  // You can extract the pdfUrl from the query params if needed
  const { searchParams } = new URL(request.url);
  const pdfUrl = searchParams.get("pdfUrl");

  if (!pdfUrl) {
    return NextResponse.json(
      { error: "Missing pdfUrl parameter" },
      { status: 400 }
    );
  }

  try {
    const pdfData = await extractPDFData(pdfUrl);
    return NextResponse.json(pdfData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
