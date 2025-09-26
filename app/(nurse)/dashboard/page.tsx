import { Suspense } from "react";
import { requireNurseSession } from "@/lib/auth";
import { type ListedPatient, listPatientsForClinic } from "@/lib/db/queries";
import { CreatePatientForm } from "./create-patient-form";

type PatientListProps = {
  patients: ListedPatient[];
};

function PatientList({ patients }: PatientListProps) {
  if (patients.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No patients found. Create your first patient above.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Patients ({patients.length})</h3>
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
                  {patient.lastMood && <div>Last mood: {patient.lastMood}</div>}
                  <div>
                    Meds:{" "}
                    <span className={getMedsSignalClass(patient.medsSignal)}>
                      {patient.medsSignal}
                    </span>
                  </div>
                  {patient.lastActiveAt && (
                    <div>
                      Last active:{" "}
                      {new Date(patient.lastActiveAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <button
                className="text-blue-600 text-sm hover:text-blue-800"
                type="button"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getMedsSignalClass(signal: "took" | "skipped" | "unknown"): string {
  switch (signal) {
    case "took":
      return "rounded bg-green-100 px-2 py-1 text-xs text-green-800";
    case "skipped":
      return "rounded bg-red-100 px-2 py-1 text-xs text-red-800";
    default:
      return "rounded bg-gray-100 px-2 py-1 text-xs text-gray-800";
  }
}

async function DashboardContent() {
  const session = await requireNurseSession();
  const patients = await listPatientsForClinic(session.clinicId);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">Nurse Dashboard</h1>
        <div className="text-gray-600 text-sm">
          Welcome back! You have {patients.length} patients.
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
