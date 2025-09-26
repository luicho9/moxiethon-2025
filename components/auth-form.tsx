import Form from 'next/form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AuthForm({
  action,
  children,
  defaultUsername = '',
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultUsername?: string;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="username"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Usuario
        </Label>

        <Input
          id="username"
          name="username"
          className="bg-muted text-md md:text-sm"
          type="text"
          placeholder="ej. juan.perez"
          autoComplete="username"
          required
          autoFocus
          defaultValue={defaultUsername}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="pin"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          PIN
        </Label>

        <Input
          id="pin"
          name="pin"
          className="bg-muted text-md md:text-sm"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          required
        />
      </div>

      {children}
    </Form>
  );
}
