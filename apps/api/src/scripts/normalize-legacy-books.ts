import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { normalizeLegacyBooks } from '../services/book-normalization.service.js';

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const refreshSynopsis = args.has('--refresh-synopsis');

  await mongoose.connect(env.MONGODB_URI);
  try {
    const result = await normalizeLegacyBooks({ dryRun, refreshSynopsis });
    console.log(
      JSON.stringify(
        {
          dryRun,
          refreshSynopsis,
          ...result,
        },
        null,
        2,
      ),
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
