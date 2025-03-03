import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import aptitudeSystemPrompt from "../../prompts/aptitude";
// import technicalSystemPrompt from "../../prompts/technical";
import z from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.apiKey });

export async function POST(req) {
  try {
    const { level, messages } = await req.json();
    console.log(messages);
    // Default system prompt and schema for aptitude level.
    let systemPrompt = aptitudeSystemPrompt;
    let schema = z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
    });

    // If level is "technical", override the prompt and schema.
    if (level === "technical") {
      systemPrompt = technicalSystemPrompt;
      schema = z.object({
        question: z.string(),
        sampleTestCase: z.object({
          input: z.any(),
          expectedOutput: z.any(),
        }),
        testCases: z.array(
          z.object({
            input: z.any(),
            expectedOutput: z.any(),
          })
        ),
      });
    }

    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: schema,
      system: systemPrompt,
      messages: messages,
    });
    console.log(result.object);
    return new Response(JSON.stringify(result.object));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
