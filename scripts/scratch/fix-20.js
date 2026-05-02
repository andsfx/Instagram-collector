const { execFileSync } = require('child_process');
function runGog(args) {
  const env = { ...process.env, GOG_ACCOUNT: 'andysafii9@gmail.com' };
  return execFileSync('/home/ubuntu/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
// metmalbekasi followers on 20th is 93030 instead of 93628
const row20 = ['2026-03-20', '93030', '266', '16492', '92695', '268', '11397', '83309', '2181', '18444', '333503', '813', '15791', '72141', '232', '1555'];
runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Follower History!A23:P23', '--values-json', JSON.stringify([row20]), '--no-input']);
console.log('Updated March 20 for Follower History with correct metmalbekasi followers');

