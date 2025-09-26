import { NextResponse } from "next/server";
import { ensureDefaultClinic, getPatientsForSelector } from "@/lib/db/queries";

export async function GET() {
  try {
    // For demo purposes, we'll use the default clinic
    // In a real app, this would come from authentication
    const clinicId = await ensureDefaultClinic();
    const patients = await getPatientsForSelector(clinicId);

    return NextResponse.json({ patients });
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === "development") {
      // biome-ignore lint: needed for development debugging
      console.error("Error fetching patients:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}
