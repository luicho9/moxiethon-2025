import { tool } from "ai";
import { z } from "zod";

export const geocodeLocation = tool({
  description: "Resolve a city or place name into latitude and longitude",
  inputSchema: z.object({
    query: z.string().describe("The name of the city or place"),
  }),
  execute: async ({ query }) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    );

    const data = await response.json();
    if (data.length === 0) {
      throw new Error(`No location found for ${query}`);
    }

    const { lat, lon } = data[0];
    return {
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
    };
  },
});