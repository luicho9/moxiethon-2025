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
      toast.success("Patient created successfully!");
      setShowCredentials({ username: state.username, pin: state.pin });
    }
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-2xl">Create New Patient</h2>
      </div>

      {showCredentials && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="mb-2 font-medium text-green-800">Patient Created!</h3>
          <p className="mb-2 text-green-700 text-sm">
            Please provide these credentials to the patient:
          </p>
          <div className="rounded border bg-white p-3 font-mono text-sm">
            <div>
              Username: <strong>{showCredentials.username}</strong>
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
            Create Another Patient
          </button>
        </div>
      )}

      {!showCredentials && (
        <Form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                disabled={isPending}
                id="username"
                name="username"
                placeholder="e.g. juan.perez"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diseases">Diseases/Conditions (optional)</Label>
            <Input
              disabled={isPending}
              id="diseases"
              name="diseases"
              placeholder="e.g. Diabetes, Hypertension"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Medications (optional)</Label>
            <Input
              disabled={isPending}
              id="medications"
              name="medications"
              placeholder="e.g. Metformin, Lisinopril"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="religion">Religion (optional)</Label>
              <Input
                disabled={isPending}
                id="religion"
                name="religion"
                placeholder="e.g. Catholic, Muslim"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family">Family Info (optional)</Label>
              <Input
                disabled={isPending}
                id="family"
                name="family"
                placeholder="e.g. Married, 2 children"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferences">Preferences (optional)</Label>
            <Input
              disabled={isPending}
              id="preferences"
              name="preferences"
              placeholder="e.g. Morning calls, Spanish language"
            />
          </div>

          <button
            className="h-10 w-full rounded-md bg-foreground font-medium text-background text-sm transition hover:opacity-90 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Creating Patient..." : "Create Patient"}
          </button>
        </Form>
      )}
    </div>
  );
}
