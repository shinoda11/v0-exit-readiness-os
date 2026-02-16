'use client';

import { useState } from 'react';
import { LineChart, Eye, EyeOff, AlertTriangle, Target } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceDot,
} from 'recharts';
import { SectionCard } from '@/components/section-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { SimulationPath, LifeEvent } from '@/lib/types';

interface AssetProjectionChartProps {
  data: SimulationPath | null;
  targetRetireAge: number;
  lifeEvents?: LifeEvent[];
  isLoading?: boolean;
}

interface ChartDataPoint {
  age: number;
  median: number;
  upper: number;
  lower: number;
  p25: number;
  p75: number;
  // Stacked band data
  p10base: number;
  p10p90band: number;
  p25base: number;
  p25p75band: number;
}

function formatYAxis(value: number): string {
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(1)}億`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}千万`;
  }
  return `${value}万`;
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(2)}億円`;
  }
  return `${value.toLocaleString()}万円`;
}

function CustomTooltip({
  active,
  payload,
  label,
  showOptimistic,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
  showOptimistic: boolean;
}) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const median = payload.find((p) => p.dataKey === 'median')?.value ?? 0;
  const upper = payload.find((p) => p.dataKey === 'upper')?.value ?? 0;
  const lower = payload.find((p) => p.dataKey === 'lower')?.value ?? 0;
  const p75 = payload.find((p) => p.dataKey === 'p75')?.value ?? 0;
  const p25 = payload.find((p) => p.dataKey === 'p25')?.value ?? 0;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg min-w-[200px]">
      <p className="mb-2 font-semibold text-base">{label}歳</p>
      <div className="space-y-2 text-sm">
        {showOptimistic && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-500 flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400" />
              楽観 (90%)
            </span>
            <span className="font-medium">{formatValue(upper)}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-500">75%</span>
          <span className="font-medium">{formatValue(p75)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-1 border-y">
          <span className="text-gray-700 flex items-center gap-1 font-medium">
            <div className="h-2 w-2 rounded-full bg-gray-700" />
            中央値
          </span>
          <span className="font-bold text-base">{formatValue(median)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-gray-500">25%</span>
          <span className="font-medium">{formatValue(p25)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-gray-500" />
            悲観 (10%)
          </span>
          <span className={cn(
            "font-medium",
            lower < 0 && "text-gray-800"
          )}>{formatValue(lower)}</span>
        </div>
        {lower < 0 && (
          <div className="flex items-center gap-1 text-destructive text-xs pt-1 border-t">
            <AlertTriangle className="h-3 w-3" />
            悲観シナリオでは資産枯渇リスク
          </div>
        )}
      </div>
    </div>
  );
}

export function AssetProjectionChart({
  data,
  targetRetireAge,
  lifeEvents = [],
  isLoading,
}: AssetProjectionChartProps) {
  const [showOptimistic, setShowOptimistic] = useState(false);
  
  if (!data) {
    return (
      <SectionCard
        icon={<LineChart className="h-5 w-5" />}
        title="資産推移シミュレーション"
        description="モンテカルロシミュレーションによる将来予測"
      >
        {isLoading ? (
          <Skeleton className="h-64 w-full sm:h-80" />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-3 sm:h-80">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-muted-foreground/30">
              <line x1="20" y1="4" x2="8" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="4" x2="32" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="4" x2="20" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="20" cy="4" r="3" fill="currentColor" opacity="0.5" />
            </svg>
            <p className="text-sm text-muted-foreground">
              データを入力するとここにグラフが表示されます
            </p>
          </div>
        )}
      </SectionCard>
    );
  }

  // Transform data for Recharts
  const chartData: ChartDataPoint[] = data.yearlyData.map((point, index) => {
    const p10 = data.lowerPath[index]?.assets ?? point.assets;
    const p25 = data.p25Path?.[index]?.assets ?? point.assets;
    const p75 = data.p75Path?.[index]?.assets ?? point.assets;
    const p90 = data.upperPath[index]?.assets ?? point.assets;
    return {
      age: point.age,
      median: point.assets,
      upper: p90,
      lower: p10,
      p25,
      p75,
      // Stacked band data for Recharts
      p10base: p10,
      p10p90band: Math.max(0, p90 - p10),
      p25base: p25,
      p25p75band: Math.max(0, p75 - p25),
    };
  });

  // Find key metrics
  const retirementData = chartData.find(d => d.age === targetRetireAge);
  const finalData = chartData[chartData.length - 1];
  const zeroLineData = chartData.find(d => d.lower <= 0);
  
  // Calculate Y axis domain based on visibility
  const relevantValues = showOptimistic
    ? chartData.flatMap((d) => [d.upper, d.lower, d.median, d.p25, d.p75])
    : chartData.flatMap((d) => [d.lower, d.median, d.p25, d.p75]);
  
  const minValue = Math.min(...relevantValues);
  const maxValue = Math.max(...relevantValues);
  
  // Add padding and ensure 0 is visible if close
  const range = maxValue - minValue;
  const yMin = minValue < 0 ? Math.floor(minValue / 1000) * 1000 - 500 : Math.max(-1000, Math.floor(minValue / 1000) * 1000 - range * 0.1);
  const yMax = Math.ceil(maxValue / 1000) * 1000 + range * 0.1;

  return (
    <SectionCard
      icon={<LineChart className="h-5 w-5" />}
      title="資産推移シミュレーション"
      description="モンテカルロシミュレーションによる将来予測"
    >
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Switch
            id="show-optimistic"
            checked={showOptimistic}
            onCheckedChange={setShowOptimistic}
          />
          <Label htmlFor="show-optimistic" className="text-sm text-muted-foreground cursor-pointer">
            {showOptimistic ? (
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> 楽観シナリオを表示</span>
            ) : (
              <span className="flex items-center gap-1"><EyeOff className="h-3.5 w-3.5" /> 楽観シナリオを非表示（推奨）</span>
            )}
          </Label>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 sm:h-80">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/40">
            <span className="text-xs text-muted-foreground">計算中...</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 24, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#374151" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#374151" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}歳`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={formatYAxis}
              domain={[yMin, yMax]}
              width={55}
            />
            <Tooltip content={<CustomTooltip showOptimistic={showOptimistic} />} />
            
            {/* p10-p90 band (outer, lighter) */}
            <Area
              type="monotone"
              dataKey="p10base"
              stackId="bandOuter"
              stroke="none"
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey="p10p90band"
              stackId="bandOuter"
              stroke="none"
              fill="rgba(200,184,154,0.08)"
            />

            {/* p25-p75 band (inner, darker) */}
            <Area
              type="monotone"
              dataKey="p25base"
              stackId="bandInner"
              stroke="none"
              fill="transparent"
            />
            <Area
              type="monotone"
              dataKey="p25p75band"
              stackId="bandInner"
              stroke="none"
              fill="rgba(200,184,154,0.15)"
            />

            {/* Optimistic line (conditional) */}
            {showOptimistic && (
              <Area
                type="monotone"
                dataKey="upper"
                stroke="#9ca3af"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
              />
            )}

            {/* Median line */}
            <Area
              type="monotone"
              dataKey="median"
              stroke="#374151"
              strokeWidth={2.5}
              fill="url(#colorMedian)"
            />

            {/* Hidden p25/p75 lines for tooltip data */}
            <Area type="monotone" dataKey="p25" stroke="none" fill="none" />
            <Area type="monotone" dataKey="p75" stroke="none" fill="none" />

            {/* Pessimistic line */}
            <Area
              type="monotone"
              dataKey="lower"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="none"
            />
            
            {/* Zero line (important reference) */}
            <ReferenceLine
              y={0}
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              label={{
                value: '資産枯渇ライン',
                position: 'insideBottomRight',
                fill: 'hsl(var(--destructive))',
                fontSize: 10,
              }}
            />
            
            {/* Retirement age reference line */}
            <ReferenceLine
              x={targetRetireAge}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: `目標 ${targetRetireAge}歳`,
                position: 'insideTopLeft',
                fill: 'hsl(var(--primary))',
                fontSize: 11,
                fontWeight: 'bold',
                offset: 8,
              }}
            />
            
            {/* Life event markers */}
            {lifeEvents.map((event) => (
              <ReferenceLine
                key={event.id}
                x={event.age}
                stroke="hsl(var(--chart-4))"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: event.name.slice(0, 6),
                  position: 'insideBottomRight',
                  fill: 'hsl(var(--chart-4))',
                  fontSize: 9,
                }}
              />
            ))}
            
            {/* Key point: Retirement assets (median) */}
            {retirementData && (
              <ReferenceDot
                x={targetRetireAge}
                y={retirementData.median}
                r={5}
                fill="hsl(var(--primary))"
                stroke="white"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Key Metrics Summary */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {targetRetireAge}歳時点（中央値）
          </p>
          <p className="text-lg font-bold text-gray-800">
            {retirementData ? formatValue(retirementData.median) : '-'}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            {finalData?.age}歳時点（中央値）
          </p>
          <p className={cn(
            "text-lg font-bold",
            finalData && finalData.median > 0 ? "text-gray-800" : "text-gray-600"
          )}>
            {finalData ? formatValue(finalData.median) : '-'}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            悲観シナリオ ({finalData?.age}歳)
          </p>
          <p className={cn(
            "text-lg font-bold",
            finalData && finalData.lower > 0 ? "text-gray-700" : "text-gray-600"
          )}>
            {finalData ? formatValue(finalData.lower) : '-'}
          </p>
          {finalData && finalData.lower < 0 && (
            <p className="text-xs text-gray-600 flex items-center justify-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3" />
              枯渇リスクあり
            </p>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-1 w-5 rounded bg-gray-700" />
          <span className="text-muted-foreground">中央値</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-5 rounded" style={{ backgroundColor: 'rgba(200,184,154,0.3)' }} />
          <span className="text-muted-foreground">25-75%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-5 border-t-2 border-dashed border-gray-500" />
          <span className="text-muted-foreground">悲観 (10%)</span>
        </div>
        {showOptimistic && (
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-5 border-t-2 border-dashed border-gray-400" />
            <span className="text-muted-foreground">楽観 (90%)</span>
          </div>
        )}
      </div>
      
      {/* Reading guide */}
      <div className="mt-4 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
        <p>
          <strong>見方:</strong> 中央値（実線）は最も可能性の高い推移を示します。
          ゴールドの帯は25〜75%の範囲で、半数のシナリオがこの範囲に入ります。
          悲観シナリオ（点線）は下位10%の場合の推移で、これが0円を下回ると資産枯渇リスクがあります。
        </p>
      </div>
    </SectionCard>
  );
}
