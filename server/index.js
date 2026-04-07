const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const {
  DATABASE_URL,
  JWT_SECRET,
  PORT = 4000,
  ADMIN_NAME = 'Admin BarberKing',
  ADMIN_EMAIL = 'admin@barberking.com',
  ADMIN_PASSWORD = 'ChangeMe123!',
} = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

const sql = neon(DATABASE_URL);
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

async function ensureUsersTable() {
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
}

async function seedDefaultAdmin() {
  const adminRows = await sql`
    SELECT id
    FROM users
    WHERE email = ${ADMIN_EMAIL.toLowerCase()}
    LIMIT 1
  `;

  if (adminRows.length > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await sql`
    INSERT INTO users (full_name, email, password_hash, role)
    VALUES (${ADMIN_NAME}, ${ADMIN_EMAIL.toLowerCase()}, ${passwordHash}, 'admin')
  `;
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
  };
}

async function findUserByEmail(email) {
  const users = await sql`
    SELECT id, full_name, email, password_hash, role, created_at
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;

  return users[0] || null;
}

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Token no enviado' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

app.get('/api/health', async (_req, res) => {
  const nowRows = await sql`SELECT NOW() AS now`;
  res.json({ ok: true, dbTime: nowRows[0].now });
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName = '', email = '', password = '' } = req.body || {};

  if (!fullName.trim() || !email.trim() || password.length < 6) {
    return res.status(400).json({ message: 'Datos inválidos. Usa nombre, email y una contraseña de mínimo 6 caracteres.' });
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({ message: 'Ese correo ya está registrado.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const rows = await sql`
    INSERT INTO users (full_name, email, password_hash)
    VALUES (${fullName.trim()}, ${email.toLowerCase()}, ${passwordHash})
    RETURNING id, full_name, email, role, created_at
  `;

  const user = rows[0];
  const token = createToken(user);

  res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {};

  if (!email.trim() || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  }

  const token = createToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const rows = await sql`
    SELECT id, full_name, email, role, created_at
    FROM users
    WHERE id = ${req.auth.sub}
    LIMIT 1
  `;

  const user = rows[0];
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado.' });
  }

  res.json({ user: sanitizeUser(user) });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

async function start() {
  await ensureUsersTable();
  await seedDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`API auth running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});