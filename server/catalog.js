/**
 * Server-Side Authoritative Product Price Catalog
 * Supports Supreme Box First-Order Offer (₹119 instead of ₹199 for first order)
 */

const PRODUCT_CATALOG = {
    '1': { id: '1', name: 'Regular Weight Gain Pot', basePrice: 149, isSupreme: false },
    '2': { id: '2', name: 'Regular Weight Loss Pot', basePrice: 149, isSupreme: false },
    '3': { id: '3', name: 'Supreme Weight Gain Pot', basePrice: 199, isSupreme: true },
    '4': { id: '4', name: 'Supreme Weight Loss Pot', basePrice: 199, isSupreme: true },
    'healthy-workday-menu': { id: 'healthy-workday-menu', name: 'Healthy Workday Pot', basePrice: 69, isSupreme: false },
    '5': { id: '5', name: 'Diabetic Menu Pot', basePrice: 69, isSupreme: false }
};

const PLAN_MULTIPLIERS = {
    'daily': 1,
    'weekly': 6,
    'monthly': 26
};

// First Order Supreme Box Offer Price
const SUPREME_FIRST_ORDER_PRICE = 119;

/**
 * Get product price details by ID
 */
function getProductById(productId) {
    return PRODUCT_CATALOG[String(productId)] || null;
}

/**
 * Calculate authoritative order total server-side
 * @param {Array} items - Array of { id, quantity, selectedPlanId }
 * @param {Object} options - { isFirstOrder: boolean }
 * @returns {Object} { isValid, totalAmount, itemDetails, isFirstOrderApplied, savingsAmount, error }
 */
function calculateOrderTotal(items, options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
        return { isValid: false, totalAmount: 0, itemDetails: [], isFirstOrderApplied: false, savingsAmount: 0, error: 'Items must be a non-empty array.' };
    }

    const isFirstOrder = Boolean(options.isFirstOrder);
    let totalAmount = 0;
    let savingsAmount = 0;
    let isFirstOrderApplied = false;
    const itemDetails = [];

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            return { isValid: false, totalAmount: 0, itemDetails: [], isFirstOrderApplied: false, savingsAmount: 0, error: 'Invalid item format.' };
        }

        const product = getProductById(item.id);
        if (!product) {
            return { isValid: false, totalAmount: 0, itemDetails: [], isFirstOrderApplied: false, savingsAmount: 0, error: `Invalid product ID: ${item.id}` };
        }

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
            return { isValid: false, totalAmount: 0, itemDetails: [], isFirstOrderApplied: false, savingsAmount: 0, error: `Invalid quantity for product ${item.id}. Must be integer between 1 and 100.` };
        }

        const planId = item.selectedPlanId ? String(item.selectedPlanId).toLowerCase() : 'daily';
        const multiplier = PLAN_MULTIPLIERS[planId] || 1;

        let unitPrice = product.basePrice;
        let isItemDiscounted = false;

        // Apply Supreme Box First-Order Offer (₹119 instead of ₹199 for daily plan)
        if (product.isSupreme && isFirstOrder && planId === 'daily') {
            unitPrice = SUPREME_FIRST_ORDER_PRICE;
            isItemDiscounted = true;
            isFirstOrderApplied = true;
            savingsAmount += (product.basePrice - SUPREME_FIRST_ORDER_PRICE) * quantity;
        }

        const itemUnitPrice = unitPrice * multiplier;
        const itemSubtotal = itemUnitPrice * quantity;
        totalAmount += itemSubtotal;

        itemDetails.push({
            id: product.id,
            name: product.name,
            originalBasePrice: product.basePrice,
            effectiveBasePrice: unitPrice,
            planId,
            multiplier,
            quantity,
            isDiscounted: isItemDiscounted,
            subtotal: itemSubtotal
        });
    }

    return {
        isValid: true,
        totalAmount,
        itemDetails,
        isFirstOrderApplied,
        savingsAmount,
        error: null
    };
}

module.exports = {
    PRODUCT_CATALOG,
    PLAN_MULTIPLIERS,
    SUPREME_FIRST_ORDER_PRICE,
    getProductById,
    calculateOrderTotal
};
