import { NextResponse } from "next/server";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);
const TABLE_NAME = "Candidate";

export async function POST(request) {
  try {
    const { email, userKey } = await request.json();

    const records = await base(TABLE_NAME)
      .select({
        filterByFormula: `{email} = '${email}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (!records || records.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email not found" },
        { status: 404 }
      );
    }

    const record = records[0];
    const storedKey = record.get("key");
    const taskid = record.get("taskId") || null;
    console.log(taskid);

    if (storedKey === userKey) {
      return NextResponse.json({ success: true, taskid });
    } else {
      return NextResponse.json(
        { success: false, message: "Key does not match" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in POST /login:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
