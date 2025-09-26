"use client";

import { useRouter } from "next/navigation";
import { Suspense, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthForm } from "@/components/auth-form";
import { type LoginActionState, usernamePinLogin } from "./actions";

function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [state, formAction, isPending] = useActionState<
    LoginActionState,
    FormData
  >(usernamePinLogin, { status: "idle" });

  useEffect(() => {
    if (state.status === "failed") {
      toast.error(state.message);
    } else if (state.status === "invalid_data") {
      toast.error(state.message);
    } else if (state.status === "success") {
      const dest = state.role === "nurse" ? "/dashboard" : "/chat";
      router.replace(dest);
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setUsername(String(formData.get("username") ?? ""));
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">
            Acceder a tu cuenta
          </h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Ingresa tu usuario y PIN para continuar.
          </p>
        </div>

        <AuthForm action={handleSubmit} defaultUsername={username}>
          <button
            className="h-10 rounded-md bg-foreground font-medium text-background text-sm transition hover:opacity-90 disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Ingresando..." : "Ingresar"}
          </button>
        </AuthForm>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-12 overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="font-semibold text-xl dark:text-zinc-50">
            Acceder a tu cuenta
          </h3>
          <p className="text-gray-500 text-sm dark:text-zinc-400">
            Cargando...
          </p>
        </div>
        <div className="px-4 sm:px-16">
          <div className="animate-pulse space-y-4">
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
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}
