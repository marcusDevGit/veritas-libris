import { runOfflineMagisteriumEval } from '../services/magisterium-eval.js';

const report = runOfflineMagisteriumEval();
console.log(JSON.stringify(report, null, 2));

if (report.passed !== report.total) {
  process.exit(1);
}
