import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { upsertPrepSubscriber, insertFitGateResponse } from '@/lib/supabase/db';

export async function POST(req: Request) {
  try {
    const { email, judgment, prepBucket, fitgateAnswers } = await req.json();

    console.log(
      '[Prep登録]',
      email,
      `judgment=${judgment}`,
      prepBucket ? `bucket=${prepBucket}` : '',
      new Date().toISOString()
    );

    // Supabase に保存（env が設定されている場合のみ）
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = await createClient();

        // FitGate 回答を保存
        await insertFitGateResponse(supabase, {
          email,
          answers: fitgateAnswers ?? {},
          judgment,
          prepBucket: prepBucket ?? null,
        });

        // Prep モード購読者として登録
        await upsertPrepSubscriber(supabase, {
          email,
          judgment,
          prepBucket: prepBucket ?? null,
          fitgateAnswers: fitgateAnswers ?? null,
        });
      } catch (dbError) {
        // DB保存失敗はログのみ（UXを止めない）
        console.error('[Prep登録] Supabase保存失敗:', dbError);
      }
    }

    // TODO Phase3: SendGrid でレター送信

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
