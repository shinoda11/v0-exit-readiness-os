'use client';

import {
  Heart,
  Baby,
  Users,
  Home,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  TrendingUp,
  Plane,
  Zap,
  Clock,
  Globe,
  MapPin,
  Car,
  Wrench,
  Luggage,
  Scissors,
  ScrollText,
  Wallet,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import type { EventCategory } from '@/lib/event-catalog';

const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  Baby,
  Users,
  Home,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Briefcase,
  TrendingUp,
  Plane,
  Zap,
  Clock,
  Globe,
  MapPin,
  Car,
  Wrench,
  Luggage,
  Scissors,
  ScrollText,
  Wallet,
  Building2,
};

export const CATEGORY_BORDER_COLORS: Record<EventCategory, string> = {
  family:    '#9CBE7A',
  career:    '#7A9CBE',
  lifestyle: '#BE9C7A',
  asset:     '#C8B89A',
  housing:   '#C8B89A',
};

interface EventIconProps {
  iconName: string;
  className?: string;
}

export function EventIcon({ iconName, className }: EventIconProps) {
  const Icon = ICON_MAP[iconName];
  if (!Icon) return null;
  return <Icon className={className ?? 'h-5 w-5 text-brand-bronze stroke-[1.5]'} />;
}
