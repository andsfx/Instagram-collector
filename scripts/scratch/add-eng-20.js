const { execFileSync } = require('child_process');
function runGog(args) {
  if (!process.env.GOG_ACCOUNT) {
    throw new Error('GOG_ACCOUNT environment variable is not set');
  }
  const env = { ...process.env };
  return execFileSync('/home/ubuntu/.local/bin/gog', args, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
const eng20 = [
  ['2026-03-20', 'metmalbekasi', '12', '64.58', '6.58', '0.08', '775', '79'],
  ['2026-03-20', 'grandmetropolitan', '12', '22.83', '2.75', '0.03', '274', '33'],
  ['2026-03-20', 'metmalcileungsi', '12', '213.25', '4.17', '0.26', '2559', '50'],
  ['2026-03-20', 'summareconmal.bekasi', '12', '242.92', '7.58', '0.08', '2915', '91'],
  ['2026-03-20', 'pakuwonmallbekasi', '12', '280.42', '15.42', '0.41', '3365', '185']
];
const eng21 = [
  ['2026-03-21', 'metmalbekasi', '12', '31.58', '6.67', '0.04', '379', '80'],
  ['2026-03-21', 'grandmetropolitan', '12', '70.5', '5.25', '0.08', '846', '63'],
  ['2026-03-21', 'metmalcileungsi', '12', '214.42', '4', '0.26', '2573', '48'],
  ['2026-03-21', 'summareconmal.bekasi', '12', '227.25', '12.25', '0.07', '2727', '147'],
  ['2026-03-21', 'pakuwonmallbekasi', '12', '142.58', '14.25', '0.22', '1711', '171']
];
runGog(['sheets', 'update', '1MdTlen1rcq1ZplbTwfHzj-kHFBoQufgahzRAxZPqt7U', 'Engagement!A43:H52', '--values-json', JSON.stringify([...eng20, ...eng21]), '--no-input']);
console.log('Inserted March 20 and shifted 21 for Engagement');

