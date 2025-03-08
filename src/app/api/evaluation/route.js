import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import evaluationPrompt from "../../prompts/evaluation";
import z from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.apiKey });

export async function POST(req) {
  try {
    const { technicalCodeData, aptitudeTestData } = await req.json();

    const schema = z.object({
      aptitudeScore: z.number(),
      aptitudeReport: z.string(),
      technicalScore: z.number(),
      technicalReport: z.string(),
    });

    const result = await generateObject({
      model: google("gemini-2.0-flash-thinking-exp-01-21"),
      schema: schema,
      system: evaluationPrompt,
      prompt: JSON.stringify({ technicalCodeData, aptitudeTestData }),
      temperature: 1,
    });
    return new Response(JSON.stringify(result.object));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
