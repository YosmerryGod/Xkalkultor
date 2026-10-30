// [ADDED] Run the initial PostgreSQL schema against the configured Neon database.
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const databaseUrl =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!databaseUrl) {
    throw new Error('Missing POSTGRES_URL, DATABASE_URL, or POSTGRES_URL_NON_POOLING.');
  }

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(databaseUrl);

  const schemaPath = path.join(__dirname, '..', 'src', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // [ADDED] The schema contains independent idempotent statements.
  // Execute one statement at a time because Neon HTTP queries do not support
  // sending a multi-statement SQL batch in a single request.
  const statements = schema
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  console.log(`Running ${statements.length} schema statements...`);

  for (let index = 0; index < statements.length; index += 1) {
    await sql.query(statements[index]);
    console.log(`Applied statement ${index + 1}/${statements.length}`);
  }

  console.log('Xkalkultor database schema applied successfully.');
}

main().catch((error) => {
  console.error('Database migration failed:', error.message);
  process.exitCode = 1;
});
