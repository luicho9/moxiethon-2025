import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { type ListedPatient, listPatientsForClinic } from "@/lib/db/queries";
import { CreatePatientForm } from "./create-patient-form";

type PatientListProps = {
  patients: ListedPatient[];
};

function PatientList({ patients }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No se encontraron pacientes. Cree su primer paciente arriba.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Pacientes ({patients.length})</h3>
      <div className="grid gap-4">
        {patients.map((patient) => (
          <div
            className="rounded-lg border p-4 hover:bg-gray-50"
            key={patient.userId}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{patient.username}</h4>
                <div className="space-y-1 text-gray-600 text-sm">
                  {patient.lastMood && (
                    <div>Último estado: {patient.lastMood}</div>
                  )}

                  {patient.lastActiveAt && (
                    <div>
                      Último activo:{" "}
                      {new Date(patient.lastActiveAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <Link href={`/patients/${patient.userId}`}>
                <Button className="text-sm" type="button">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const patients = await listPatientsForClinic(
    "d10ecc5c-17aa-492c-96b5-0e48f91b9f95"
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">Panel de control de enfermera</h1>
        <div className="text-gray-600 text-sm">
          Bienvenido de nuevo! Tienes {patients.length} pacientes.
        </div>
      </div>

      <CreatePatientForm />

      <div className="border-t pt-8">
        <PatientList patients={patients} />
      </div>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="space-y-4">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingDashboard />}>
      <DashboardContent />
    </Suspense>
  );
}
