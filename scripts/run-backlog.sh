#!/bin/bash
# scripts/run-backlog.sh
# バックログを1件ずつ消化する。
# 成功時: 自動マーク＋次のタスクへ自動進行
# 失敗時: Telegram通知で yes/stop 待ち
set -euo pipefail

BACKLOG="docs/product-backlog.md"
LOG="docs/snapshot/run-log.txt"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }

# ── Telegram送信 ───────────────────────────────────────────────
telegram_send() {
  local msg="$1"
  local token="${TELEGRAM_BOT_TOKEN:-}"
  local chat_id="${TELEGRAM_CHAT_ID:-}"

  # .env からロード（未設定時のフォールバック）
  if [ -z "$token" ] || [ -z "$chat_id" ]; then
    if [ -f .env ]; then
      # shellcheck disable=SC1091
      source .env
      token="${TELEGRAM_BOT_TOKEN:-$token}"
      chat_id="${TELEGRAM_CHAT_ID:-$chat_id}"
    fi
  fi

  if [ -z "$token" ] || [ -z "$chat_id" ]; then
    log "⚠️ Telegram未設定。メッセージ: $msg"
    return 0
  fi

  curl -s -X POST "https://api.telegram.org/bot${token}/sendMessage" \
    -d chat_id="$chat_id" \
    -d text="$msg" \
    -d parse_mode="Markdown" > /dev/null
}

