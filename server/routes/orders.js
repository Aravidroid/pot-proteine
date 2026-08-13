const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const csrfOriginProtection = require('../middleware/csrf');
const { validateOrderPayload } = require('../middleware/validation');
const { calculateOrderTotal } = require('../catalog');

/**
 * POST /api/orders
 * Creates new customer order with server-side price calculation & authorization
 */
router.post('/', csrfOriginProtection, optionalAuth, validateOrderPayload, async (req, res) => {
    try {
        const { order_number, items, instructions } = req.validatedBody;

        // 1. Derive user_id EXCLUSIVELY from authenticated session/JWT
        const userId = req.user ? req.user.id : null;

        // 2. Check first-order eligibility server-side — must be logged in to use the offer
        let isFirstOrder = false;
        if (userId) {
            const countRes = await db.execute({
                sql: "SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status != 'cancelled'",
                args: [userId]
            });
            isFirstOrder = (Number(countRes.rows[0]?.count || 0) === 0);
        }

        // 3. Calculate authoritative total server-side
        const calculation = calculateOrderTotal(items, { isFirstOrder });
        if (!calculation.isValid) {
            return res.status(400).json({ success: false, message: calculation.error });
        }

        const calculatedTotalAmount = calculation.totalAmount;

        // 4. Serialize items details with calculated prices
        const itemsJson = JSON.stringify(calculation.itemDetails);

        // 4. Save to Database
        await db.execute({
            sql: `INSERT INTO orders (order_number, user_id, items_json, total_amount, instructions, status) 
                  VALUES (?, ?, ?, ?, ?, 'pending')`,
            args: [order_number, userId, itemsJson, calculatedTotalAmount, instructions || '']
        });

        return res.status(201).json({
            success: true,
            message: 'Order recorded successfully!',
            order_number,
            calculated_total: calculatedTotalAmount
        });
    } catch (error) {
        console.error('[Orders Create Error]', error);
        // Handle duplicate order number constraint error
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ success: false, message: 'An order with this order number already exists.' });
        }
        return res.status(500).json({ success: false, message: 'Server error recording order.' });
    }
});

/**
 * GET /api/orders
 * Returns customer order history strictly scoped to authenticated user ID
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Enforce authorization: query orders exclusively for req.user.id
        const result = await db.execute({
            sql: `SELECT id, order_number, items_json, total_amount, instructions, status, created_at 
                  FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
            args: [req.user.id]
        });

        const orders = result.rows.map(row => ({
            id: row.id,
            order_number: row.order_number,
            items: JSON.parse(row.items_json || '[]'),
            total_amount: row.total_amount,
            instructions: row.instructions,
            status: row.status,
            created_at: row.created_at
        }));

        return res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('[Orders Fetch Error]', error);
        return res.status(500).json({ success: false, message: 'Server error loading order history.' });
    }
});

module.exports = router;
