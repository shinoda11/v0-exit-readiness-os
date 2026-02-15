import { useMemo, useCallback } from 'react';
import { validateProfile, type ValidationError } from '@/lib/engine';
import type { Profile } from '@/lib/types';

export function useValidation(profile: Profile) {
  const errors: ValidationError[] = useMemo(
    () => validateProfile(profile),
    [profile]
  );

  const getFieldError = useCallback(
    (field: string): string | undefined =>
      errors.find((e) => e.field === field)?.message,
    [errors]
  );

  return { errors, getFieldError };
}
