/**
 * Strict Server-Side Payload Validation Middleware
 * Rejects missing, malformed, oversized, or unexpected fields with HTTP 400.
 * Passwordless: Expects ONLY Name and 10-digit Phone Number for Customer Details.
 */

const PHONE_REGEX = /^[0-9]{10}$/;
const ORDER_NUMBER_REGEX = /^PP[0-9]{6}-[0-9]{4}$/;
const VALID_PRODUCT_IDS = ['1', '2', '3', '4', 'healthy-workday-menu', '5'];
const VALID_PLAN_IDS = ['daily', 'weekly', 'monthly'];

/**
 * Check if object contains unexpected extra keys
 */
function checkForUnexpectedKeys(body, allowedKeys) {
    const keys = Object.keys(body);
    const extraKeys = keys.filter(k => !allowedKeys.includes(k));
    if (extraKeys.length > 0) {
        return `Unexpected fields in payload: ${extraKeys.join(', ')}`;
    }
    return null;
}

/**
 * Validate Customer Details Payload (Requires ONLY Name and Phone)
 */
function validateCustomerDetails(req, res, next) {
    const body = req.body;

    if (!body || typeof body !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid JSON request payload.' });
    }

    const extraKeysError = checkForUnexpectedKeys(body, ['name', 'phone']);
    if (extraKeysError) {
        return res.status(400).json({ success: false, message: extraKeysError });
    }

    let { name, phone } = body;

    if (typeof name !== 'string' || typeof phone !== 'string') {
        return res.status(400).json({ success: false, message: 'Name and phone must be strings.' });
    }

    name = name.trim();
    phone = phone.trim();

    if (name.length < 2 || name.length > 50) {
        return res.status(400).json({ success: false, message: 'Name must be between 2 and 50 characters.' });
    }

    if (!PHONE_REGEX.test(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits.' });
    }

    req.validatedBody = {
        name,
        phone
    };

    next();
}

/**
 * Validate Order Creation Payload
 */
function validateOrderPayload(req, res, next) {
    const body = req.body;

    if (!body || typeof body !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid JSON request payload.' });
    }

    const { order_number, items, instructions } = body;

    if (typeof order_number !== 'string' || !ORDER_NUMBER_REGEX.test(order_number.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid order number format. Expected format: PPddmmyy-hhmm (e.g. PP120826-1930).' });
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
        return res.status(400).json({ success: false, message: 'Items must be a non-empty array with up to 20 items.' });
    }

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            return res.status(400).json({ success: false, message: 'Each item must be an object.' });
        }
        if (!item.id || !VALID_PRODUCT_IDS.includes(String(item.id))) {
            return res.status(400).json({ success: false, message: `Invalid or unsupported product ID: ${item.id}` });
        }
        const qty = Number(item.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
            return res.status(400).json({ success: false, message: `Invalid item quantity for product ${item.id}. Must be integer between 1 and 100.` });
        }
        if (item.selectedPlanId && !VALID_PLAN_IDS.includes(String(item.selectedPlanId).toLowerCase())) {
            return res.status(400).json({ success: false, message: `Invalid plan duration ID: ${item.selectedPlanId}` });
        }
    }

    if (instructions !== undefined && instructions !== null) {
        if (typeof instructions !== 'string' || instructions.length > 500) {
            return res.status(400).json({ success: false, message: 'Instructions must be a string up to 500 characters.' });
        }
    }

    req.validatedBody = {
        order_number: order_number.trim(),
        items,
        instructions: instructions ? instructions.trim() : ''
    };

    next();
}

module.exports = {
    validateCustomerDetails,
    validateOrderPayload
};
