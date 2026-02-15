# dash-ui proof
generatedAt: 2026-01-19T08:45:35.786Z
gitHead: ccff2ca2732cf3b361c535760cba98abf5730680
node: v24.12.0

## A) 変更ファイル制約
```
baseRef: origin/main
mergeBase: ba707260ec49cd472c125213e5033c04bb38ad81
diffCmd: git diff --name-only --no-color origin/main...HEAD
diffArtifact: C:/exit-readiness-os/artifacts/dash-ui-diff.txt
worktree: CLEAN
changedFiles:
- src/components/CockpitView.tsx
- src/components/LifeEventCareCostCard.tsx
- src/components/LifeEventChildCostCard.tsx
- src/components/LifeEventRelocationCard.tsx
```

## B) runSimulation 追加検知
```
no added runSimulation() calls
```

## C) 内部用語UI露出チェック
JSX上で表示される文字列のみを検出対象にする
```
no banned literals in displayed strings
```

## result
PASS
