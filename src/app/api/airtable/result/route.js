// route.js
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export async function POST(req) {
  try {
    const {
      Mail,
      Name,
      AptitudeScore,
      AptitudeReport,
      TechnicalScore,
      TechnicalReport,
    } = await req.json();

    // Create a new record in the "Results" table
    const createdRecord = await base("Results").create({
      Mail,
      Name,
      AptitudeScore,
      AptitudeReport,
      TechnicalScore,
      TechnicalReport,
    });

    return new Response(JSON.stringify({ record: createdRecord }), {
      status: 200,
    });
  } catch (error) {
    console.error("Airtable submission error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
