const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

dotenv.config();

const {
  DATABASE_URL,
  ADMIN_NAME = 'Admin BarberKing',
  ADMIN_EMAIL = 'admin@barberking.com',
  ADMIN_PASSWORD = 'ChangeMe123!',
} = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const sql = neon(DATABASE_URL);

async function seedAdmin() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await sql`
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (${ADMIN_NAME}, ${ADMIN_EMAIL.toLowerCase()}, ${passwordHash}, 'admin')
    ON CONFLICT (email)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      password_hash = EXCLUDED.password_hash,
      role = EXCLUDED.role
  `;

  console.log(`Admin ready: ${ADMIN_EMAIL}`);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});