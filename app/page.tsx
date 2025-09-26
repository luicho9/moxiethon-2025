import { UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-balance font-bold text-4xl text-foreground md:text-5xl">
            Selecciona tu rol
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Elige tu perfil para acceder al sistema de gestión médica
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="group border-2 transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 hover:shadow-lg">
            <Link className="block p-8 text-center" href="/dashboard">
              <div className="mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-3 font-semibold text-2xl text-foreground">
                Enfermera
              </h2>
              <p className="mb-6 text-pretty text-muted-foreground">
                Accede al panel de administración y gestión de pacientes
              </p>
              <Button className="w-full py-6 font-medium text-lg" size="lg">
                Continuar como Enfermera
              </Button>
            </Link>
          </Card>

          <Card className="group border-2 transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 hover:shadow-lg">
            <Link className="block p-8 text-center" href="/chat">
              <div className="mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="mb-3 font-semibold text-2xl text-foreground">
                Paciente
              </h2>
              <p className="mb-6 text-pretty text-muted-foreground">
                Accede al chat de consulta y comunicación médica
              </p>
              <Button
                className="w-full border-2 bg-transparent py-6 font-medium text-lg hover:bg-primary hover:text-primary-foreground"
                size="lg"
                variant="outline"
              >
                Continuar como Paciente
              </Button>
            </Link>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Sistema seguro de gestión médica • Datos protegidos
          </p>
        </div>
      </div>
    </main>
  );
}
