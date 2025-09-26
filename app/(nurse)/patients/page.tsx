"use client";

import { ArrowLeft, Save, Trash2, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PatientProfile {
  id: string;
  name: string;
  username: string;
  diseases: string;
  medications: string;
  religion: string;
  family: string;
  preferences: string;
  emergencyContact: string;
  notes: string;
  createdAt: string;
  lastActive?: string;
  mood?: string;
  medsSignal?: string;
}

export default function EditPatientPage() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // TODO: Backend integration - fetch patient profile by ID
        const response = await fetch(`/api/nurse/patients/${patientId}`);
        if (!response.ok) throw new Error("Patient not found");

        const data = await response.json();
        setPatient(data.patient);
        setFormData(data.patient);
      } catch (error) {
        console.error("Error fetching patient:", error);
        // Mock data for development
        const mockPatient: PatientProfile = {
          id: patientId,
          name: "John Doe",
          username: "john_d",
          diseases: "Type 2 Diabetes, Hypertension",
          medications:
            "Metformin 500mg twice daily, Lisinopril 10mg once daily",
          religion: "Christian",
          family: "Married, 2 adult children living nearby",
          preferences:
            "Prefers morning check-ins, enjoys gardening and reading",
          emergencyContact: "Jane Doe (spouse) - (555) 123-4567",
          notes: "Patient is very compliant with medication schedule",
          createdAt: "2024-01-15",
          lastActive: "2 hours ago",
          mood: "good",
          medsSignal: "compliant",
        };
        setPatient(mockPatient);
        setFormData(mockPatient);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Backend integration - update patient profile
      const response = await fetch(`/api/nurse/patients/${patientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update patient");
      }

      setSuccess("Patient profile updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this patient? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // TODO: Backend integration - delete patient
      const response = await fetch(`/api/nurse/patients/${patientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      router.push("/nurse/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patient");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-2xl">Patient Not Found</h2>
          <p className="mb-4 text-muted-foreground">
            The requested patient profile could not be found.
          </p>
          <Button onClick={() => router.push("/nurse/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button
                className="mr-4"
                onClick={() => router.back()}
                variant="ghost"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="font-semibold text-xl">Edit Patient Profile</h1>
                <p className="text-muted-foreground text-sm">
                  {patient.name} (@{patient.username})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {patient.lastActive && (
                <Badge variant="outline">
                  Last active: {patient.lastActive}
                </Badge>
              )}
              {patient.mood && (
                <Badge
                  className={
                    patient.mood === "good"
                      ? "bg-green-100 text-green-800"
                      : patient.mood === "concerning"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }
                >
                  Mood: {patient.mood}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update the patient's basic details and medical information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    value={formData.name || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    className="bg-muted"
                    disabled
                    id="username"
                    value={formData.username || ""}
                  />
                  <p className="text-muted-foreground text-xs">
                    Username cannot be changed
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diseases">Medical Conditions</Label>
                <Textarea
                  id="diseases"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      diseases: e.target.value,
                    }))
                  }
                  rows={3}
                  value={formData.diseases || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      medications: e.target.value,
                    }))
                  }
                  rows={3}
                  value={formData.medications || ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal & Cultural Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="religion">Religion/Beliefs</Label>
                  <Input
                    id="religion"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        religion: e.target.value,
                      }))
                    }
                    value={formData.religion || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    value={formData.emergencyContact || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="family">Family Information</Label>
                <Textarea
                  id="family"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, family: e.target.value }))
                  }
                  rows={2}
                  value={formData.family || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferences">Preferences & Interests</Label>
                <Textarea
                  id="preferences"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferences: e.target.value,
                    }))
                  }
                  rows={2}
                  value={formData.preferences || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  value={formData.notes || ""}
                />
              </div>
            </CardContent>
          </Card>

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button onClick={handleDelete} type="button" variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Patient
            </Button>

            <div className="flex space-x-4">
              <Button
                onClick={() => router.back()}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
