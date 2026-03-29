const { execFileSync } = require('child_process');
function runGog(args) {
  if (!process.env.GOG_ACCOUNT) {
    throw new Error('GOG_ACCOUNT environment variable is not set');
  }
  const env = { ...process.env };
  return execFileSync('/root/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
const row20 = ['2026-03-20', '93628', '266', '16492', '92695', '268', '11397', '83309', '2181', '18444', '333503', '813', '15791', '72141', '232', '1555'];
const row21 = ['2026-03-21', '93030', '266', '16499', '92714', '269', '11405', '83318', '2181', '18448', '333673', '813', '15804', '72175', '232', '1558'];
runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Follower History!A23:P24', '--values-json', JSON.stringify([row20, row21]), '--no-input']);
console.log('Inserted March 20 and shifted 21 for Follower History');

