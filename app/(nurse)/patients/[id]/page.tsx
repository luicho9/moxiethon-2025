"use client";

import {
  Activity,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Save,
  Trash2,
  User,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type PatientProfile = {
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
  medsSignal?: "took" | "skipped" | "unknown";
};

type ChatMessage = {
  id: string;
  message: string;
  timestamp: string;
  type: "patient" | "system";
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export default function Page() {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        // TODO: Backend integration - fetch patient profile by ID
        const response = await fetch(`/api/patients/${patientId}`);
        if (!response.ok) {
          throw new Error("Patient not found");
        }

        const data = await response.json();
        setPatient(data.patient);
        setFormData(data.patient);
        setChatHistory(data.chatHistory || []);
      } catch {
        // Error fetching patient - using mock data
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
          medsSignal: "took",
        };

        const mockChatHistory: ChatMessage[] = [
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

        setPatient(mockPatient);
        setFormData(mockPatient);
        setChatHistory(mockChatHistory);
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
      const response = await fetch(`/api/patients/${patientId}`, {
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
      // biome-ignore lint/style/noMagicNumbers: <explanation>
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // biome-ignore lint/suspicious/noAlert: <explanation>
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this patient? This action cannot be undone."
    );
    if (!isConfirmed) {
      return;
    }

    try {
      // TODO: Backend integration - delete patient
      const response = await fetch(`/api/patients/${patientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete patient");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patient");
    }
  };

  const getMedsSignalColor = (signal: "took" | "skipped" | "unknown") => {
    switch (signal) {
      case "took":
        return "bg-green-100 text-green-800";
      case "skipped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
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
          <Button onClick={() => router.push("/dashboard")}>
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Button
                className="mr-4"
                onClick={() => router.push("/dashboard")}
                variant="ghost"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="font-semibold text-xl">Patient Details</h1>
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
                      : // biome-ignore lint/style/noNestedTernary: <explanation>
                        patient.mood === "concerning"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }
                >
                  Mood: {patient.mood}
                </Badge>
              )}
              {patient.medsSignal && (
                <Badge className={getMedsSignalColor(patient.medsSignal)}>
                  Meds: {patient.medsSignal}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs
          className="space-y-6"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <User className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Save className="mr-2 h-4 w-4" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat History
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent className="space-y-6" value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Medical Conditions</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.diseases || "No conditions recorded"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Current Medications</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.medications || "No medications recorded"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Religion/Beliefs</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.religion || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Family</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.family || "No family information"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Emergency Contact</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.emergencyContact || "No emergency contact"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Preferences & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">
                      Preferences & Interests
                    </Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.preferences || "No preferences recorded"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Additional Notes</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.notes || "No additional notes"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit">
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
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
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
                      <Label htmlFor="emergencyContact">
                        Emergency Contact
                      </Label>
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
                        setFormData((prev) => ({
                          ...prev,
                          family: e.target.value,
                        }))
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
                        setFormData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
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
                <Button
                  onClick={handleDelete}
                  type="button"
                  variant="destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Patient
                </Button>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setActiveTab("overview")}
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
          </TabsContent>

          {/* Chat History Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Chat History</CardTitle>
                <CardDescription>
                  Recent conversations and interactions with {patient.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-4 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No chat history available
                    </p>
                  ) : (
                    chatHistory.map((message) => (
                      <div
                        className={`rounded-lg p-3 ${
                          message.type === "patient"
                            ? "border-blue-400 border-l-4 bg-blue-50"
                            : "border-gray-400 border-l-4 bg-gray-50"
                        }`}
                        key={message.id}
                      >
                        <div className="mb-1 flex items-start justify-between">
                          <Badge
                            variant={
                              message.type === "patient"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {message.type === "patient" ? "Patient" : "System"}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {message.timestamp}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>
                  Patient activity and engagement history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Medication Taken</p>
                      <p className="text-muted-foreground text-xs">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Chat Interaction</p>
                      <p className="text-muted-foreground text-xs">
                        4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <Activity className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Profile Updated</p>
                      <p className="text-muted-foreground text-xs">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
