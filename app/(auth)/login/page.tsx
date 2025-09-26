'use client';

import { Suspense, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { toast } from 'sonner';
import { LoginActionState, usernamePinLogin } from './actions';

function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [state, formAction, isPending] = useActionState<
    LoginActionState,
    FormData
  >(usernamePinLogin, { status: 'idle' });

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error(state.message);
    } else if (state.status === 'invalid_data') {
      toast.error(state.message);
    } else if (state.status === 'success') {
      const dest =
        state.role === 'nurse' ? '/(nurse)/dashboard' : '/(patient)/chat';
      router.replace(dest);
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    setUsername(String(formData.get('username') ?? ''));
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Acceder a tu cuenta
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Ingresa tu usuario y PIN para continuar.
          </p>
        </div>

        <AuthForm action={handleSubmit} defaultUsername={username}>
          <button
            className="h-10 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            {isPending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </AuthForm>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Acceder a tu cuenta
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Cargando...
          </p>
        </div>
        <div className="px-4 sm:px-16">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
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
