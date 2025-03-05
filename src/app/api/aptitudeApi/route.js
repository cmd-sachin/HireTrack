import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import apiAptitudeSystemPrompt from "@/app/prompts/apiAptitude";
import z from "zod";

const google = createGoogleGenerativeAI({ apiKey: process.env.apiKey });

export async function GET(req) {
  try {
    const messages = [{ role: "user", content: "Start the test!" }];

    let schema = z.object({
      question: z.string(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string().optional(),
    });

    const result = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: schema,
      system: apiAptitudeSystemPrompt,
      messages: messages,
    });

    messages.push({ role: "assistant", content: result.object.question });

    return new Response(JSON.stringify(result.object));
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
