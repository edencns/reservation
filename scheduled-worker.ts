/**
 * Cloudflare Scheduled Worker — 7일 전 리마인더 문자 발송
 *
 * 배포 방법:
 *   wrangler.toml 에 아래 항목이 추가되어 있어야 함:
 *     [triggers]
 *     crons = ["0 1 * * *"]   ← 매일 오전 10시 KST (UTC+9 기준 01:00 UTC)
 *
 *   main = "scheduled-worker.ts" 도 wrangler.toml 에 설정 필요
 */

interface Env {
  SITE_URL: string;
  CRON_SECRET?: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const url = `${(env.SITE_URL ?? '').replace(/\/$/, '')}/api/sms/send-reminders`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.CRON_SECRET ? { 'X-Cron-Secret': env.CRON_SECRET } : {}),
      },
    });
  },
};
