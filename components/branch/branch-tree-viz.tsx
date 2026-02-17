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
  const LEFT = 40;
  const RIGHT = 360;
  const MID_Y = 120;
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

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">タイムライン</p>
      <svg
        viewBox="0 0 400 240"
        className="w-full h-auto"
        role="img"
        aria-label="人生のタイムライン"
      >
        {/* Main trunk */}
        <line
          x1={LEFT}
          y1={MID_Y}
          x2={RIGHT}
          y2={MID_Y}
          stroke="#D4CFC7"
          strokeWidth={2}
        />

        {/* Age markers */}
        <text x={LEFT} y={MID_Y + 20} fontSize={10} fill="#B5AFA6" textAnchor="middle">
          今
        </text>
        <text
          x={ageToX(65)}
          y={MID_Y + 20}
          fontSize={10}
          fill="#B5AFA6"
          textAnchor="middle"
        >
          65
        </text>
        <text x={RIGHT} y={MID_Y + 20} fontSize={10} fill="#B5AFA6" textAnchor="middle">
          100
        </text>

        {/* 65 marker line */}
        <line
          x1={ageToX(65)}
          y1={MID_Y - 6}
          x2={ageToX(65)}
          y2={MID_Y + 6}
          stroke="#D4CFC7"
          strokeWidth={1}
        />

        {/* Planned branches: upward */}
        {planned.map((b, i) => {
          const x = ageToX(b.age!);
          const endY = MID_Y - 40 - i * 20;
          return (
            <g key={b.id} className="transition-opacity duration-300">
              <line
                x1={x}
                y1={MID_Y}
                x2={x}
                y2={endY}
                stroke={CERTAINTY_COLORS.planned}
                strokeWidth={2}
              />
              <text
                x={x + 6}
                y={endY + 4}
                fontSize={9}
                fill={CERTAINTY_COLORS.planned}
              >
                {b.label}
              </text>
              {/* Junction dot */}
              <circle cx={x} cy={MID_Y} r={5} fill="#C8B89A">
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Uncertain branches: downward, dashed */}
        {uncertain.map((b, i) => {
          const x = ageToX(b.age!);
          const endY = MID_Y + 40 + i * 20;
          return (
            <g key={b.id} className="transition-opacity duration-300">
              <line
                x1={x}
                y1={MID_Y}
                x2={x}
                y2={endY}
                stroke={CERTAINTY_COLORS.uncertain}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <text
                x={x + 6}
                y={endY + 4}
                fontSize={9}
                fill={CERTAINTY_COLORS.uncertain}
              >
                {b.label}
              </text>
              {/* Junction dot */}
              <circle cx={x} cy={MID_Y} r={5} fill="#C8B89A">
                <animate
                  attributeName="r"
                  values="5;7;5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Score badges on branches (preview mode) */}
        {showScores &&
          candidates?.map((c) => {
            if (!c.score || c.id === 'baseline') return null;
            const uniqueBranch = c.branches.find(
              (b) => !b.auto && b.certainty === 'uncertain' && b.age
            );
            if (!uniqueBranch?.age) return null;
            const x = ageToX(uniqueBranch.age);
            const isPlanned = uniqueBranch.certainty === 'planned';
            const y = isPlanned ? MID_Y - 60 : MID_Y + 60;
            return (
              <g key={c.id}>
                <rect
                  x={x - 14}
                  y={y - 8}
                  width={28}
                  height={16}
                  rx={4}
                  fill={c.color}
                  opacity={0.9}
                />
                <text
                  x={x}
                  y={y + 4}
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

        {/* Start dot */}
        <circle cx={LEFT} cy={MID_Y} r={4} fill="#1A1916" />
      </svg>
    </div>
  );
}
