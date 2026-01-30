import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Production PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,                         // Maximum connections in pool
    idleTimeoutMillis: 30000,        // Close idle connections after 30s
    connectionTimeoutMillis: 2000,   // Fail fast if can't connect
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connection event handlers
pool.on('connect', () => {
    console.log('PostgreSQL: New client connected');
});

pool.on('error', (err) => {
    console.error('PostgreSQL: Unexpected error on idle client', err);
    process.exit(-1);
});

// Database Adapter Interface (matches existing db.js pattern)
const db = {
    // Select multiple rows
    query: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return result.rows;
    },

    // Select single row
    get: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return result.rows[0] || null;
    },

    // Execute write (Insert/Update/Delete) with RETURNING support
    run: async (sql, params = []) => {
        const result = await pool.query(sql, params);
        return {
            changes: result.rowCount,
            lastInsertRowid: result.rows[0]?.id || null,
            rows: result.rows
        };
    },

    // Transaction support for critical operations
    transaction: async (callback) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback({
                query: (sql, params) => client.query(sql, params),
                run: async (sql, params) => {
                    const res = await client.query(sql, params);
                    return { changes: res.rowCount, rows: res.rows };
                }
            });
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Get raw pool for advanced use
    getPool: () => pool,

    // Health check
    healthCheck: async () => {
        try {
            await pool.query('SELECT 1');
            return { healthy: true };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    },

    // Graceful shutdown
    close: async () => {
        await pool.end();
        console.log('PostgreSQL: Pool closed');
    }
};

export default db;
export { pool };
