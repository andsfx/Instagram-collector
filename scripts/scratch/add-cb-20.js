const { execFileSync } = require('child_process');
function runGog(args) {
  const env = { ...process.env, GOG_ACCOUNT: 'andysafii9@gmail.com' };
  return execFileSync('/home/ubuntu/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
const cb20 = [
  ['2026-03-20', 'metmalbekasi', '0', '7', '1', '4', '12'],
  ['2026-03-20', 'grandmetropolitan', '0', '6', '4', '2', '12'],
  ['2026-03-20', 'metmalcileungsi', '0', '2', '8', '2', '12'],
  ['2026-03-20', 'summareconmal.bekasi', '0', '8', '2', '2', '12'],
  ['2026-03-20', 'pakuwonmallbekasi', '0', '8', '2', '2', '12']
];
const cb21 = [
  ['2026-03-21', 'metmalbekasi', '0', '6', '5', '1', '12'],
  ['2026-03-21', 'grandmetropolitan', '0', '4', '6', '2', '12'],
  ['2026-03-21', 'metmalcileungsi', '0', '1', '6', '5', '12'],
  ['2026-03-21', 'summareconmal.bekasi', '0', '9', '1', '2', '12'],
  ['2026-03-21', 'pakuwonmallbekasi', '0', '8', '3', '1', '12']
];
runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Content Breakdown!A43:G52', '--values-json', JSON.stringify([...cb20, ...cb21]), '--no-input']);
console.log('Inserted March 20 and shifted 21 for Content Breakdown');

