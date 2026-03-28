const { execFileSync } = require('child_process');
function runGog(args) {
  const env = { ...process.env, GOG_ACCOUNT: 'andysafii9@gmail.com' };
  return execFileSync('/root/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

// Update metmalbekasi (Columns B, C, D) for 19th and 20th
// Row 22 is 2026-03-19
// Row 23 is 2026-03-20
const data19 = ['93023', '266', '16497'];
const data20 = ['93030', '266', '16499'];

runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Follower History!B22:D23', '--values-json', JSON.stringify([data19, data20]), '--no-input']);
console.log('Updated March 19 and 20 for metmalbekasi in Follower History');

