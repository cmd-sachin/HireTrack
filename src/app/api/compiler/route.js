import axios from "axios";

export async function POST(req) {
  try {
    const { script, language, stdin } = await req.json();
    if (!script || !language) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Set default version index, and adjust based on language
    let lang = language;
    let versionIndex = "0";
    if (lang === "python") {
      // JDoodle requires "python3" with version index "3"
      lang = "python3";
      versionIndex = "3";
    } else if (lang === "java") {
      versionIndex = "3";
    } else if (lang === "c++") {
      versionIndex = "0";
    } else if (lang === "nodejs") {
      versionIndex = "0";
    }

    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId,
      clientSecret,
      script,
      language: lang,
      versionIndex,
      stdin: stdin || "",
    });
    console.log(response.data);
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    console.error("JDoodle API error:", error.response?.data || error.message);
    return new Response(
      JSON.stringify({ error: "Execution failed", details: error.message }),
      { status: 500 }
    );
  }
}
