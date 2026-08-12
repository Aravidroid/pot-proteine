const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const csrfOriginProtection = require('../middleware/csrf');
const { validateCustomerDetails } = require('../middleware/validation');

// Rate limiter for customer entry endpoint (Max 20 requests per 15 mins per IP)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many requests. Please try again in a few minutes.' },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Cookie options helper
 */
function getCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/'
    };
}

/**
 * POST /api/auth/customer
 * Passwordless Instant Customer Entry (Name + Phone ONLY)
 */
router.post('/customer', csrfOriginProtection, authLimiter, validateCustomerDetails, async (req, res) => {
    try {
        const { name, phone } = req.validatedBody;

        // Check if customer already exists by phone number
        const existingResult = await db.execute({
            sql: 'SELECT id, name, phone FROM users WHERE phone = ? LIMIT 1',
            args: [phone]
        });

        let userId;

        if (existingResult.rows.length > 0) {
            const existingUser = existingResult.rows[0];
            userId = Number(existingUser.id);

            // Update name if changed
            if (existingUser.name !== name) {
                await db.execute({
                    sql: 'UPDATE users SET name = ? WHERE id = ?',
                    args: [name, userId]
                });
            }
        } else {
            // Create new customer profile
            await db.execute({
                sql: 'INSERT INTO users (name, phone) VALUES (?, ?)',
                args: [name, phone]
            });
            const newUserResult = await db.execute({
                sql: 'SELECT id FROM users WHERE phone = ? LIMIT 1',
                args: [phone]
            });
            userId = Number(newUserResult.rows[0].id);
        }

        // Check first-order eligibility based on order count
        const orderCountResult = await db.execute({
            sql: "SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status != 'cancelled'",
            args: [userId]
        });
        const orderCount = Number(orderCountResult.rows[0]?.count || 0);
        const isFirstOrder = (orderCount === 0);

        // Sign JWT Token
        const token = jwt.sign(
            { id: userId, phone },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Set HTTP-Only Cookie with 30-day maxAge
        res.cookie('pot_token', token, {
            ...getCookieOptions(),
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return res.status(200).json({
            success: true,
            message: `Welcome, ${name}!`,
            user: {
                id: userId,
                name,
                phone,
                is_first_order: isFirstOrder
            }
        });
    } catch (error) {
        console.error('[Customer Entry Error]', error);
        return res.status(500).json({ success: false, message: 'Server error saving customer details.' });
    }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', csrfOriginProtection, (req, res) => {
    res.clearCookie('pot_token', getCookieOptions());
    return res.json({ success: true, message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 * Derives user ID strictly from authenticated session/JWT (req.user.id)
 */
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await db.execute({
            sql: 'SELECT id, name, phone, created_at FROM users WHERE id = ? LIMIT 1',
            args: [req.user.id]
        });

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer profile not found.' });
        }

        const user = result.rows[0];

        // Check first-order eligibility
        const orderCountResult = await db.execute({
            sql: "SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status != 'cancelled'",
            args: [user.id]
        });
        const orderCount = Number(orderCountResult.rows[0]?.count || 0);
        user.is_first_order = (orderCount === 0);

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('[Auth Me Error]', error);
        return res.status(500).json({ success: false, message: 'Server error loading profile.' });
    }
});

module.exports = router;
