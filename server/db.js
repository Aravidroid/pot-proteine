const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

let url;
let authToken = process.env.TURSO_AUTH_TOKEN || undefined;

// Determine DB storage URL safely for local dev vs Vercel serverless
if (process.env.TURSO_DATABASE_URL) {
    url = process.env.TURSO_DATABASE_URL;
} else if (process.env.VERCEL) {
    console.warn('[Database Warning] TURSO_DATABASE_URL environment variable is missing on Vercel. Please configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel project settings.');
    url = 'file:/tmp/pot_protein.db';
} else {
    // Local development fallback
    const dataDir = path.join(__dirname, 'data');
    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    } catch (e) {
        console.warn('[Database] Could not create local data directory:', e.message);
    }
    url = `file:${path.join(dataDir, 'pot_protein.db')}`;
}

// Convert libsql:// protocol to https:// for Vercel serverless HTTP transport
if (url && url.startsWith('libsql://')) {
    url = url.replace(/^libsql:\/\//, 'https://');
}

const client = createClient({
    url,
    authToken
});

let isInitialized = false;
let initPromise = null;

/**
 * Ensures DB schema initialization is complete before any query runs
 */
async function ensureDbInitialized() {
    if (isInitialized) return;
    if (!initPromise) {
        initPromise = (async () => {
            try {
                await client.execute('PRAGMA foreign_keys = ON;');

                // Check if users table exists
                const usersInfo = await client.execute("PRAGMA table_info(users);");
                const hasPasswordColumn = usersInfo.rows.some(col => col.name === 'password_hash');

                if (usersInfo.rows.length === 0) {
                    await client.execute(`
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 50),
                            phone TEXT UNIQUE NOT NULL CHECK(length(phone) = 10),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    console.log('[Database] Created passwordless customer table (Name + Phone).');
                } else if (hasPasswordColumn) {
                    await client.execute(`
                        CREATE TABLE IF NOT EXISTS users_passwordless (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 50),
                            phone TEXT UNIQUE NOT NULL CHECK(length(phone) = 10),
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                    await client.execute(`
                        INSERT OR IGNORE INTO users_passwordless (id, name, phone, created_at)
                        SELECT id, name, phone, created_at FROM users;
                    `);
                    await client.execute("DROP TABLE users;");
                    await client.execute("ALTER TABLE users_passwordless RENAME TO users;");
                    console.log('[Database] Migrated users table to passwordless customer DB.');
                }

                // Create Orders Table
                await client.execute(`
                    CREATE TABLE IF NOT EXISTS orders (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        order_number TEXT UNIQUE NOT NULL CHECK(length(order_number) <= 30),
                        user_id INTEGER,
                        items_json TEXT NOT NULL,
                        total_amount REAL NOT NULL CHECK(total_amount >= 0),
                        instructions TEXT,
                        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')),
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                    );
                `);

                isInitialized = true;
                console.log('[Database] Passwordless customer DB ready.');
            } catch (error) {
                initPromise = null; // allow retry if failed
                console.error('[Database Init Error] Failed to initialize schema:', error);
                throw error;
            }
        })();
    }
    await initPromise;
}

// Export wrapped db object that guarantees schema is initialized before any query executes
const db = {
    async execute(params) {
        await ensureDbInitialized();
        return client.execute(params);
    },
    async batch(steps, mode) {
        await ensureDbInitialized();
        return client.batch(steps, mode);
    },
    async transaction(mode) {
        await ensureDbInitialized();
        return client.transaction(mode);
    }
};

module.exports = db;
