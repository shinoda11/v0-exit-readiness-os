'use client';

import React from 'react';
import { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Baby,
  GraduationCap,
  Plane,
  Home,
  Heart,
  Briefcase,
  Car,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SectionCard } from '@/components/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { LifeEvent, LifeEventType, Profile } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LifeEventsCardProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

// プリセットイベント（ワンクリックで追加可能）
interface PresetEvent {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  type: LifeEventType;
  ageOffset: number; // 現在年齢からの差分
  amount: number;
  duration: number;
  isRecurring: boolean;
  category: 'family' | 'career' | 'lifestyle';
}

const presetEvents: PresetEvent[] = [
  {
    id: 'child1',
    label: '第一子誕生',
    description: '出産・乳幼児期の費用',
    icon: <Baby className="h-5 w-5" />,
    type: 'child_birth',
    ageOffset: 2,
    amount: 100,
    duration: 6,
    isRecurring: true,
    category: 'family',
  },
  {
    id: 'child2',
    label: '第二子誕生',
    description: '出産・乳幼児期の費用',
    icon: <Baby className="h-5 w-5" />,
    type: 'child_birth',
    ageOffset: 5,
    amount: 100,
    duration: 6,
    isRecurring: true,
    category: 'family',
  },
  {
    id: 'edu_private_elem',
    label: '私立小学校',
    description: '年間約150万円 x 6年',
    icon: <GraduationCap className="h-5 w-5" />,
    type: 'education',
    ageOffset: 8,
    amount: 150,
    duration: 6,
    isRecurring: true,
    category: 'family',
  },
  {
    id: 'edu_private_middle',
    label: '私立中学校',
    description: '年間約130万円 x 3年',
    icon: <GraduationCap className="h-5 w-5" />,
    type: 'education',
    ageOffset: 14,
    amount: 130,
    duration: 3,
    isRecurring: true,
    category: 'family',
  },
  {
    id: 'edu_private_high',
    label: '私立高校',
    description: '年間約100万円 x 3年',
    icon: <GraduationCap className="h-5 w-5" />,
    type: 'education',
    ageOffset: 17,
    amount: 100,
    duration: 3,
    isRecurring: true,
    category: 'family',
  },
  {
    id: 'edu_university',
    label: '大学進学',
    description: '私立理系で年間約180万円 x 4年',
    icon: <GraduationCap className="h-5 w-5" />,
    type: 'education',
    ageOffset: 20,
    amount: 180,
    duration: 4,
    isRecurring: true,
    category: 'family',
  },
  {
    id: 'promotion',
    label: '昇進・昇給',
    description: '年収+100万円を想定',
    icon: <Briefcase className="h-5 w-5" />,
    type: 'income_increase',
    ageOffset: 3,
    amount: 100,
    duration: 1,
    isRecurring: false,
    category: 'career',
  },
  {
    id: 'job_change',
    label: '転職',
    description: '年収+150万円を想定',
    icon: <Briefcase className="h-5 w-5" />,
    type: 'income_increase',
    ageOffset: 2,
    amount: 150,
    duration: 1,
    isRecurring: false,
    category: 'career',
  },
  {
    id: 'side_business',
    label: '副業開始',
    description: '年間+50万円を想定',
    icon: <Sparkles className="h-5 w-5" />,
    type: 'income_increase',
    ageOffset: 1,
    amount: 50,
    duration: 10,
    isRecurring: true,
    category: 'career',
  },
  {
    id: 'partial_retire',
    label: '部分リタイア',
    description: '労働時間を半分に、収入も半減',
    icon: <Plane className="h-5 w-5" />,
    type: 'retirement_partial',
    ageOffset: 15,
    amount: 0,
    duration: 1,
    isRecurring: false,
    category: 'career',
  },
  {
    id: 'car_purchase',
    label: '車購入',
    description: '一括購入 300万円',
    icon: <Car className="h-5 w-5" />,
    type: 'asset_purchase',
    ageOffset: 3,
    amount: 300,
    duration: 1,
    isRecurring: false,
    category: 'lifestyle',
  },
  {
    id: 'renovation',
    label: 'リフォーム',
    description: '住宅リフォーム 500万円',
    icon: <Home className="h-5 w-5" />,
    type: 'asset_purchase',
    ageOffset: 20,
    amount: 500,
    duration: 1,
    isRecurring: false,
    category: 'lifestyle',
  },
  {
    id: 'travel',
    label: '海外旅行（年1回）',
    description: '年間50万円 x 10年',
    icon: <Plane className="h-5 w-5" />,
    type: 'expense_increase',
    ageOffset: 5,
    amount: 50,
    duration: 10,
    isRecurring: true,
    category: 'lifestyle',
  },
  {
    id: 'expense_cut',
    label: '支出見直し',
    description: '節約で年間-60万円',
    icon: <Heart className="h-5 w-5" />,
    type: 'expense_decrease',
    ageOffset: 1,
    amount: 60,
    duration: 20,
    isRecurring: true,
    category: 'lifestyle',
  },
];

