import Airtable from "airtable";

// Initialize Airtable connection
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID
);

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const college = url.searchParams.get("college");

    // Ensure a college name is provided, otherwise return an error response
    if (!college) {
      return new Response(
        JSON.stringify({
          error: "College query parameter is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create a filter formula to fetch records where the College field matches the query
    const filterFormula = `{College} = "${college}"`;

    // Retrieve records from the Airtable "Criteria" table that match the filter
    const records = await base("Criteria")
      .select({
        filterByFormula: filterFormula,
        sort: [],
        maxRecords: 100,
      })
      .all();

    // Map the retrieved records to a structured format
    const configurations = records.map((record) => ({
      id: record.id,
      college: record.get("College"),
      aptitudeQuestions: record.get("AptitudeNoQuestions"),
      aptitudeDifficulty: record.get("AptitudeDifficulty"),
      aptitudeTopics: record.get("AptitudeTopics"),
      aptitudeWeightage: record.get("AptitudeTopicsWeightage"),
      aptitudeNotes: record.get("AptitudeNotes"),
      technicalQuestions: record.get("TechnicalNoQuestions"),
      technicalDifficulty: record.get("TechnicalDifficulty"),
      technicalQuestionType: record.get("TechnicalQuestionType"),
      technicalTopics: record.get("TechnicalQuestionTopics"),
      technicalNotes: record.get("TechnicalNotes"),
    }));

    return new Response(
      JSON.stringify({
        success: true,
        configurations,
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
        error: "Failed to fetch assessment configurations",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
