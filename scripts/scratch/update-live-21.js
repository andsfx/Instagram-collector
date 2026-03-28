const { execFileSync } = require('child_process');
const fs = require('fs');

function runGog(args) {
  const env = { ...process.env, GOG_ACCOUNT: 'andysafii9@gmail.com' };
  return execFileSync('/root/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

const data = JSON.parse(fs.readFileSync('/root/.openclaw/workspace/incoming/Instagram-collector/apify-profiles.json', 'utf8'));

const row21 = [
  '2026-03-21',
  String(data['metmalbekasi'].followers),
  String(data['metmalbekasi'].following),
  String(data['metmalbekasi'].posts),
  String(data['grandmetropolitan'].followers),
  String(data['grandmetropolitan'].following),
  String(data['grandmetropolitan'].posts),
  String(data['metmalcileungsi'].followers),
  String(data['metmalcileungsi'].following),
  String(data['metmalcileungsi'].posts),
  String(data['summareconmal.bekasi'].followers),
  String(data['summareconmal.bekasi'].following),
  String(data['summareconmal.bekasi'].posts),
  String(data['pakuwonmallbekasi'].followers),
  String(data['pakuwonmallbekasi'].following),
  String(data['pakuwonmallbekasi'].posts)
];

runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Follower History!A24:P24', '--values-json', JSON.stringify([row21]), '--no-input']);
console.log('Updated March 21 with live Apify data');

