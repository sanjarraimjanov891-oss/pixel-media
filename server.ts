import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const { Pool } = pg;

let isDbConnected = false;
let dbConnectionError: string | null = null;
let pool: pg.Pool | null = null;

function normalizeEnvValue(value: string | undefined): string {
  if (!value) return '';
  let normalized = value.trim();
  if (!normalized) return '';

  if (/^[A-Z0-9_]+=/.test(normalized) && normalized.includes('://')) {
    normalized = normalized.slice(normalized.indexOf('=') + 1).trim();
  }

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function resolveDatabaseUrl(): string {
  const urlKeys = [
    'DATABASE_URL',
    'DATABASE_PRIVATE_URL',
    'POSTGRES_URL',
    'POSTGRES_URL_NON_POOLING',
    'RAILWAY_DATABASE_URL',
  ];

  for (const key of urlKeys) {
    const value = normalizeEnvValue(process.env[key]);
    if (value) return value;
  }

  const host = normalizeEnvValue(process.env.PGHOST);
  const user = normalizeEnvValue(process.env.PGUSER);
  const database = normalizeEnvValue(process.env.PGDATABASE);
  if (!host || !user || !database) return '';

  const password = normalizeEnvValue(process.env.PGPASSWORD);
  const port = normalizeEnvValue(process.env.PGPORT) || '5432';
  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  return `postgresql://${auth}@${host}:${port}/${database}`;
}

function getSslAttempts(connectionString: string): boolean[] {
  let host = '';
  let sslMode = '';

  try {
    const parsed = new URL(connectionString);
    host = parsed.hostname.toLowerCase();
    sslMode = (parsed.searchParams.get('sslmode') || '').toLowerCase();
  } catch {
    // Leave defaults when URL parsing fails; attempt both modes below.
  }

  const envSslMode = normalizeEnvValue(process.env.PGSSLMODE).toLowerCase();
  const effectiveSslMode = sslMode || envSslMode;
  const isInternal = host.includes('.internal');

  if (effectiveSslMode === 'disable') return [false];
  if (effectiveSslMode === 'require' || effectiveSslMode === 'verify-ca' || effectiveSslMode === 'verify-full') return [true];

  if (process.env.NODE_ENV === 'production' && !isInternal) {
    return [true, false];
  }

  return [false, true];
}

async function initPool(connectionString: string): Promise<pg.Pool | null> {
  const attempts = getSslAttempts(connectionString);

  for (const useSsl of attempts) {
    const candidate = new Pool({
      connectionString,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

    try {
      await candidate.query('SELECT 1');
      console.log(`Database connected (${useSsl ? 'SSL' : 'no SSL'})`);
      return candidate;
    } catch (error) {
      dbConnectionError = error instanceof Error ? error.message : String(error);
      console.error(`Database connection failed (${useSsl ? 'SSL' : 'no SSL'}):`, error);
      await candidate.end().catch(() => undefined);
    }
  }

  return null;
}

async function query(text: string, values?: unknown[]) {
  if (!pool) {
    throw new Error('Database pool is not initialized');
  }
  return pool.query(text, values);
}

async function initDB() {
  const dbUrl = resolveDatabaseUrl();
  if (!dbUrl) {
    isDbConnected = false;
    dbConnectionError = 'DATABASE_URL (or PG* variables) is not set';
    console.warn('Database URL is not configured. Running without persistent storage.');
    return;
  }

  pool = await initPool(dbUrl);
  if (!pool) {
    isDbConnected = false;
    return;
  }

  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        deposit VARCHAR(50) NOT NULL,
        operator VARCHAR(100) NOT NULL,
        phone VARCHAR(50),
        details TEXT,
        address TEXT,
        deleted_at BIGINT
      );

      CREATE TABLE IF NOT EXISTS school_orders (
        id SERIAL PRIMARY KEY,
        school_name VARCHAR(255) NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        vignette_type VARCHAR(100) NOT NULL,
        price VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        monitor_phone VARCHAR(50),
        operator VARCHAR(100) NOT NULL,
        deleted_at BIGINT
      );

      CREATE TABLE IF NOT EXISTS ads_orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        price VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        phone VARCHAR(50),
        operator VARCHAR(100) NOT NULL,
        deleted_at BIGINT
      );

      CREATE TABLE IF NOT EXISTS design_orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        design_type VARCHAR(100) NOT NULL,
        size VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        price VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        phone VARCHAR(50),
        operator VARCHAR(100) NOT NULL,
        deleted_at BIGINT
      );
    `);
    console.log('Database initialized successfully');
    isDbConnected = true;
    dbConnectionError = null;
  } catch (error) {
    console.error('Error initializing database:', error);
    dbConnectionError = error instanceof Error ? error.message : String(error);
    isDbConnected = false;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  await initDB();

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', dbConnected: isDbConnected, dbError: isDbConnected ? null : dbConnectionError });
  });

  // Get all orders
  app.get('/api/orders', async (req, res) => {
    if (!isDbConnected) return res.json([]);
    try {
      const result = await query('SELECT * FROM orders ORDER BY id DESC');
      // Convert snake_case to camelCase
      const orders = result.rows.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        date: row.date,
        type: row.type,
        status: row.status,
        deposit: row.deposit,
        operator: row.operator,
        phone: row.phone,
        details: row.details,
        address: row.address,
        deletedAt: row.deleted_at ? parseInt(row.deleted_at) : undefined
      }));
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create order
  app.post('/api/orders', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { customerName, date, type, status, deposit, operator, phone, details, address } = req.body;
    try {
      const result = await query(
        'INSERT INTO orders (customer_name, date, type, status, deposit, operator, phone, details, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [customerName, date, type, status, deposit, operator, phone, details, address]
      );
      const row = result.rows[0];
      res.json({
        id: row.id,
        customerName: row.customer_name,
        date: row.date,
        type: row.type,
        status: row.status,
        deposit: row.deposit,
        operator: row.operator,
        phone: row.phone,
        details: row.details,
        address: row.address
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update order status
  app.patch('/api/orders/:id/status', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    const { status } = req.body;
    try {
      await query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Soft Delete order
  app.delete('/api/orders/:id', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Restore order
  app.post('/api/orders/:id/restore', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE orders SET deleted_at = NULL WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all school orders
  app.get('/api/school-orders', async (req, res) => {
    if (!isDbConnected) return res.json([]);
    try {
      const result = await query('SELECT * FROM school_orders ORDER BY id DESC');
      const orders = result.rows.map(row => ({
        id: row.id,
        schoolName: row.school_name,
        className: row.class_name,
        date: row.date,
        vignetteType: row.vignette_type,
        price: row.price,
        status: row.status,
        monitorPhone: row.monitor_phone,
        operator: row.operator,
        deletedAt: row.deleted_at ? parseInt(row.deleted_at) : undefined
      }));
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create school order
  app.post('/api/school-orders', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { schoolName, className, date, vignetteType, price, status, monitorPhone, operator } = req.body;
    try {
      const result = await query(
        'INSERT INTO school_orders (school_name, class_name, date, vignette_type, price, status, monitor_phone, operator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [schoolName, className, date, vignetteType, price, status, monitorPhone, operator]
      );
      const row = result.rows[0];
      res.json({
        id: row.id,
        schoolName: row.school_name,
        className: row.class_name,
        date: row.date,
        vignetteType: row.vignette_type,
        price: row.price,
        status: row.status,
        monitorPhone: row.monitor_phone,
        operator: row.operator
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Soft Delete school order
  app.delete('/api/school-orders/:id', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE school_orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Restore school order
  app.post('/api/school-orders/:id/restore', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE school_orders SET deleted_at = NULL WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all ads orders
  app.get('/api/ads-orders', async (req, res) => {
    if (!isDbConnected) return res.json([]);
    try {
      const result = await query('SELECT * FROM ads_orders ORDER BY id DESC');
      const orders = result.rows.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        businessType: row.business_type,
        date: row.date,
        price: row.price,
        status: row.status,
        phone: row.phone,
        operator: row.operator,
        deletedAt: row.deleted_at ? parseInt(row.deleted_at) : undefined
      }));
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create ads order
  app.post('/api/ads-orders', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { customerName, businessType, date, price, status, phone, operator } = req.body;
    try {
      const result = await query(
        'INSERT INTO ads_orders (customer_name, business_type, date, price, status, phone, operator) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [customerName, businessType, date, price, status, phone, operator]
      );
      const row = result.rows[0];
      res.json({
        id: row.id,
        customerName: row.customer_name,
        businessType: row.business_type,
        date: row.date,
        price: row.price,
        status: row.status,
        phone: row.phone,
        operator: row.operator
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Soft Delete ads order
  app.delete('/api/ads-orders/:id', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE ads_orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Restore ads order
  app.post('/api/ads-orders/:id/restore', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE ads_orders SET deleted_at = NULL WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get all design orders
  app.get('/api/design-orders', async (req, res) => {
    if (!isDbConnected) return res.json([]);
    try {
      const result = await query('SELECT * FROM design_orders ORDER BY id DESC');
      const orders = result.rows.map(row => ({
        id: row.id,
        customerName: row.customer_name,
        designType: row.design_type,
        size: row.size,
        date: row.date,
        price: row.price,
        status: row.status,
        phone: row.phone,
        operator: row.operator,
        deletedAt: row.deleted_at ? parseInt(row.deleted_at) : undefined
      }));
      res.json(orders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create design order
  app.post('/api/design-orders', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { customerName, designType, size, date, price, status, phone, operator } = req.body;
    try {
      const result = await query(
        'INSERT INTO design_orders (customer_name, design_type, size, date, price, status, phone, operator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [customerName, designType, size, date, price, status, phone, operator]
      );
      const row = result.rows[0];
      res.json({
        id: row.id,
        customerName: row.customer_name,
        designType: row.design_type,
        size: row.size,
        date: row.date,
        price: row.price,
        status: row.status,
        phone: row.phone,
        operator: row.operator
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Soft Delete design order
  app.delete('/api/design-orders/:id', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE design_orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Restore design order
  app.post('/api/design-orders/:id/restore', async (req, res) => {
    if (!isDbConnected) return res.status(500).json({ error: 'Database not configured' });
    const { id } = req.params;
    try {
      await query('UPDATE design_orders SET deleted_at = NULL WHERE id = $1', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
