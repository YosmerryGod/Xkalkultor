// [ADDED] Create the first admin using credentials supplied through environment variables.
const { randomBytes, scryptSync } = require('node:crypto');

async function main() {
  const databaseUrl =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const firstName = String(process.env.ADMIN_FIRST_NAME || 'Admin').trim();
  const storeName = String(process.env.ADMIN_STORE_NAME || 'Exkalt Admin').trim();

  if (!databaseUrl) throw new Error('Missing POSTGRES_URL or DATABASE_URL.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set a valid ADMIN_EMAIL.');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters.');

  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  const passwordHash = `scrypt:${salt}:${hash}`;

  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(databaseUrl);
  const rows = await sql`
    INSERT INTO users (username, email, password_hash, first_name, store_name, role)
    VALUES (${email}, ${email}, ${passwordHash}, ${firstName}, ${storeName}, 'admin')
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, role
  `;

  if (!rows.length) {
    console.log('An account with this email already exists. No password or role was changed.');
    return;
  }

  console.log('Admin account created:', rows[0].email);
}

main().catch((error) => {
  console.error('Admin bootstrap failed:', error.message);
  process.exitCode = 1;
});
