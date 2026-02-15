# tri2 proof
generatedAt: 2026-01-19T01:01:24.197Z
gitHead: e4a6735c8be28591df62cc46819a27a7c0e89453

## A) change guard
```
baseRef: origin/main
mergeBase: a229833034dd2a6daa20acc876c0d929093a886d
worktree: DIRTY
changedFiles:
- src/components/CockpitView.tsx
- src/components/TriStrategyCard.tsx
lastCommitChangedFiles:
- src/components/CockpitView.tsx
- src/components/TriStrategyCard.tsx
```

## B) tri2 policy
```
triStrategyExists: true
FAIL: runSimulation() reference found outside src/lib/tri-strategy.ts
- src/components/CockpitView.tsx: const r = runSimulation(effectivePatched as any);
- src/components/CockpitView.tsx: sim = runSimulation(buildEffectiveProfile(s.profile) as any);
```

## result
FAIL

