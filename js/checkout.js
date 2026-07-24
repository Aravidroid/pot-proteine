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
    totalEl: null,
    getMapsBtn: null,
    mapsLinkDisplay: null,
    mapsLink: null,
    mapsLinkSummary: null,
    summaryMapsLink: null,

    mapsUrl: null,
    latitude: null,
    longitude: null
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
    checkoutDOM.getMapsBtn = document.getElementById('getMapsBtn');
    checkoutDOM.mapsLinkDisplay = document.getElementById('mapsLinkDisplay');
    checkoutDOM.mapsLink = document.getElementById('mapsLink');
    checkoutDOM.mapsLinkSummary = document.getElementById('mapsLinkSummary');
    checkoutDOM.summaryMapsLink = document.getElementById('summaryMapsLink');
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
 * Generate Google Maps URL from address
 * @param {string} address - Delivery address
 * @returns {string} Google Maps URL
 */
function generateMapsUrl(address) {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/${encodedAddress}`;
}

/**
 * Display maps link in form and summary
 * @param {string} mapsUrl - Google Maps URL
 */
function displayMapsLink(mapsUrl) {
    checkoutDOM.mapsUrl = mapsUrl;
    
    // Display in form
    if (checkoutDOM.mapsLink) {
        checkoutDOM.mapsLink.href = mapsUrl;
        checkoutDOM.mapsLink.textContent = 'Click here to view on Google Maps';
    }
    if (checkoutDOM.mapsLinkDisplay) {
        checkoutDOM.mapsLinkDisplay.classList.remove('hidden');
    }
    
    // Display in summary
    if (checkoutDOM.summaryMapsLink) {
        checkoutDOM.summaryMapsLink.href = mapsUrl;
    }
    if (checkoutDOM.mapsLinkSummary) {
        checkoutDOM.mapsLinkSummary.classList.remove('hidden');
    }
}

/**
 * Handle get maps link button click
 */
function handleGetMapsLink() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    checkoutDOM.getMapsBtn.textContent = "Getting Location...";
    checkoutDOM.getMapsBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            checkoutDOM.latitude = latitude;
            checkoutDOM.longitude = longitude;

            const mapsUrl =
                `https://www.google.com/maps?q=${latitude},${longitude}`;

            displayMapsLink(mapsUrl);

            checkoutDOM.getMapsBtn.textContent =
                "Location Captured ✓";
        },

        (error) => {
            console.error(error);

            let message = "Unable to get location.";

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = "Location permission denied.";
                    break;

                case error.POSITION_UNAVAILABLE:
                    message = "Location unavailable.";
                    break;

                case error.TIMEOUT:
                    message = "Location request timed out.";
                    break;
            }

            alert(message);

            checkoutDOM.getMapsBtn.textContent =
                "Use My Current Location";

            checkoutDOM.getMapsBtn.disabled = false;
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
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

    if (!checkoutDOM.mapsUrl) {
    errors.push('Please share your GPS location');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate a readable and unique order number: PP + DDMMYY + - + HHMM
 * @returns {string} Order number string
 */
function generateOrderNumber() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `PP${dd}${mm}${yy}-${hh}${min}`;
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
        if (item.details && item.details.length > 0) {
            orderSummary += `   Ingredients: ${item.details.join(', ')}\n`;
        }
    });
    
    const totalAmount = getCartTotal();
    const orderNumber = orderData.orderNumber;
    const mapsLink = checkoutDOM.mapsUrl || "Location Not Shared";
    
    return `New Order - Pot protéiné

Name: ${orderData.customerName}
Phone: ${orderData.customerPhone}

Address:
${orderData.customerAddress}

📍 Delivery Location:
${mapsLink}

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
    const orderNumber = generateOrderNumber();
    orderData.orderNumber = orderNumber;

    const message = buildWhatsAppMessage(orderData);
    const whatsappNumber = '917871974777';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Save order to localStorage before redirecting
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const totalAmount = getCartTotal();
    
    const orderConfirmation = {
    orderNumber: orderNumber,
    amount: totalAmount,
    timestamp: new Date().toISOString(),

    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerAddress: orderData.customerAddress,

    latitude: checkoutDOM.latitude,
    longitude: checkoutDOM.longitude,
    mapsUrl: checkoutDOM.mapsUrl,

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
    initializeCheckoutDOM();
    loadOrderSummary();

    // Auto-capture location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                checkoutDOM.latitude = position.coords.latitude;
                checkoutDOM.longitude = position.coords.longitude;

                const mapsUrl =
                    `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;

                displayMapsLink(mapsUrl);

                if (checkoutDOM.getMapsBtn) {
                    checkoutDOM.getMapsBtn.textContent =
                        "Location Captured ✓";
                }
            },
            (error) => {
                console.log("Location not granted:", error);
            }
        );
    }

    if (checkoutDOM.form) {
        checkoutDOM.form.addEventListener('submit', handleCheckoutSubmit);
    }

    if (checkoutDOM.getMapsBtn) {
        checkoutDOM.getMapsBtn.addEventListener('click', handleGetMapsLink);
    }
});