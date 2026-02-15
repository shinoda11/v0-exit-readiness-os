'use client';

interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-xs text-destructive mt-1 animate-in fade-in-0 duration-200">
      {message}
    </p>
  );
}
