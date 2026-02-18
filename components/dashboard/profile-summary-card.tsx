'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/types';
import type { Profile } from '@/lib/types';

interface ProfileSummaryCardProps {
  profile: Profile;
}

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const modeLabel = profile.mode === 'couple' ? '夫婦' : '個人';
  const monthlyRent = Math.round(profile.housingCostAnnual / 12);
  const totalAssets = profile.assetCash + profile.assetInvest + profile.assetDefinedContributionJP;

  // Build asset breakdown parts
  const assetParts: string[] = [];
  if (profile.assetCash > 0) assetParts.push(`現金${profile.assetCash}`);
  if (profile.assetInvest > 0) assetParts.push(`投資${profile.assetInvest}`);
  if (profile.assetDefinedContributionJP > 0) assetParts.push(`DC${profile.assetDefinedContributionJP}`);

  return (
    <Card className="overflow-hidden border-border bg-muted/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center text-muted-foreground">
              <User className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-semibold">プロフィール</CardTitle>
          </div>
          <Link
            href="/app/profile"
            className="text-xs text-[#C8B89A] hover:text-[#8A7A62] transition-colors"
          >
            編集 →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="space-y-1 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">年齢 / 世帯</dt>
            <dd className="font-medium">{profile.currentAge}歳 / {modeLabel}</dd>
          </div>

          {profile.mode === 'couple' && profile.partnerGrossIncome > 0 && (
            <div className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">パートナー年収</dt>
              <dd className="font-medium">{formatCurrency(profile.partnerGrossIncome)}</dd>
            </div>
          )}

          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">家賃</dt>
            <dd className="font-medium">月{monthlyRent}万</dd>
          </div>

          <div className="flex items-baseline justify-between">
            <dt className="text-muted-foreground">金融資産</dt>
            <dd className="font-medium">{formatCurrency(totalAssets)}</dd>
          </div>
          {assetParts.length > 1 && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                ({assetParts.join(' / ')})
              </span>
            </div>
          )}

          {profile.rsuAnnual > 0 && (
            <div className="flex items-baseline justify-between">
              <dt className="text-muted-foreground">RSU</dt>
              <dd className="font-medium">{formatCurrency(profile.rsuAnnual)}/年</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
