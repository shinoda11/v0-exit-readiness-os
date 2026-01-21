'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/lib/store';
import { useMargin } from '@/hooks/useMargin';
import { useStrategy } from '@/hooks/useStrategy';
import { useWorldLines } from '@/hooks/useWorldLines';
import { Sidebar } from '@/components/layout/sidebar';
import { MoneyMarginCard } from '@/components/v2/MoneyMarginCard';
import { DecisionHost } from '@/components/v2/DecisionHost';
import { WorldLineLens } from '@/components/v2/WorldLineLens';
import { EventLayer } from '@/components/v2/EventLayer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  Shield, 
  Clock, 
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Readiness level colors and labels - 統一カラーパレット（落ち着いたトーン）
const readinessConfig = {
  excellent: { color: 'bg-gray-700', textColor: 'text-gray-700', label: '万全' },
  ready: { color: 'bg-gray-600', textColor: 'text-gray-600', label: '準備完了' },
  on_track: { color: 'bg-gray-500', textColor: 'text-gray-600', label: '順調' },
  needs_work: { color: 'bg-gray-500', textColor: 'text-gray-600', label: '要改善' },
  not_ready: { color: 'bg-gray-600', textColor: 'text-gray-700', label: '要対策' },
};

export default function V2DashboardPage() {
  const { profile, simResult, isLoading, runSimulationAsync } = useProfileStore();
  
  // Calculate margins
  const margins = useMargin({ profile, simResult });
  
  // Get world lines
  const { 
    worldLines, 
    activeWorldLine,
    comparisonWorldLine,
    addEvent,
    removeEvent,
    setActive,
    setComparison,
    comparison,
    createWorldLine,
    needsSync,
    syncToMainProfile,
  } = useWorldLines();
  
  // Get strategy evaluation
  const strategy = useStrategy({
    profile,
    simResult,
    margins: {
      money: margins.money,
      time: margins.time,
      risk: margins.risk,
    },
    worldLines,
  });
  
  // Run initial simulation
  useEffect(() => {
    runSimulationAsync();
  }, []);
  
  const readiness = readinessConfig[strategy.overallAssessment.readinessLevel];
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      {/* Main content - responsive margin for sidebar */}
      <main className="min-h-screen pt-14 lg:pt-0 lg:ml-64 overflow-auto">
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Exit Readiness v2</h1>
              <p className="text-muted-foreground mt-1">
                意思決定を支援する次世代ダッシュボード
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Beta
            </Badge>
          </div>
          
          {/* Overall Assessment Hero */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Score Circle */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(simResult?.score.overall ?? 0) * 3.52} 352`}
                        className={readiness.textColor}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">
                        {simResult?.score.overall.toFixed(0) ?? '--'}
                      </span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                </div>
                
                {/* Assessment Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={cn(readiness.color, 'text-white')}>
                      {readiness.label}
                    </Badge>
                    {strategy.overallAssessment.timeToGoal && (
                      <Badge variant="outline">
                        目標まで {strategy.overallAssessment.timeToGoal} 年
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg font-medium">
                    {strategy.overallAssessment.keyMessage}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>目標: {profile.targetRetireAge}歳</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>生存率: {simResult?.metrics.survivalRate.toFixed(0) ?? '--'}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>信頼度: {strategy.overallAssessment.confidenceScore.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex-shrink-0">
                  <Button className="gap-2">
                    戦略を見る
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="margins" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="margins" className="text-xs sm:text-sm">余白</TabsTrigger>
              <TabsTrigger value="decision" className="text-xs sm:text-sm">意思決定</TabsTrigger>
              <TabsTrigger value="worldlines" className="text-xs sm:text-sm">世界線</TabsTrigger>
              <TabsTrigger value="strategy" className="text-xs sm:text-sm">戦略</TabsTrigger>
            </TabsList>
            
            {/* Margins Tab */}
            <TabsContent value="margins" className="space-y-6">
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <MoneyMarginCard 
                  moneyMargin={margins.moneyMargin} 
                  health={margins.moneyHealth}
                  isLoading={isLoading} 
                />
                
                {/* Time Margin Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-5 w-5 text-gray-500" />
                      時間の余白
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      目標達成への時間的な見通し（断定ではなく目安）
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">
                        {margins.time?.yearsToTarget ?? '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        目標達成まで（年）
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>進捗</span>
                        <span>{margins.time ? `${margins.time.progressPercent.toFixed(0)}%` : '—'}</span>
                      </div>
                      <Progress value={margins.time?.progressPercent ?? 0} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-muted/50 p-2 text-center">
                        <div className="font-medium">{margins.time?.workingYearsLeft ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">労働可能年数</div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-2 text-center">
                        <div className="font-medium">{margins.time?.bufferYears ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">バッファ年数</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Risk Margin Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-5 w-5 text-gray-500" />
                      リスクの余白
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      市場変動への耐性（前提で変わる目安）
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-800">
                        {margins.risk ? `${margins.risk.drawdownCapacity.toFixed(0)}%` : '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        許容下落率
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">ボラティリティ耐性</span>
                        <Badge variant={margins.risk && margins.risk.volatilityTolerance > 15 ? 'default' : 'secondary'}>
                          {margins.risk ? `${margins.risk.volatilityTolerance.toFixed(0)}%` : '—'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">緊急資金カバー率</span>
                        <Badge variant={margins.risk && margins.risk.emergencyFundCoverage >= 6 ? 'default' : 'destructive'}>
                          {margins.risk ? `${margins.risk.emergencyFundCoverage.toFixed(1)}ヶ月` : '—'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">シーケンスリスク</span>
                        <Badge variant={margins.risk && margins.risk.sequenceRisk < 0.3 ? 'default' : 'destructive'}>
                          {margins.risk 
                            ? (margins.risk.sequenceRisk < 0.3 ? '低' : margins.risk.sequenceRisk < 0.6 ? '中' : '高')
                            : '—'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Decision Tab */}
            <TabsContent value="decision">
              <DecisionHost
                conclusion={{
                  type: strategy.overallAssessment.readinessLevel === 'excellent' || 
                        strategy.overallAssessment.readinessLevel === 'ready' 
                    ? 'positive' 
                    : strategy.overallAssessment.readinessLevel === 'on_track'
                    ? 'neutral'
                    : 'negative',
                  headline: strategy.primaryStrategy.name,
                  summary: strategy.primaryStrategy.description,
                  confidence: strategy.primaryStrategy.confidence,
                  keyNumber: {
                    value: strategy.overallAssessment.timeToGoal ?? 0,
                    unit: '年',
                    label: '目標達成まで',
                  },
                }}
                reasons={strategy.strategicInsights.slice(0, 4).map((insight) => ({
                  id: insight.id,
                  type: insight.category === 'strength' || insight.category === 'opportunity' 
                    ? 'positive' 
                    : 'negative',
                  title: insight.title,
                  description: insight.description,
                  impact: insight.relevance,
                }))}
                actions={strategy.urgentActions.slice(0, 3).map((action) => ({
                  id: action.id,
                  priority: action.impact === 'high' ? 'high' : action.impact === 'medium' ? 'medium' : 'low',
                  title: action.title,
                  description: action.description,
                  estimatedImpact: action.estimatedBenefit ?? '',
                  timeframe: action.timeHorizon === 'short' ? '1-3ヶ月' : action.timeHorizon === 'medium' ? '3-12ヶ月' : '1年以上',
                }))}
                isLoading={isLoading}
              />
            </TabsContent>
            
            {/* World Lines Tab */}
            <TabsContent value="worldlines" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <EventLayer
                  events={activeWorldLine?.events ?? []}
                  onAddEvent={(type, startYear, overrides) => {
                    if (activeWorldLine) {
                      addEvent(activeWorldLine.id, type, startYear, overrides);
                    }
                  }}
                  onRemoveEvent={(eventId) => {
                    if (activeWorldLine) {
                      removeEvent(activeWorldLine.id, eventId);
                    }
                  }}
                  currentAge={profile.currentAge}
                  needsSync={needsSync}
                  onSync={syncToMainProfile}
                />
                {/* World Line Creator */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">世界線の追加</CardTitle>
                    <CardDescription>
                      異なるシナリオを比較するために新しい世界線を作成できます
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createWorldLine('支出削減プラン', '月5万円の支出削減を想定')}
                      >
                        支出削減プラン
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createWorldLine('収入増加プラン', '年収100万円アップを想定')}
                      >
                        収入増加プラン
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createWorldLine('早期退職プラン', '5年早くリタイアを目指す')}
                      >
                        早期退職プラン
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => createWorldLine('保守的プラン', 'リスクを抑えた堅実な計画')}
                      >
                        保守的プラン
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      現在の世界線: {worldLines.length}件
                    </p>
                  </CardContent>
                </Card>

                <WorldLineLens
                  worldLines={worldLines}
                  activeWorldLineId={activeWorldLine?.id ?? null}
                  comparisonWorldLineId={comparisonWorldLine?.id ?? null}
                  comparison={comparison}
                  onSelectActive={setActive}
                  onSelectComparison={setComparison}
                />
              </div>
            </TabsContent>
            
            {/* Strategy Tab */}
            <TabsContent value="strategy" className="space-y-6">
              {/* Primary Strategy */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-gray-600" />
                        推奨戦略: {strategy.primaryStrategy.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {strategy.primaryStrategy.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      信頼度 {strategy.primaryStrategy.confidence.toFixed(0)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Expected Outcomes */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        +{strategy.primaryStrategy.expectedOutcome.scoreImprovement}
                      </div>
                      <div className="text-sm text-muted-foreground">スコア改善予測</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {strategy.primaryStrategy.expectedOutcome.timeToFire ?? '--'}年
                      </div>
                      <div className="text-sm text-muted-foreground">目標達成予測</div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-2xl font-bold text-gray-800">
                        {strategy.primaryStrategy.expectedOutcome.riskReduction > 0 ? '-' : '+'}
                        {Math.abs(strategy.primaryStrategy.expectedOutcome.riskReduction)}%
                      </div>
                      <div className="text-sm text-muted-foreground">リスク変化</div>
                    </div>
                  </div>
                  
                  {/* Required Actions */}
                  <div>
                    <h4 className="font-medium mb-3">必要なアクション</h4>
                    <div className="space-y-2">
                      {strategy.primaryStrategy.requiredActions.map((action, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Assumptions */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      前提条件
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {strategy.primaryStrategy.assumptions.map((assumption, index) => (
                        <Badge key={index} variant="secondary">
                          {assumption}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Strategic Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>戦略的インサイト</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {strategy.strategicInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge
                            variant="outline"
                            className="border-gray-400 text-gray-700"
                          >
                            {insight.category === 'strength' && '強み'}
                            {insight.category === 'weakness' && '弱み'}
                            {insight.category === 'opportunity' && '機会'}
                            {insight.category === 'threat' && '脅威'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            関連度 {insight.relevance}%
                          </span>
                        </div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
