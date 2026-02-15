'use client';

import React from "react"

import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SliderInputProps {
  label: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  description,
  className,
  disabled = false,
}: SliderInputProps) {
  const handleSliderChange = useCallback(
    (values: number[]) => {
      onChange(values[0]);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number.parseFloat(e.target.value);
      if (!Number.isNaN(newValue)) {
        // Clamp value to min/max
        const clampedValue = Math.min(max, Math.max(min, newValue));
        onChange(clampedValue);
      }
    },
    [onChange, min, max]
  );

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="min-w-0 shrink text-sm font-medium text-foreground">
          {label}
          {description && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({description})
            </span>
          )}
        </Label>
        <div className="flex shrink-0 items-center gap-1.5">
          <Input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="h-8 w-20 text-right text-sm sm:w-24"
          />
          <span className="w-8 text-sm text-muted-foreground sm:w-10">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="cursor-pointer"
      />
    </div>
  );
}
