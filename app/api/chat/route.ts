import { openai } from "@ai-sdk/openai";
import { geolocation } from "@vercel/functions";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  generatePatientSystemPrompt,
  getDefaultSystemPrompt,
  type RequestHints,
} from "@/lib/ai/prompts";
import { getWeather } from "@/lib/ai/tools/get-weather";
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

  // Get user's location
  const { longitude, latitude, city, country } = geolocation(req);

  const requestHints: RequestHints = {
    longitude,
    latitude,
    city,
    country,
  };

  let systemPrompt = getDefaultSystemPrompt(requestHints);
  // If a patient is selected, get their specific system prompt
  if (patientId) {
    try {
      const clinicId = await ensureDefaultClinic();
      const patients = await getPatientsForSelector(clinicId);
      const selectedPatient = patients.find((p) => p.userId === patientId);

      if (selectedPatient) {
        systemPrompt = generatePatientSystemPrompt(
          selectedPatient,
          requestHints
        );
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
        const modelName = model.startsWith("openai/")
          ? model.split("/")[1]
          : model;
        return openai(modelName);
      })();

  const result = streamText({
    model: modelInstance,
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    tools: {
      getWeather,
    },
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