// 完全ニュートラル配色
const eventTypeConfig: Record<
  LifeEventType,
  { label: string; icon: React.ReactNode; color: string; defaultAmount: number }
> = {
  child_birth: {
    label: '出産・子育て',
    icon: <Baby className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 100,
  },
  education: {
    label: '教育費',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 150,
  },
  income_increase: {
    label: '収入増加',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 100,
  },
  income_decrease: {
    label: '収入減少',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 0,
  },
  expense_increase: {
    label: '支出増加',
    icon: <Home className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 50,
  },
  expense_decrease: {
    label: '支出減少',
    icon: <Heart className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 60,
  },
  asset_purchase: {
    label: '大きな買い物',
    icon: <Home className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 300,
  },
  retirement_partial: {
    label: '部分リタイア',
    icon: <Plane className="h-4 w-4" />,
    color: 'text-gray-500',
    defaultAmount: 0,
  },
};

export function LifeEventsCard({ profile, onUpdate }: LifeEventsCardProps) {
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetEvent | null>(null);
  const [customAge, setCustomAge] = useState<number>(profile.currentAge + 5);
  const [customAmount, setCustomAmount] = useState<number>(100);
  const [newEvent, setNewEvent] = useState<LifeEvent>({
    id: '',
    type: 'child_birth',
    name: '',
    age: profile.currentAge + 5,
    amount: 100,
    duration: 1,
    isRecurring: false,
  });

  // プリセットからイベントを追加
  const addPresetEvent = (preset: PresetEvent) => {
    setSelectedPreset(preset);
    setCustomAge(profile.currentAge + preset.ageOffset);
    setCustomAmount(preset.amount);
    setIsPresetDialogOpen(true);
  };

  const confirmPresetEvent = () => {
    if (!selectedPreset) return;

    const event: LifeEvent = {
      id: `event-${Date.now()}`,
      type: selectedPreset.type,
      name: selectedPreset.label,
      age: customAge,
      amount: customAmount,
      duration: selectedPreset.duration,
      isRecurring: selectedPreset.isRecurring,
    };

    onUpdate({
      lifeEvents: [...profile.lifeEvents, event],
    });

    setIsPresetDialogOpen(false);
    setSelectedPreset(null);
  };

  const removeLifeEvent = (id: string) => {
    onUpdate({
      lifeEvents: profile.lifeEvents.filter((e) => e.id !== id),
    });
  };

  const sortedEvents = [...profile.lifeEvents].sort((a, b) => a.age - b.age);

  // カテゴリ別にプリセットをグループ化
  const familyPresets = presetEvents.filter((p) => p.category === 'family');
  const careerPresets = presetEvents.filter((p) => p.category === 'career');
  const lifestylePresets = presetEvents.filter((p) => p.category === 'lifestyle');

  // 年間影響額の合計を計算
  const totalAnnualImpact = sortedEvents.reduce((sum, event) => {
    const isExpense =
      event.type.includes('expense_increase') ||
      event.type === 'child_birth' ||
      event.type === 'education' ||
      event.type === 'asset_purchase';
    return sum + (isExpense ? -event.amount : event.amount);
  }, 0);

  const addLifeEvent = () => {
    if (!newEvent.name) return;

    onUpdate({
      lifeEvents: [...profile.lifeEvents, newEvent],
    });

    setIsCustomDialogOpen(false);
    setNewEvent({
      id: '',
      type: 'child_birth',
      name: '',
      age: profile.currentAge + 5,
      amount: 100,
      duration: 1,
      isRecurring: false,
    });
  };

  return (
    <SectionCard
      icon={<Calendar className="h-5 w-5" />}
      title="ライフイベント"
      description="将来予定しているイベントをワンクリックで追加"
    >
      <div className="space-y-5">
        {/* Quick add presets - categorized */}
        <div className="space-y-4">
          {/* Family events */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Baby className="h-3 w-3" />
              家族・教育
            </p>
            <div className="flex flex-wrap gap-2">
              {familyPresets.map((preset) => (
                <TooltipProvider key={preset.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-3 bg-transparent"
                        onClick={() => addPresetEvent(preset)}
                      >
                        {preset.icon}
                        <span className="ml-1.5 text-xs">{preset.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{preset.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Career events */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              キャリア・収入
            </p>
            <div className="flex flex-wrap gap-2">
              {careerPresets.map((preset) => (
                <TooltipProvider key={preset.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-3 bg-transparent"
                        onClick={() => addPresetEvent(preset)}
                      >
                        {preset.icon}
                        <span className="ml-1.5 text-xs">{preset.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{preset.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          {/* Lifestyle events */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Plane className="h-3 w-3" />
              ライフスタイル
            </p>
            <div className="flex flex-wrap gap-2">
              {lifestylePresets.map((preset) => (
                <TooltipProvider key={preset.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto py-1.5 px-3 bg-transparent"
                        onClick={() => addPresetEvent(preset)}
                      >
                        {preset.icon}
                        <span className="ml-1.5 text-xs">{preset.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{preset.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>

        {/* Registered events timeline */}
        {sortedEvents.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500">登録済み</p>
              <span className="text-xs text-gray-400">
                年間 {totalAnnualImpact >= 0 ? '+' : ''}{totalAnnualImpact}万円
              </span>
            </div>
            
            {/* Simple list view */}
            <div className="space-y-1">
              {sortedEvents.map((event) => {
                const isExpense =
                  event.type.includes('expense_increase') ||
                  event.type === 'child_birth' ||
                  event.type === 'education' ||
                  event.type === 'asset_purchase';

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between py-1.5 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 tabular-nums w-12">
                        {event.age}歳{event.duration && event.duration > 1 && `〜`}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{event.name}</span>
                      {event.amount > 0 && (
                        <span className="text-xs text-gray-400">
                          {isExpense ? '-' : '+'}{event.amount}万/年
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600"
                      onClick={() => removeLifeEvent(event.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sortedEvents.length === 0 && (
          <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              上のボタンからイベントを追加してください
            </p>
          </div>
        )}

        {/* Preset confirmation dialog */}
        <Dialog open={isPresetDialogOpen} onOpenChange={setIsPresetDialogOpen}>
          {selectedPreset && (
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPreset.icon}
                  {selectedPreset.label}
                </DialogTitle>
                <DialogDescription>
                  {selectedPreset.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Age adjustment */}
                <div className="space-y-2">
                  <Label htmlFor="preset-age">発生年齢</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="preset-age"
                      type="number"
                      min={profile.currentAge}
                      max={100}
                      value={customAge}
                      onChange={(e) => setCustomAge(Number.parseInt(e.target.value) || profile.currentAge)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">歳</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      (あと{customAge - profile.currentAge}年後)
                    </span>
                  </div>
                </div>

                {/* Amount adjustment */}
                <div className="space-y-2">
                  <Label htmlFor="preset-amount">年間金額</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="preset-amount"
                      type="number"
                      min={0}
                      max={10000}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(Number.parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">万円/年</span>
                  </div>
                  {selectedPreset.duration > 1 && (
                    <p className="text-xs text-muted-foreground">
                      期間: {selectedPreset.duration}年間 / 総額: {(customAmount * selectedPreset.duration).toLocaleString()}万円
                    </p>
                  )}
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm">
                    <span className="font-medium">{customAge}歳</span>
                    {selectedPreset.duration > 1 && <span> 〜 {customAge + selectedPreset.duration - 1}歳</span>}
                    の間、
                    <span className="font-semibold text-gray-800">
                      {selectedPreset.type === 'income_increase' || selectedPreset.type === 'expense_decrease'
                        ? `+${customAmount.toLocaleString()}万円/年`
                        : `-${customAmount.toLocaleString()}万円/年`}
                    </span>
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPresetDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={confirmPresetEvent}>
                  追加する
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </SectionCard>
  );
}
