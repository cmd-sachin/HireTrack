import Airtable from "airtable";

// Initialize Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, mail, linkedin, github, resume } = body;

    const createdRecords = await base("Candidate").create([
      {
        fields: {
          Name: name,
          Mail: mail,
          LinkedIn: linkedin,
          Github: github,
          Resume: resume,
        },
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Candidate data added successfully",
        record: createdRecords[0],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Airtable error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to add candidate data",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export default POST;
