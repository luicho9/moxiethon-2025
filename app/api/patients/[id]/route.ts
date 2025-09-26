import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { requireNurseSession } from "@/lib/auth";
import { deleteUser, getUserById, updateUserProfile } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireNurseSession();
    const { id: patientId } = await params;

    // TODO: Add proper authorization check to ensure the patient belongs to the nurse's clinic
    const patient = await getUserById(patientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // TODO: Fetch chat history from database
    const mockChatHistory = [
      {
        id: "1",
        message: "Good morning! I took my medication as scheduled.",
        timestamp: "2024-01-20 08:30",
        type: "patient",
      },
      {
        id: "2",
        message: "Feeling a bit tired today but overall good mood.",
        timestamp: "2024-01-20 14:15",
        type: "patient",
      },
      {
        id: "3",
        message: "Medication reminder: Time for evening dose",
        timestamp: "2024-01-20 18:00",
        type: "system",
      },
    ];

    return NextResponse.json({
      patient: {
        id: patient.id,
        name: patient.username, // Using username as name since name field doesn't exist
        username: patient.username,
        diseases: patient.diseases || "",
        medications: patient.medications || "",
        religion: patient.religion || "",
        family: patient.family || "",
        preferences: patient.preferences || "",
        emergencyContact: "", // Field doesn't exist in schema
        notes: "", // Field doesn't exist in schema
        createdAt: patient.createdAt?.toISOString() || "",
        lastActive: patient.lastActiveAt
          ? new Date(patient.lastActiveAt).toLocaleDateString()
          : "",
        mood: patient.lastMood || "",
        medsSignal: patient.medsSignal || "unknown",
      },
      chatHistory: mockChatHistory,
    });
  } catch {
    // Error fetching patient
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireNurseSession();
    const { id: patientId } = await params;
    const body = await request.json();

    // TODO: Add proper authorization check to ensure the patient belongs to the nurse's clinic
    const patient = await getUserById(patientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Update patient profile
    await updateUserProfile(patientId, {
      name: body.name,
      diseases: body.diseases,
      medications: body.medications,
      religion: body.religion,
      family: body.family,
      preferences: body.preferences,
      emergencyContact: body.emergencyContact,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      message: "Patient profile updated successfully",
    });
  } catch {
    // Error updating patient
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireNurseSession();
    const { id: patientId } = await params;

    // TODO: Add proper authorization check to ensure the patient belongs to the nurse's clinic
    const patient = await getUserById(patientId);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Delete patient
    await deleteUser(patientId);

    return NextResponse.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch {
    // Error deleting patient
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
