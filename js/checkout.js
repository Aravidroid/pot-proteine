// Pot protéiné - Checkout Page Management
// Handles form submission and order summary display

// Cache DOM elements
const checkoutDOM = {
    form: null,
    nameInput: null,
    phoneInput: null,
    addressInput: null,
    summaryContainer: null,
    subtotalEl: null,
    totalEl: null
};

/**
 * Initialize checkout DOM cache
 */
function initializeCheckoutDOM() {
    checkoutDOM.form = document.getElementById('checkoutForm');
    checkoutDOM.nameInput = document.getElementById('name');
    checkoutDOM.phoneInput = document.getElementById('phone');
    checkoutDOM.addressInput = document.getElementById('address');
    checkoutDOM.summaryContainer = document.getElementById('orderItemsSummary');
    checkoutDOM.subtotalEl = document.getElementById('summarySubtotal');
    checkoutDOM.totalEl = document.getElementById('summaryTotal');
}

/**
 * Load and display order summary
 */
function loadOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];

    if (!cart.length) {
        alert("Your cart is empty.");
        window.location.href = "menu.html";
        return;
    }

    // Display cart items
    if (checkoutDOM.summaryContainer) {
        checkoutDOM.summaryContainer.innerHTML = '';
        
        let htmlBuilder = '';
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            htmlBuilder += `<div class="flex justify-between text-sm mb-2">
                <span class="text-gray-700">${item.name} x${item.quantity}</span>
                <span class="font-semibold">₹${itemTotal}</span>
            </div>`;
        });
        
        checkoutDOM.summaryContainer.innerHTML = htmlBuilder;
    }

    // Update summary totals
    updateCheckoutSummary();
}

/**
 * Update checkout summary calculations
 */
function updateCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (checkoutDOM.subtotalEl) checkoutDOM.subtotalEl.textContent = total;
    if (checkoutDOM.totalEl) checkoutDOM.totalEl.textContent = total;
}

/**
 * Validate checkout form
 * @returns {Object} Validation result {isValid, errors}
 */
function validateCheckoutForm() {
    const errors = [];

    if (!checkoutDOM.nameInput.value.trim()) {
        errors.push('Full name is required');
    }

    const phone = checkoutDOM.phoneInput.value.trim();
    if (!phone) {
        errors.push('Phone number is required');
    } else if (!/^[0-9]{10}$/.test(phone)) {
        errors.push('Phone must be 10 digits');
    }

    if (!checkoutDOM.addressInput.value.trim()) {
        errors.push('Delivery address is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Build WhatsApp message for order
 * @param {Object} orderData - Order information
 * @returns {string} WhatsApp message text
 */
function buildWhatsAppMessage(orderData) {
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    
    let orderSummary = '';
    cart.forEach(item => {
        orderSummary += `${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    const totalAmount = getCartTotal();
    const orderNumber = "PP" + Date.now().toString().slice(-6);
    
    return `New Order - Pot protéiné

Customer: ${orderData.customerName}
Phone: ${orderData.customerPhone}

Address:
${orderData.customerAddress}

Order:
${orderSummary}

Total: ₹${totalAmount}
Order Number: #${orderNumber}`;
}

/**
 * Send order via WhatsApp
 * @param {Object} orderData - Order information
 */
function sendViaWhatsApp(orderData) {
    const message = buildWhatsAppMessage(orderData);
    const whatsappNumber = '917871974777';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Save order to localStorage before redirecting
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const totalAmount = getCartTotal();
    
    const orderConfirmation = {
        orderNumber: "PP" + Date.now().toString().slice(-6),
        amount: totalAmount,
        timestamp: new Date().toISOString(),
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        items: cart
    };
    
    localStorage.setItem('orderConfirmation', JSON.stringify(orderConfirmation));
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Redirect to home page after a brief delay
    setTimeout(() => {
        localStorage.removeItem('proteinPotCart');
        localStorage.removeItem('orderDetails');
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Handle checkout form submission
 */
function handleCheckoutSubmit(e) {
    e.preventDefault();

    const validation = validateCheckoutForm();
    if (!validation.isValid) {
        alert('Please fix the following errors:\n' + validation.errors.join('\n'));
        return;
    }

    // Save order details
    const orderDetails = {
        name: checkoutDOM.nameInput.value.trim(),
        phone: checkoutDOM.phoneInput.value.trim(),
        address: checkoutDOM.addressInput.value.trim(),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
    
    // Send directly to WhatsApp
    sendViaWhatsApp({
        customerName: orderDetails.name,
        customerPhone: orderDetails.phone,
        customerAddress: orderDetails.address
    });
}

/**
 * Initialize checkout page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache
    initializeCheckoutDOM();

    // Load order summary
    loadOrderSummary();

    // Attach form submission handler
    if (checkoutDOM.form) {
        checkoutDOM.form.addEventListener('submit', handleCheckoutSubmit);
    }
});
