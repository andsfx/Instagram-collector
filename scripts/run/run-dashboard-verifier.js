const fs = require('fs');
const path = require('path');
const https = require('https');

const LIVE_DATA_URL = process.env.DASHBOARD_URL || 'https://instagram-tracker-dashboard.vercel.app/data.json';
const REQUIRED_ACCOUNTS = [
  'metmalbekasi',
  'grandmetropolitan',
  'metmalcileungsi',
  'summareconmal.bekasi',
  'pakuwonmallbekasi'
];

function todayWibDate() {
  const now = new Date();
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = wib.getUTCFullYear();
  const mm = String(wib.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(wib.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function loadLatestCronRun(jobId) {
  // Try Hermes cron output first, then fall back to OpenClaw legacy path
  const hermesCronDir = process.env.HERMES_CRON_RUNS || '/root/.hermes/cron/output';
  const legacyDir = '/root/.openclaw/cron/runs';
  
  for (const dir of [hermesCronDir, legacyDir]) {
    const p = path.join(dir, `${jobId}.jsonl`);
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
      if (lines.length) {
        return JSON.parse(lines[lines.length - 1]);
      }
    }
  }
  
  // No cron run data available — return a synthetic "unknown" result
  // so the verifier can still check live data independently
  return { status: 'unknown', delivered: false, deliveryStatus: 'unknown', summary: 'No cron run data available (post-migration)' };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error(`Invalid JSON from ${url}: ${error.message}`));
        }
      });
    }).on('error', reject);
  });
}

function inferMainJobHealth(run) {
  const summaryText = String(run.summary || '').trim();
  if (run.status === 'unknown') {
    // Post-migration: no cron run data available, treat as ambiguous so live data check can override
    return { ok: false, reason: 'No cron run data (post-migration)', ambiguous: true };
  }
  if (run.status !== 'ok') {
    return { ok: false, reason: `run status=${run.status}: ${summaryText || run.error || 'unknown error'}`, ambiguous: false };
  }

  const workflowErrorMatch = summaryText.match(/"workflowStatus"\s*:\s*"error"/i);
  const errorStageMatch = summaryText.match(/"errorStage"\s*:\s*"([^"]+)"/i);
  const errorCodeMatch = summaryText.match(/"errorCode"\s*:\s*"([^"]+)"/i);
  const messageMatch = summaryText.match(/"message"\s*:\s*"([^"]+)"/i);

  if (workflowErrorMatch) {
    const reason = [errorStageMatch && errorStageMatch[1], errorCodeMatch && errorCodeMatch[1], messageMatch && messageMatch[1]]
      .filter(Boolean)
      .join(' | ') || 'workflowStatus=error';
    const ambiguous = /(process_timeout|NO_EXIT_CODE_0|\bRUNNING\b)/i.test(reason);
    return { ok: false, reason, ambiguous };
  }

  if (/(APIFY_TOKEN|GOG_KEYRING_PASSWORD|GOG_ACCOUNT|autentikasi|auth|blocker)/i.test(summaryText)) {
    return { ok: false, reason: summaryText, ambiguous: false };
  }

  if (/(process_timeout|NO_EXIT_CODE_0|\bRUNNING\b)/i.test(summaryText)) {
    return { ok: false, reason: summaryText, ambiguous: true };
  }

  return { ok: true, reason: summaryText || 'ok', ambiguous: false };
}

function validateLiveData(data) {
  if (!data || typeof data !== 'object') return 'data.json invalid';
  if (data.version !== 2) return `unexpected version ${data.version}`;
  if (!data.generated_at) return 'generated_at missing';
  if (!data.generated_at_wib) return 'generated_at_wib missing';
  if (!data.latest || typeof data.latest !== 'object') return 'latest missing';
  if (!data.latest?.date) return 'latest.date missing';
  if (!Array.isArray(data.accounts)) return 'accounts missing';
  if (!Array.isArray(data.history) || data.history.length === 0) return 'history missing';
  if (!data.content_breakdown || typeof data.content_breakdown !== 'object') return 'content_breakdown missing';
  if (!data.post_insights || typeof data.post_insights !== 'object') return 'post_insights missing';

  for (const account of REQUIRED_ACCOUNTS) {
    if (!data.accounts.includes(account)) return `missing account ${account}`;

    const latest = data.latest[account];
    if (!latest || typeof latest !== 'object') return `missing latest payload for ${account}`;
    if (!Number.isFinite(Number(latest.followers))) return `invalid followers for ${account}`;
    if (!Number.isFinite(Number(latest.posts))) return `invalid posts for ${account}`;

    const content = data.content_breakdown[account];
    if (!content || typeof content !== 'object') return `missing content breakdown for ${account}`;
    if (!Number.isFinite(Number(content.total_posts_analyzed)) || Number(content.total_posts_analyzed) <= 0) {
      return `empty content breakdown for ${account}`;
    }

    const insights = data.post_insights[account];
    if (!insights || typeof insights !== 'object') return `missing post insights for ${account}`;
    if (!Array.isArray(insights.posts) || insights.posts.length === 0) return `empty post insights for ${account}`;
  }

  const latestHistoryDate = String(data.history[data.history.length - 1]?.date || '');
  if (latestHistoryDate && latestHistoryDate !== String(data.latest.date || '')) {
    return `latest.date mismatch with history tail (${data.latest.date} vs ${latestHistoryDate})`;
  }

  return null;
}

