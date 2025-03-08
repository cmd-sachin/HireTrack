import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import getAptitudeSystemPrompt from "../../prompts/aptitude";
import getTechnicalSystemPrompt from "../../prompts/technical";
import z from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.apiKey });

export async function POST(req) {
  try {
    const { level, messages } = await req.json();

    let systemPrompt = await getAptitudeSystemPrompt();
    let schema = z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
    });

    if (level === "technical") {
      systemPrompt = await getTechnicalSystemPrompt();

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
          starterCode: z.object({
            python: z.string(),
            c: z.string(),
            java: z.string(),
            javascript: z.string(),
          }),
        })
      );
    }
    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: schema,
      system: systemPrompt,
      messages: messages,
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