# ── Telegram返信待ち ────────────────────────────────────────────
telegram_wait_yes() {
  local timeout_sec="${1:-7200}"  # デフォルト2時間待つ
  local token="${TELEGRAM_BOT_TOKEN:-}"
  local chat_id="${TELEGRAM_CHAT_ID:-}"
  local last_update_id=0

  if [ -z "$token" ] || [ -z "$chat_id" ]; then
    if [ -f .env ]; then
      source .env
      token="${TELEGRAM_BOT_TOKEN:-$token}"
      chat_id="${TELEGRAM_CHAT_ID:-$chat_id}"
    fi
  fi

  if [ -z "$token" ] || [ -z "$chat_id" ]; then
    log "⚠️ Telegram未設定。キーボード入力で代替: [yes/stop]"
    read -r reply
    echo "$reply"
    return
  fi

  local waited=0
  while [ $waited -lt $timeout_sec ]; do
    local response
    response=$(curl -s "https://api.telegram.org/bot${token}/getUpdates?offset=$((last_update_id+1))&timeout=30")
    local messages
    messages=$(echo "$response" | python3 -c "
import json,sys
data=json.load(sys.stdin)
for r in data.get('result',[]):
    uid=r['update_id']
    msg=r.get('message',{})
    text=msg.get('text','').strip().lower()
    cid=str(msg.get('chat',{}).get('id',''))
    print(f'{uid}|{cid}|{text}')
" 2>/dev/null)

    while IFS='|' read -r uid cid text; do
      [ -z "$uid" ] && continue
      last_update_id="$uid"
      if [ "$cid" = "$chat_id" ]; then
        if [ "$text" = "yes" ] || [ "$text" = "y" ]; then
          echo "yes"; return
        elif [ "$text" = "stop" ] || [ "$text" = "n" ]; then
          echo "stop"; return
        fi
      fi
    done <<< "$messages"

    sleep 5
    waited=$((waited+35))
  done
  echo "timeout"
}

# ── タスク抽出 ─────────────────────────────────────────────────
get_next_task() {
  # status: [ ] の最初のタスクブロックを抽出
  python3 - "$BACKLOG" <<'PYEOF'
import sys, re

with open(sys.argv[1]) as f:
    content = f.read()

# タスクブロックを抽出（### [ID] から次の ### まで）
pattern = r'(### \[([A-Z0-9a-z-]+)\].*?)\n\*\*status:\*\* \[ \](.*?)(?=\n### |\n---|\Z)'
matches = re.findall(pattern, content, re.DOTALL)

if matches:
    header, task_id, body = matches[0]
    print(f"TASK_ID={task_id}")
    print(f"TASK_BODY<<HEREDOC")
    print(header + "\n**status:** [ ]" + body.rstrip())
    print("HEREDOC")
PYEOF
}

# ── タスクを完了マーク ──────────────────────────────────────────
mark_done() {
  local task_id="$1"
  python3 - "$BACKLOG" "$task_id" <<'PYEOF'
import sys, re

backlog_path, task_id = sys.argv[1], sys.argv[2]
with open(backlog_path) as f:
    content = f.read()

# [ ] → [x] に変更（対象タスクIDのみ）
pattern = rf'(### \[{re.escape(task_id)}\].*?\n\*\*status:\*\*) \[ \]'
new_content = re.sub(pattern, r'\1 [x]', content, count=1, flags=re.DOTALL)

with open(backlog_path, 'w') as f:
    f.write(new_content)

print(f"✅ {task_id} を完了マーク")
PYEOF
}

# ── メインループ ────────────────────────────────────────────────
main() {
  log "🚀 バックログランナー起動"
  telegram_send "🚀 *YOHACK バックログランナー起動*

'stop' で停止できます。"

  while true; do
    # 次のタスクを取得
    task_info=$(get_next_task)
    if [ -z "$task_info" ]; then
      msg="🎉 *バックログ全タスク完了！*"
      log "$msg"
      telegram_send "$msg"
      break
    fi

    eval "$task_info"
    log "📋 次のタスク: $TASK_ID"

    # タスクをClaudeに渡して実行
    log "▶️  $TASK_ID 実行開始"
    telegram_send "⏳ *[$TASK_ID] 実行中...*"

    # Claude Code にタスクを投げる（ヘッドレスモード）
    claude --dangerously-skip-permissions -p "
## 実行指示

以下のタスクを実行してください。

**重要なルール:**
1. まず対象ファイルを全て読む
2. 指示書の「意図」と「完了条件」を把握する
3. Before/Afterコードは参考であり、実際のコードを読んで現状に合わせて実装すること
4. ファイルが見つからない場合は grep で探すこと
5. pnpm build と pnpm test を実行して成功を確認
6. git add . && git commit -m 'feat: $TASK_ID' && git push を実行
7. 最後に1行で「完了: $TASK_ID / 変更ファイル: xxx / テスト: NNN passed」と出力

---

$TASK_BODY
" 2>&1 | tee -a "$LOG"

    exit_code=${PIPESTATUS[0]}

    if [ $exit_code -eq 0 ]; then
      # 成功: 自動マーク＋次のタスクへ自動進行
      mark_done "$TASK_ID"
      git add docs/product-backlog.md
      git commit -m "chore: mark $TASK_ID done in backlog" >> "$LOG" 2>&1 || true
      git push >> "$LOG" 2>&1 || true
      telegram_send "✅ *[$TASK_ID] 完了* → 次のタスクへ自動進行"
      log "✅ $TASK_ID 完了 → 次へ"
    else
      # 失敗: Telegram通知で確認待ち
      telegram_send "⚠️ *[$TASK_ID] エラー発生*

ログ: docs/snapshot/run-log.txt

*yes* → 次のタスクへ
*stop* → 停止"

      log "⏸ Telegramからの返信待ち..."
      reply=$(telegram_wait_yes 7200)
      log "📨 返信: $reply"

      if [ "$reply" = "yes" ]; then
        mark_done "$TASK_ID"
        git add docs/product-backlog.md
        git commit -m "chore: mark $TASK_ID done in backlog" >> "$LOG" 2>&1 || true
        git push >> "$LOG" 2>&1 || true
        log "➡️  次のタスクへ"
      elif [ "$reply" = "timeout" ]; then
        telegram_send "⏰ タイムアウト（2時間）。ランナーを停止します。
再開: sh scripts/run-backlog.sh"
        log "⏰ タイムアウトで停止"
        break
      else
        telegram_send "⏸ 停止しました。
再開: sh scripts/run-backlog.sh"
        log "⏸ ユーザー指示で停止"
        break
      fi
    fi
  done
}

main
