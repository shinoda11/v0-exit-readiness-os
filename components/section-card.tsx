'use client';

import type { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function SectionCard({
  icon,
  title,
  description,
  children,
  className,
  action,
}: SectionCardProps) {
  return (
    <Card className={cn('overflow-hidden border-gray-200 dark:border-gray-800', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* アイコンは小さく、薄く */}
            <div className="flex h-8 w-8 items-center justify-center text-gray-400 dark:text-gray-500">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-0.5 text-xs text-gray-500">{description}</CardDescription>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}
