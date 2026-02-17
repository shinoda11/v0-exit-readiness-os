'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useProfileStore, type SavedScenario } from '@/lib/store';
import {
  createDefaultBranches,
  generateWorldlineCandidates,
  buildProfileForCandidate,
  type Branch,
  type WorldlineCandidate,
} from '@/lib/branch';
import { runSimulation } from '@/lib/engine';
import { BranchCategory } from '@/components/branch/branch-category';
import { BranchTreeViz } from '@/components/branch/branch-tree-viz';
import { WorldlinePreview } from '@/components/branch/worldline-preview';

export default function BranchPage() {
  const router = useRouter();
  const { profile, selectedBranchIds, setSelectedBranchIds, addScenarioBatch } =
    useProfileStore();

  const [step, setStep] = useState<'select' | 'preview'>('select');
  const [candidates, setCandidates] = useState<WorldlineCandidate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());

  // Generate default branches from profile
  const defaultBranches = useMemo(() => createDefaultBranches(profile), [profile]);

  // Available branch IDs for filtering stale selections
  const availableIds = useMemo(() => new Set(defaultBranches.map((b) => b.id)), [defaultBranches]);

  // Active selected IDs (filtered against available)
  const activeSelectedIds = useMemo(() => {
    const ids = selectedBranchIds.filter((id) => availableIds.has(id));
    // Auto branches are always selected
    const autoIds = defaultBranches.filter((b) => b.auto).map((b) => b.id);
    return new Set([...autoIds, ...ids]);
  }, [selectedBranchIds, availableIds, defaultBranches]);

  // Categorized branches
  const confirmed = useMemo(
    () => defaultBranches.filter((b) => b.certainty === 'confirmed'),
    [defaultBranches]
  );
  const planned = useMemo(
    () => defaultBranches.filter((b) => b.certainty === 'planned'),
    [defaultBranches]
  );
  const uncertain = useMemo(
    () => defaultBranches.filter((b) => b.certainty === 'uncertain'),
    [defaultBranches]
  );

  // Selected branches (full objects)
  const selectedBranches = useMemo(
    () => defaultBranches.filter((b) => activeSelectedIds.has(b.id)),
    [defaultBranches, activeSelectedIds]
  );

  // Non-auto selected count (to determine if generate button should be enabled)
  const nonAutoSelectedCount = useMemo(
    () => selectedBranches.filter((b) => !b.auto).length,
    [selectedBranches]
  );

  const handleToggle = useCallback(
    (id: string) => {
      const branch = defaultBranches.find((b) => b.id === id);
      if (!branch || branch.auto) return;

      const current = new Set(selectedBranchIds.filter((sid) => availableIds.has(sid)));
      if (current.has(id)) {
        current.delete(id);
      } else {
        current.add(id);
      }
      setSelectedBranchIds(Array.from(current));
    },
    [selectedBranchIds, availableIds, defaultBranches, setSelectedBranchIds]
  );

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const rawCandidates = generateWorldlineCandidates(selectedBranches);
      setProgress({ current: 0, total: rawCandidates.length });

      const scored: WorldlineCandidate[] = [];
      for (let i = 0; i < rawCandidates.length; i++) {
        const c = rawCandidates[i];
        const modifiedProfile = buildProfileForCandidate(profile, c);
        const result = await runSimulation(modifiedProfile);
        scored.push({
          ...c,
          score: result.score.overall,
          result,
        });
        setProgress({ current: i + 1, total: rawCandidates.length });
      }

      setCandidates(scored);
      // Pre-select all candidates
      setSelectedCandidateIds(new Set(scored.map((c) => c.id)));
      setStep('preview');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedBranches, profile]);

  const handleCandidateToggle = useCallback((id: string) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCompare = useCallback(() => {
    const chosen = candidates.filter((c) => selectedCandidateIds.has(c.id));
    const ts = Date.now();
    const scenarios: SavedScenario[] = chosen.map((c) => ({
      id: `branch-${c.id}-${ts}`,
      name: c.label,
      profile: buildProfileForCandidate(profile, c),
      result: c.result ?? null,
      createdAt: new Date().toISOString(),
    }));
    addScenarioBatch(scenarios);
    router.push('/app/worldline');
  }, [candidates, selectedCandidateIds, profile, addScenarioBatch, router]);

  const handleBack = useCallback(() => {
    setStep('select');
  }, []);

  // Message for zero uncertain branches selected
  const hasUncertain = selectedBranches.some((b) => b.certainty === 'uncertain');

  return (
    <div className="max-w-2xl mx-auto md:max-w-5xl px-4 py-6 overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">分岐ビルダー</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          人生の分岐を選び、世界線を自動生成します
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Left: Tree (sticky on desktop) */}
        <div className="md:w-80 md:sticky md:top-20 md:self-start shrink-0 mb-6 md:mb-0">
          <BranchTreeViz
            currentAge={profile.currentAge}
            selectedBranches={selectedBranches}
            candidates={step === 'preview' ? candidates : undefined}
            showScores={step === 'preview'}
          />
        </div>

        {/* Right: Categories or Preview */}
        <div className="flex-1 min-w-0">
          {step === 'select' ? (
            <div className="space-y-6">
              <BranchCategory
                certainty="confirmed"
                branches={confirmed}
                selectedIds={activeSelectedIds}
                onToggle={handleToggle}
              />
              <BranchCategory
                certainty="planned"
                branches={planned}
                selectedIds={activeSelectedIds}
                onToggle={handleToggle}
              />
              <BranchCategory
                certainty="uncertain"
                branches={uncertain}
                selectedIds={activeSelectedIds}
                onToggle={handleToggle}
              />

              {!hasUncertain && nonAutoSelectedCount > 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  不確定な分岐を選ぶとより多くの世界線を比較できます
                </p>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={nonAutoSelectedCount === 0 || isGenerating}
                className="w-full gap-2 bg-[#1A1916] text-[#F0ECE4] hover:bg-[#1A1916]/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中… ({progress.current}/{progress.total})
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    世界線を生成する
                  </>
                )}
              </Button>
            </div>
          ) : (
            <WorldlinePreview
              candidates={candidates}
              selectedIds={selectedCandidateIds}
              onToggle={handleCandidateToggle}
              onCompare={handleCompare}
              onBack={handleBack}
            />
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        本サービスは金融アドバイスではありません。投資判断はご自身の責任で行ってください。
      </p>
    </div>
  );
}
