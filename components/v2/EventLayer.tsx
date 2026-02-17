'use client';

/**
 * Exit Readiness OS v2 - EventLayer
 * ライフイベントの選択と追加
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Baby, 
  GraduationCap, 
  Briefcase, 
  Home,
  Heart,
  Plane,
  Stethoscope,
  Users,
  Lock,
  RefreshCw
} from 'lucide-react';
import { EVENT_TEMPLATES, type EventType, type ScenarioEvent } from '@/lib/v2/events';
import { cn } from '@/lib/utils';

interface EventLayerProps {
  events: ScenarioEvent[];
  onAddEvent: (type: EventType, startYear: number, overrides?: Partial<ScenarioEvent>) => void;
  onRemoveEvent: (eventId: string) => void;
  currentAge: number;
  needsSync?: boolean;
  onSync?: () => void;
}

// 数値化可能なイベント（シミュレーションに反映できる）
const SUPPORTED_EVENT_TYPES: EventType[] = [
  'CHILDCARE',
  'ELDERCARE', 
  'RELOCATION',
  'JOB_CHANGE',
  'SABBATICAL',
  'EDUCATION',
  'MARRIAGE',
  'DIVORCE',
  'INHERITANCE',
  'SIDE_BUSINESS',
  'HEALTH_ISSUE',
];

// 未対応のイベント（今後実装予定）
const UNSUPPORTED_EVENT_TYPES: EventType[] = [
  'HOUSING_PURCHASE', // 住宅シミュレーターで別途計算
  'HOUSING_RENT',     // 住宅シミュレーターで別途計算
  'CUSTOM',           // カスタムは入力UIが複雑
];

const eventTypeIcons: Record<EventType, typeof Baby> = {
  CHILDCARE: Baby,
  ELDERCARE: Users,
  RELOCATION: Plane,
  JOB_CHANGE: Briefcase,
  SABBATICAL: Plane,
  EDUCATION: GraduationCap,
  MARRIAGE: Heart,
  DIVORCE: Heart,
  INHERITANCE: Home,
  SIDE_BUSINESS: Briefcase,
  HEALTH_ISSUE: Stethoscope,
  HOUSING_PURCHASE: Home,
  HOUSING_RENT: Home,
  CUSTOM: Plus,
};

// 統一カラーパレット - グレー系でニュートラルに
const eventTypeColors: Record<EventType, string> = {
  CHILDCARE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  ELDERCARE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  RELOCATION: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  JOB_CHANGE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  SABBATICAL: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  EDUCATION: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  MARRIAGE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  DIVORCE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  INHERITANCE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  SIDE_BUSINESS: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  HEALTH_ISSUE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  HOUSING_PURCHASE: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  HOUSING_RENT: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
  CUSTOM: 'bg-[#FAF9F7] text-[#5A5550] border-[#F0ECE4]',
};

export function EventLayer({ events, onAddEvent, onRemoveEvent, currentAge, needsSync, onSync }: EventLayerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EventType>('CHILDCARE');
  const [startYear, setStartYear] = useState(currentAge + 5);
  const [customName, setCustomName] = useState('');
  
  const handleAddEvent = () => {
    const template = EVENT_TEMPLATES[selectedType];
    const overrides: Partial<ScenarioEvent> = {};
    
    if (selectedType === 'CUSTOM' && customName) {
      overrides.name = customName;
    }
    
    onAddEvent(selectedType, startYear - currentAge, overrides);
    setIsDialogOpen(false);
    setCustomName('');
  };
  
  // よく使うイベントのクイック追加（対応済みのみ）
  const quickEvents: EventType[] = ['CHILDCARE', 'JOB_CHANGE', 'EDUCATION', 'SIDE_BUSINESS'];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">ライフイベント</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              イベントを追加するとシミュレーションに反映されます
            </p>
          </div>
          <div className="flex items-center gap-2">
            {needsSync && onSync && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A7A62] font-medium animate-pulse">
                  反映が必要
                </span>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={onSync}
                  className="bg-[#1A1916] hover:bg-[#1A1916]/90 text-white"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  反映する
                </Button>
              </div>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  追加
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ライフイベントを追加</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>イベントの種類</Label>
                  <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EventType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TEMPLATES).map(([type, template]) => {
                        const isSupported = SUPPORTED_EVENT_TYPES.includes(type as EventType);
                        return (
                          <SelectItem 
                            key={type} 
                            value={type}
                            disabled={!isSupported}
                          >
                            <span className="flex items-center gap-2">
                              {template.name}
                              {!isSupported && (
                                <span className="text-xs text-muted-foreground">(未対応)</span>
                              )}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedType === 'CUSTOM' && (
                  <div className="space-y-2">
                    <Label>イベント名</Label>
                    <Input
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="イベント名を入力"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>発生年齢</Label>
                  <Input
                    type="number"
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    min={currentAge}
                    max={100}
                  />
                </div>
                
                {/* イベントの影響プレビュー */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-medium">このイベントの影響:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>年間支出: {EVENT_TEMPLATES[selectedType].impact.money > 0 ? '+' : ''}{EVENT_TEMPLATES[selectedType].impact.money}万円</li>
                    <li>週あたり時間: {EVENT_TEMPLATES[selectedType].impact.time > 0 ? '-' : '+'}{Math.abs(EVENT_TEMPLATES[selectedType].impact.time)}時間</li>
                    <li>継続期間: {EVENT_TEMPLATES[selectedType].durationYears === 0 ? '永続' : `${EVENT_TEMPLATES[selectedType].durationYears}年間`}</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleAddEvent}>
                  追加
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* クイック追加ボタン */}
        <div className="mb-4 flex flex-wrap gap-2">
          {quickEvents.map((type) => {
            const Icon = eventTypeIcons[type];
            const template = EVENT_TEMPLATES[type];
            return (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={cn('gap-1', eventTypeColors[type])}
                onClick={() => {
                  setSelectedType(type);
                  setIsDialogOpen(true);
                }}
              >
                <Icon className="h-3 w-3" />
                {template.name}
              </Button>
            );
          })}
        </div>
        
        {/* イベントリスト */}
        {events.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              ライフイベントがありません。上のボタンから追加してください。
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => {
              const Icon = eventTypeIcons[event.type];
              return (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3',
                    eventTypeColors[event.type]
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-xs opacity-70">
                        {currentAge + event.startYear}歳から
                        {event.durationYears > 0 ? ` ${event.durationYears}年間` : ''}
                        {' | '}年間{event.impact.money > 0 ? '+' : ''}{event.impact.money}万円
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveEvent(event.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
