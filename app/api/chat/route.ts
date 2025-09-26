import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  generatePatientSystemPrompt,
  getDefaultSystemPrompt,
} from "@/lib/ai/system-prompts";
import { ensureDefaultClinic, getPatientsForSelector } from "@/lib/db/queries";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    patientId,
  }: {
    messages: UIMessage[];
    model: string;
    webSearch: boolean;
    patientId?: string;
  } = await req.json();

  let systemPrompt = getDefaultSystemPrompt();

  // If a patient is selected, get their specific system prompt
  if (patientId) {
    try {
      const clinicId = await ensureDefaultClinic();
      const patients = await getPatientsForSelector(clinicId);
      const selectedPatient = patients.find((p) => p.userId === patientId);

      if (selectedPatient) {
        systemPrompt = generatePatientSystemPrompt(selectedPatient);
      }
    } catch (error) {
      // Log error for debugging in development
      if (process.env.NODE_ENV === "development") {
        // biome-ignore lint: needed for development debugging
        console.error("Error fetching patient for system prompt:", error);
      }
      // Continue with default system prompt
    }
  }

  // Create the appropriate model instance
  const modelInstance = webSearch
    ? openai("gpt-4o") // For now, we'll use gpt-4o for web search since we're removing gateway
    : (() => {
        // Extract the model name from the format "openai/gpt-5" -> "gpt-5"
        const modelName = model.startsWith("openai/")
          ? model.split("/")[1]
          : model;
        return openai(modelName);
      })();

  const result = streamText({
    model: modelInstance,
    messages: convertToModelMessages(messages),
    system: systemPrompt,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
