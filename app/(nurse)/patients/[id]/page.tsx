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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex patient management component with multiple states
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
            message: "Buenos días! Tomé mis medicamentos como se programó.",
            timestamp: "2024-01-20 08:30",
            type: "patient",
          },
          {
            id: "2",
            message:
              "Me siento un poco cansado hoy pero en general buena onda.",
            timestamp: "2024-01-20 14:15",
            type: "patient",
          },
          {
            id: "3",
            message:
              "Recordatorio de medicamento: Hora de la dosis de la tarde",
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
      // biome-ignore lint/style/noMagicNumbers: 3 second timeout for success message
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    // biome-ignore lint/suspicious/noAlert: User confirmation required for destructive action
    const isConfirmed = window.confirm(
      "¿Estás seguro de querer eliminar este paciente? Esta acción no puede ser deshecha."
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          <p className="text-muted-foreground">
            Cargando perfil del paciente...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-2xl">Paciente no encontrado</h2>
          <p className="mb-4 text-muted-foreground">
            El perfil del paciente no pudo ser encontrado.
          </p>
          <Button onClick={() => router.push("/dashboard")}>Regresar</Button>
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
                Regresar
              </Button>
              <div>
                <h1 className="font-semibold text-xl">Detalles del paciente</h1>
                <p className="text-muted-foreground text-sm">{patient.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {patient.lastActive && (
                <Badge variant="outline">
                  Último activo: {patient.lastActive}
                </Badge>
              )}
              {patient.mood && (
                <Badge
                  className={
                    patient.mood === "good"
                      ? "bg-green-100 text-green-800"
                      : // biome-ignore lint/style/noNestedTernary: Three distinct mood states require nested ternary
                        patient.mood === "concerning"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }
                >
                  Estado: {patient.mood}
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">
              <User className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="edit">
              <Save className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Editar perfil</span>
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Historial de chat</span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Actividad</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent className="space-y-6" value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información médica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Condiciones médicas</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.diseases || "No condiciones registradas"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Medicamentos</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.medications || "No medicamentos registrados"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Religión/Creencias</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.religion || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Familia</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.family || "No información familiar"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">
                      Contacto de emergencia
                    </Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.emergencyContact || "No contacto de emergencia"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Preferencias y notas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Preferencias y notas</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.preferences || "No preferencias registradas"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Notas adicionales</Label>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {patient.notes || "No notas adicionales"}
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
                    Información básica
                  </CardTitle>
                  <CardDescription>
                    Actualiza la información básica del paciente y la
                    información médica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre completo *</Label>
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
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <Input
                        className="bg-muted"
                        disabled
                        id="username"
                        value={formData.username || ""}
                      />
                      <p className="text-muted-foreground text-xs">
                        El nombre de usuario no puede ser modificado
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diseases">Condiciones médicas</Label>
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
                    <Label htmlFor="medications">Medicamentos actuales</Label>
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
                  <CardTitle>Información personal y cultural</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religión/Creencias</Label>
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
                        Contacto de emergencia
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
                    <Label htmlFor="family">Información familiar</Label>
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
                    <Label htmlFor="preferences">
                      Preferencias y intereses
                    </Label>
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
                    <Label htmlFor="notes">Notas adicionales</Label>
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
                  Eliminar paciente
                </Button>

                <div className="flex space-x-4">
                  <Button
                    onClick={() => setActiveTab("overview")}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button disabled={isSaving} type="submit">
                    {isSaving ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar cambios
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
                <CardTitle>Historial de chat</CardTitle>
                <CardDescription>
                  Conversaciones y interacciones recientes con {patient.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-4 overflow-y-auto">
                  {chatHistory.length === 0 ? (
                    <p className="py-8 text-center text-muted-foreground">
                      No hay historial de chat disponible
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
                            {message.type === "patient"
                              ? "Paciente"
                              : "Sistema"}
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
                <CardTitle>Cronología de actividad</CardTitle>
                <CardDescription>
                  Actividad y historial de interacción del paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">Medicamento tomado</p>
                      <p className="text-muted-foreground text-xs">
                        2 horas atrás
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Interacción de chat</p>
                      <p className="text-muted-foreground text-xs">
                        4 horas atrás
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3">
                    <Activity className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">Perfil actualizado</p>
                      <p className="text-muted-foreground text-xs">
                        1 día atrás
                      </p>
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
