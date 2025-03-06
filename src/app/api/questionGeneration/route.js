import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import aptitudeSystemPrompt from "../../prompts/aptitude";
import technicalSystemPrompt from "../../prompts/technical";
import z from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.apiKey });

export async function POST(req) {
  try {
    const { level, messages } = await req.json();

    let systemPrompt = aptitudeSystemPrompt;
    let schema = z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
    });

    if (level === "technical") {
      systemPrompt = technicalSystemPrompt;

      schema = z.array(
        z.object({
          questionHeader: z.string(),
          question: z.string(),
          sampleTestCase: z.object({
            input: z.string(),
            output: z.string(),
            explanation: z.string(),
          }),
          testCases: z.array(
            z.object({
              input: z.string(),
              output: z.string(),
            })
          ),
          inputConstraints: z.array(z.string()),
        })
      );
    }
    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: schema,
      system: systemPrompt,
      messages: messages,
      temperature: 0.8,
    });
    return new Response(JSON.stringify(result.object));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
