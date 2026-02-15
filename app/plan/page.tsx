'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimelineContent } from '@/components/plan/timeline-content';
import { RSUContent } from '@/components/plan/rsu-content';

function PlanPageContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'rsu' ? 'rsu' : 'timeline';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="min-h-screen pt-14 lg:pt-0 lg:ml-64 p-4 sm:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">ライフプラン</h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              人生の計画を立て、シミュレーションに反映させましょう
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="timeline">ライフイベント</TabsTrigger>
              <TabsTrigger value="rsu">RSU・株式報酬</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <TimelineContent />
            </TabsContent>

            <TabsContent value="rsu">
              <RSUContent />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense>
      <PlanPageContent />
    </Suspense>
  );
}
