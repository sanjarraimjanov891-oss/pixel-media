import express from 'express';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const { Pool } = pg;

// Initialize PostgreSQL connection pool
// For Railway, you'll need a DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let isDbConnected = false;

async function initDB() {
  try {
    // Check if URL is internal (Railway specific issue)
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('.internal')) {
      console.error('ERROR: You are using an internal Railway database URL (postgres.railway.internal).');
      console.error('Please use the PUBLIC connection string from Railway instead.');
      isDbConnected = false;
      return;
    }

    // Create tables if they don't exist
    await pool.query(`
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
  } catch (error) {
    console.error('Error initializing database:', error);
    isDbConnected = false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize DB only if DATABASE_URL is provided
  if (process.env.DATABASE_URL) {
    await initDB();
  }

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', dbConnected: isDbConnected });
  });

  // Get all orders
  app.get('/api/orders', async (req, res) => {
    if (!isDbConnected) return res.json([]);
    try {
      const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
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
      const result = await pool.query(
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
      await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
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
      await pool.query('UPDATE orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
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
      await pool.query('UPDATE orders SET deleted_at = NULL WHERE id = $1', [id]);
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
      const result = await pool.query('SELECT * FROM school_orders ORDER BY id DESC');
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
      const result = await pool.query(
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
      await pool.query('UPDATE school_orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
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
      await pool.query('UPDATE school_orders SET deleted_at = NULL WHERE id = $1', [id]);
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
      const result = await pool.query('SELECT * FROM ads_orders ORDER BY id DESC');
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
      const result = await pool.query(
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
      await pool.query('UPDATE ads_orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
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
      await pool.query('UPDATE ads_orders SET deleted_at = NULL WHERE id = $1', [id]);
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
      const result = await pool.query('SELECT * FROM design_orders ORDER BY id DESC');
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
      const result = await pool.query(
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
      await pool.query('UPDATE design_orders SET deleted_at = $1 WHERE id = $2', [Date.now(), id]);
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
      await pool.query('UPDATE design_orders SET deleted_at = NULL WHERE id = $1', [id]);
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
