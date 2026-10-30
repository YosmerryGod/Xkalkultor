
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

async function main() {
  const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    throw new Error('Database URL tidak ditemukan.');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 20000,
  });

  try {
    console.log('Connecting to Neon...');
    await client.connect();
    console.log('Database connected.');

    const schemaPath = path.join(
      __dirname,
      '..',
      'src',
      'db',
      'schema.sql'
    );

    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying database schema...');

    await client.query(schema);

    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('\nMIGRATION ERROR');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Detail:', error.detail);
    console.error('Hint:', error.hint);
    console.error('Stack:', error.stack);

    throw error;
  } finally {
    await client.end();
  }
}

main().catch(() => {
  process.exitCode = 1;
});
