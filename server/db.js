const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

// Ensure local data directory exists for local development
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Config: Use Turso cloud database if credentials exist, otherwise local file DB
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(dataDir, 'pot_protein.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

const db = createClient({
    url,
    authToken
});

let isInitialized = false;

/**
 * Passwordless Customer DB Initialization
 * Stores ONLY customer Name and 10-digit Phone Number.
 */
async function initDB() {
    if (isInitialized) return;

    try {
        await db.execute('PRAGMA foreign_keys = ON;');

        // Check if users table needs migration to remove password_hash
        const usersInfo = await db.execute("PRAGMA table_info(users);");
        const hasPasswordColumn = usersInfo.rows.some(col => col.name === 'password_hash');

        if (usersInfo.rows.length === 0) {
            // Fresh Users Table (Name + Phone ONLY)
            await db.execute(`
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 50),
                    phone TEXT UNIQUE NOT NULL CHECK(length(phone) = 10),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('[Database] Created passwordless customer table (Name + Phone).');
        } else if (hasPasswordColumn) {
            // Safe migration to drop password_hash column
            await db.execute(`
                CREATE TABLE IF NOT EXISTS users_passwordless (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL CHECK(length(name) >= 2 AND length(name) <= 50),
                    phone TEXT UNIQUE NOT NULL CHECK(length(phone) = 10),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await db.execute(`
                INSERT OR IGNORE INTO users_passwordless (id, name, phone, created_at)
                SELECT id, name, phone, created_at FROM users;
            `);
            await db.execute("DROP TABLE users;");
            await db.execute("ALTER TABLE users_passwordless RENAME TO users;");
            console.log('[Database] Migrated users table to passwordless customer DB.');
        }

        // Create Orders Table
        await db.execute(`
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
        console.error('[Database Init Error] Failed to initialize schema:', error);
    }
}

// Run schema initialization once
initDB();

module.exports = db;
