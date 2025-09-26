"use client";

import Form from "next/form";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type CreatePatientActionState, createPatientAction } from "./actions";

export function CreatePatientForm() {
  const [state, formAction, isPending] = useActionState<
    CreatePatientActionState,
    FormData
  >(createPatientAction, { status: "idle" });

  const [showCredentials, setShowCredentials] = useState<{
    username: string;
    pin: string;
  } | null>(null);

  useEffect(() => {
    if (state.status === "failed") {
      toast.error(state.message);
    } else if (state.status === "invalid_data") {
      toast.error(state.message);
    } else if (state.status === "success") {
      toast.success("Perfil de paciente creado exitosamente!");
      setShowCredentials({ username: state.username, pin: state.pin });
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl">Nuevo paciente</h2>
      </div>

      {showCredentials && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-medium text-green-800">Perfil de creado!</h3>
          <p className="mb-2 text-green-700 text-sm">
            Por favor, proporciona estas credenciales al paciente:
          </p>
          <div className="rounded border bg-white p-3 font-mono text-sm">
            <div>
              Usuario: <strong>{showCredentials.username}</strong>
            </div>
            <div>
              PIN: <strong>{showCredentials.pin}</strong>
            </div>
          </div>
          <button
            className="mt-3 text-green-600 text-sm hover:text-green-800"
            onClick={() => setShowCredentials(null)}
            type="button"
          >
            Crear otro perfil de paciente
          </button>
        </div>
      )}

      {!showCredentials && (
        <Form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                disabled={isPending}
                id="username"
                name="username"
                placeholder="ej. juan.perez"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diseases">
              Enfermedades/Condiciones (opcional)
            </Label>
            <Input
              disabled={isPending}
              id="diseases"
              name="diseases"
              placeholder="ej. Diabetes, Hipertensión"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medicamentos (opcional)</Label>
            <Input
              disabled={isPending}
              id="medications"
              name="medications"
              placeholder="ej. Metformin, Lisinopril"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="religion">Religión (opcional)</Label>
              <Input
                disabled={isPending}
                id="religion"
                name="religion"
                placeholder="ej. Católico"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Información familiar (opcional)</Label>
              <Input
                disabled={isPending}
                id="family"
                name="family"
                placeholder="ej. Casado, 2 hijos"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Preferencias (opcional)</Label>
            <Input
              disabled={isPending}
              id="preferences"
              name="preferences"
              placeholder="ej. Llamadas por la mañana, Idioma español"
            />
          </div>

          <button
            className="h-10 w-full rounded-md bg-foreground font-medium text-background text-sm transition hover:opacity-90 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending
              ? "Creando perfil de paciente..."
              : "Crear perfil de paciente"}
          </button>
        </Form>
      )}
    </div>
  );
}
