'use client';

import type { Branch, WorldlineCandidate } from '@/lib/branch';

interface BranchTreeVizProps {
  currentAge: number;
  selectedBranches: Branch[];
  candidates?: WorldlineCandidate[];
  showScores?: boolean;
}

const CERTAINTY_COLORS: Record<string, string> = {
  confirmed: '#1A1916',
  planned: '#4A7C59',
  uncertain: '#8A7A62',
};

export function BranchTreeViz({
  currentAge,
  selectedBranches,
  candidates,
  showScores,
}: BranchTreeVizProps) {
  const ageRange = 100 - currentAge;
  const LEFT = 30;
  const RIGHT = 380;
  const MID_Y = 100;
  const WIDTH = RIGHT - LEFT;

  function ageToX(age: number): number {
    return LEFT + ((age - currentAge) / ageRange) * WIDTH;
  }

  // Filter branches with ages (non-auto, have age)
  const branchesWithAge = selectedBranches.filter(
    (b) => !b.auto && b.age !== undefined
  );
  const planned = branchesWithAge.filter((b) => b.certainty === 'planned');
  const uncertain = branchesWithAge.filter((b) => b.certainty === 'uncertain');

  // Find earliest branch age for the junction point
  const allAges = branchesWithAge.map((b) => b.age!);
  const junctionAge = allAges.length > 0 ? Math.min(...allAges) : currentAge + 5;
  const junctionX = ageToX(junctionAge);

  // Distribute branches vertically — planned upward, uncertain downward
  const BRANCH_SPACING = 35;
  const plannedPositions = planned.map((_, i) => MID_Y - BRANCH_SPACING * (i + 1));
  const uncertainPositions = uncertain.map((_, i) => MID_Y + BRANCH_SPACING * (i + 1));

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">タイムライン</p>
      <svg
        viewBox="0 0 400 200"
        className="w-full h-auto"
        role="img"
        aria-label="人生のタイムライン"
      >
        {/* Age markers */}
        <text x={LEFT} y={15} fontSize={10} fill="#8A7A62" textAnchor="start">
          現在
        </text>
        <text x={ageToX(65)} y={15} fontSize={10} fill="#8A7A62" textAnchor="middle">
          65歳
        </text>
        <text x={RIGHT} y={15} fontSize={10} fill="#8A7A62" textAnchor="end">
          100歳
        </text>

        {/* 65 marker tick */}
        <line
          x1={ageToX(65)}
          y1={MID_Y - 4}
          x2={ageToX(65)}
          y2={MID_Y + 4}
          stroke="#D4CFC7"
          strokeWidth={1}
        />

        {/* Main trunk: current age → junction point */}
        <line
          x1={LEFT}
          y1={MID_Y}
          x2={junctionX}
          y2={MID_Y}
          stroke="#1A1916"
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Baseline continuation: junction → 100歳 (thin) */}
        <line
          x1={junctionX}
          y1={MID_Y}
          x2={RIGHT}
          y2={MID_Y}
          stroke="#D4CFC7"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Planned branches: Cubic Bezier curving upward-forward */}
        {planned.map((b, i) => {
          const endY = plannedPositions[i];
          const endX = RIGHT;
          // Bezier control points: start horizontal, curve to endpoint
          const cp1x = junctionX + (endX - junctionX) * 0.3;
          const cp1y = MID_Y;
          const cp2x = junctionX + (endX - junctionX) * 0.5;
          const cp2y = endY;
          return (
            <g key={b.id} className="transition-opacity duration-300">
              <path
                d={`M ${junctionX} ${MID_Y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`}
                stroke={CERTAINTY_COLORS.planned}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
              {/* Endpoint dot */}
              <circle cx={endX} cy={endY} r={3} fill={CERTAINTY_COLORS.planned} />
              {/* Label */}
              <text
                x={junctionX + (endX - junctionX) * 0.55}
                y={endY - 6}
                fontSize={9}
                fill={CERTAINTY_COLORS.planned}
              >
                {b.label}
              </text>
            </g>
          );
        })}

        {/* Uncertain branches: Cubic Bezier curving downward-forward, dashed */}
        {uncertain.map((b, i) => {
          const endY = uncertainPositions[i];
          const endX = RIGHT;
          const cp1x = junctionX + (endX - junctionX) * 0.3;
          const cp1y = MID_Y;
          const cp2x = junctionX + (endX - junctionX) * 0.5;
          const cp2y = endY;
          return (
            <g key={b.id} className="transition-opacity duration-300">
              <path
                d={`M ${junctionX} ${MID_Y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`}
                stroke={CERTAINTY_COLORS.uncertain}
                strokeWidth={2}
                fill="none"
                strokeDasharray="6 4"
                strokeLinecap="round"
                opacity={i === 0 ? 1 : 0.6}
              />
              {/* Endpoint dot */}
              <circle cx={endX} cy={endY} r={3} fill={CERTAINTY_COLORS.uncertain} opacity={i === 0 ? 1 : 0.6} />
              {/* Label */}
              <text
                x={junctionX + (endX - junctionX) * 0.55}
                y={endY + 14}
                fontSize={9}
                fill={CERTAINTY_COLORS.uncertain}
                opacity={i === 0 ? 1 : 0.6}
              >
                {b.label}
              </text>
            </g>
          );
        })}

        {/* Score badges on branches (preview mode) */}
        {showScores &&
          candidates?.map((c, ci) => {
            if (!c.score || c.id === 'baseline') return null;
            const uniqueBranch = c.branches.find(
              (b) => !b.auto && b.certainty === 'uncertain' && b.age
            );
            if (!uniqueBranch) return null;
            const idx = uncertain.findIndex((u) => u.id === uniqueBranch.id);
            if (idx < 0) return null;
            const badgeY = uncertainPositions[idx];
            const badgeX = RIGHT - 40;
            return (
              <g key={c.id}>
                <rect
                  x={badgeX - 14}
                  y={badgeY - 8}
                  width={28}
                  height={16}
                  rx={4}
                  fill={c.color}
                  opacity={0.9}
                />
                <text
                  x={badgeX}
                  y={badgeY + 4}
                  fontSize={10}
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {c.score}
                </text>
              </g>
            );
          })}

        {/* Junction node — Gold, pulse animation */}
        <circle cx={junctionX} cy={MID_Y} r={6} fill="#C8B89A">
          <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Start dot */}
        <circle cx={LEFT} cy={MID_Y} r={4} fill="#1A1916" />
      </svg>
    </div>
  );
}