function classifyFreshness(data) {
  const today = todayWibDate();
  const generatedDate = String(data.generated_at_wib || '').slice(0, 10);
  const latestDate = String(data.latest?.date || '');
  return {
    today,
    generatedDate,
    latestDate,
    buildFresh: generatedDate === today,
    sourceFresh: latestDate === today,
  };
}

async function main() {
  const mainJobId = process.env.MAIN_JOB_ID || '61d312e8-c04d-4e40-9cef-76f03e5bf05c';
  const verifierJobId = process.env.VERIFIER_JOB_ID || 'e5b7fed6-8393-4d38-9409-5c5a992802e5';

  const result = {
    ok: false,
    verifierJobId,
    mainJobId,
    mainJob: null,
    live: null,
    freshness: null,
    alertText: null,
  };

  try {
    const mainRun = loadLatestCronRun(mainJobId);
    const mainHealth = inferMainJobHealth(mainRun);
    result.mainJob = {
      status: mainRun.status,
      delivered: mainRun.delivered,
      deliveryStatus: mainRun.deliveryStatus,
      summary: mainRun.summary || null,
      ok: mainHealth.ok,
      reason: mainHealth.reason,
    };

    const liveData = await fetchJson(LIVE_DATA_URL);
    const liveValidationError = validateLiveData(liveData);
    result.live = {
      url: LIVE_DATA_URL,
      valid: !liveValidationError,
      validationError: liveValidationError,
      generated_at: liveData.generated_at || null,
      generated_at_wib: liveData.generated_at_wib || null,
      latest_date: liveData.latest?.date || null,
    };

    if (liveValidationError) {
      result.alertText = `ALERT: dashboard live data invalid — ${liveValidationError}. URL: ${LIVE_DATA_URL}`;
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    const freshness = classifyFreshness(liveData);
    result.freshness = freshness;

    if (!mainHealth.ok) {
      if (mainHealth.ambiguous && freshness.buildFresh && freshness.sourceFresh) {
        result.ok = true;
        result.alertText = null;
        result.mainJob.reason = `${mainHealth.reason} (suppressed: live dashboard already fresh)`;
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      }

      result.alertText = [
        'ALERT: Instagram daily dashboard automation failed.',
        `- main job status: ${mainRun.status}`,
        `- delivery: ${mainRun.deliveryStatus || (mainRun.delivered ? 'delivered' : 'unknown')}`,
        `- reason: ${mainHealth.reason}`,
      ].join('\n');
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    if (!freshness.buildFresh) {
      result.alertText = [
        'ALERT: dashboard live data is stale.',
        `- generated_at_wib: ${result.live.generated_at_wib || '-'}`,
        `- expected build date (WIB): ${freshness.today}`,
        `- latest.date: ${result.live.latest_date || '-'}`,
      ].join('\n');
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    if (!freshness.sourceFresh) {
      result.alertText = [
        'WARN: dashboard rebuilt today, but source data is still stale.',
        `- generated_at_wib: ${result.live.generated_at_wib || '-'}`,
        `- latest.date: ${result.live.latest_date || '-'}`,
        `- expected source date (WIB): ${freshness.today}`,
      ].join('\n');
      console.log(JSON.stringify(result, null, 2));
      process.exit(1);
    }

    result.ok = true;
    result.alertText = null;
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    result.alertText = `ALERT: dashboard verifier failed — ${error.message}`;
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main();
