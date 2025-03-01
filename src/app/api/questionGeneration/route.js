import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk//google";
import aptitudeSystemPrompt from "../../prompts/aptitude";
import technicalSystemPrompt from "../../prompts/technical";
import z from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function POST(req) {
  try {
    const { level, messages } = await req.json();
    let systemPrompt = aptitudeSystemPrompt;
    let schema = z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
    });
    if (level == technical) {
      const systemPrompt = technicalSystemPrompt;
      const schema = z.object({
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
      model: google("gemini-2.0-flash-exp"),
      schema: schema,
      system: systemPrompt,
      messages: messages,
    });
  } catch (error) {
    console.log(error);
  }
}
