const { execFileSync } = require('child_process');
function runGog(args) {
  const env = { ...process.env, GOG_ACCOUNT: 'andysafii9@gmail.com' };
  return execFileSync('/root/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

// Insert missing 19th data for Engagement
const eng19 = [
  ['2026-03-19', 'metmalbekasi', '12', '64.58', '6.58', '0.08', '775', '79'],
  ['2026-03-19', 'grandmetropolitan', '12', '22.83', '2.75', '0.03', '274', '33'],
  ['2026-03-19', 'metmalcileungsi', '12', '213.25', '4.17', '0.26', '2559', '50'],
  ['2026-03-19', 'summareconmal.bekasi', '12', '242.92', '7.58', '0.08', '2915', '91'],
  ['2026-03-19', 'pakuwonmallbekasi', '12', '280.42', '15.42', '0.41', '3365', '185']
];

// Insert missing 19th data for Content Breakdown
const cb19 = [
  ['2026-03-19', 'metmalbekasi', '0', '7', '1', '4', '12'],
  ['2026-03-19', 'grandmetropolitan', '0', '6', '4', '2', '12'],
  ['2026-03-19', 'metmalcileungsi', '0', '2', '8', '2', '12'],
  ['2026-03-19', 'summareconmal.bekasi', '0', '8', '2', '2', '12'],
  ['2026-03-19', 'pakuwonmallbekasi', '0', '8', '2', '2', '12']
];

// We need to shift everything down by 5 rows.
// Current row 43 is 2026-03-20. We will write 19th to 43-47, and move 20th and 21st to 48-57.
const eng20_21 = JSON.parse(runGog(['sheets', 'get', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Engagement!A43:H52', '--json', '--results-only', '--no-input']));
runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Engagement!A43:H57', '--values-json', JSON.stringify([...eng19, ...eng20_21]), '--no-input']);

const cb20_21 = JSON.parse(runGog(['sheets', 'get', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Content Breakdown!A43:G52', '--json', '--results-only', '--no-input']));
runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Content Breakdown!A43:G57', '--values-json', JSON.stringify([...cb19, ...cb20_21]), '--no-input']);

console.log('Fixed missing 19th data for Engagement and Content Breakdown');

