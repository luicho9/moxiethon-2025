"use client";

import { ArrowLeft, Check, Copy, Key, Printer, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

type PatientCredentials = {
  username: string;
  pin: string;
};

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    diseases: "",
    medications: "",
    religion: "",
    family: "",
    preferences: "",
    emergencyContact: "",
    notes: "",
  });
  const [generatedCredentials, setGeneratedCredentials] = useState<
    PatientCredentials | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const generateCredentials = () => {
    // Generate username from name if not provided
    const username =
      formData.username ||
      formData.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

    // Generate random 4-digit PIN
    // biome-ignore lint/style/noMagicNumbers: <It just generates a random 4-digit PIN>
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    setFormData((prev) => ({ ...prev, username }));
    setGeneratedCredentials({ username, pin });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedCredentials) {
      setError("Please generate credentials first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Backend integration - create patient profile and user account
      // DONT USE FETCH FOR THIS, IT IS GOING TO BE SERVER SIDE
      const response = await fetch("/api/nurse/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          credentials: generatedCredentials,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create patient");
      }

      const { patientId } = await response.json();

      // Redirect to patient profile or back to dashboard
      router.push(`/patients/${patientId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create patient");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = async () => {
    if (!generatedCredentials) {
      return;
    }

    const text = `Username: ${generatedCredentials.username}\nPIN: ${generatedCredentials.pin}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    // biome-ignore lint/style/noMagicNumbers: <explanation>
    setTimeout(() => setCopied(false), 2000);
  };

  const printCredentials = () => {
    if (!generatedCredentials) {
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Credentials</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .credentials { border: 2px solid #000; padding: 20px; margin: 20px 0; }
            .header { text-align: center; margin-bottom: 20px; }
            .field { margin: 10px 0; font-size: 18px; }
            .value { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Care Connect - Patient Login Credentials</h1>
            <p>Patient: ${formData.name}</p>
          </div>
          <div class="credentials">
            <div class="field">Username: <span class="value">${generatedCredentials.username}</span></div>
            <div class="field">PIN: <span class="value">${generatedCredentials.pin}</span></div>
          </div>
          <p><strong>Important:</strong> Keep these credentials safe and provide them to the patient.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Button
              className="mr-4"
              onClick={() => router.back()}
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold text-xl">Add New Patient</h1>
              <p className="text-muted-foreground text-sm">
                Create patient profile and credentials
              </p>
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
                Enter the patient's basic details and medical information
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
                    placeholder="Enter patient's full name"
                    required
                    value={formData.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Auto-generated from name"
                    value={formData.username}
                  />
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
                  placeholder="List any medical conditions, diagnoses, or health concerns"
                  rows={3}
                  value={formData.diseases}
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
                  placeholder="List current medications, dosages, and schedules"
                  rows={3}
                  value={formData.medications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal & Cultural Information</CardTitle>
              <CardDescription>
                Information to personalize the AI chat experience
              </CardDescription>
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
                    placeholder="Religious or spiritual beliefs"
                    value={formData.religion}
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
                    placeholder="Name and phone number"
                    value={formData.emergencyContact}
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
                  placeholder="Family members, relationships, living situation"
                  rows={2}
                  value={formData.family}
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
                  placeholder="Hobbies, interests, communication preferences"
                  rows={2}
                  value={formData.preferences}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any additional information for care providers"
                  rows={2}
                  value={formData.notes}
                />
              </div>
            </CardContent>
          </Card>

          {/* Credentials Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Login Credentials
              </CardTitle>
              <CardDescription>
                Generate secure login credentials for the patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedCredentials ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Credentials generated successfully. Please save or print
                      these for the patient.
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-medium text-sm">Username</Label>
                        <p className="font-mono text-lg">
                          {generatedCredentials.username}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium text-sm">PIN</Label>
                        <p className="font-mono text-lg">
                          {generatedCredentials.pin}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={copyCredentials}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {copied ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="mr-1 h-3 w-3" />
                            Copy
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={printCredentials}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <Printer className="mr-1 h-3 w-3" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Click the button below to generate secure login credentials
                  </p>
                  <Button
                    disabled={!formData.name}
                    onClick={generateCredentials}
                    type="button"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Generate Credentials
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isLoading || !generatedCredentials} type="submit">
              {isLoading ? "Creating Patient..." : "Create Patient"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
