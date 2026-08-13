// Pot protein - Checkout Page Management
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
    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;

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
            const isSupreme = String(item.id) === '3' || String(item.id) === '4';
            const planId = item.selectedPlanId || 'daily';
            let unitPrice = Number(item.price || 199);
            let isDiscounted = false;

            if (isSupreme && planId === 'daily' && isEligible) {
                unitPrice = 119;
                isDiscounted = true;
            }

            const itemTotal = unitPrice * item.quantity;

            htmlBuilder += `<div class="flex justify-between text-sm mb-2">
                <div>
                    <span class="text-gray-700 font-medium">${item.name} x${item.quantity}</span>
                    ${isDiscounted ? `<span class="block text-[10px] text-amber-800 font-bold">🎉 First Order Offer Applied</span>` : ''}
                </div>
                <div class="text-right">
                    ${isDiscounted ? `<span class="line-through text-gray-400 text-xs mr-1">₹${199 * item.quantity}</span>` : ''}
                    <span class="font-semibold text-gray-900">₹${itemTotal}</span>
                </div>
            </div>`;
        });

        const instructions = localStorage.getItem('proteinPotCartInstructions') || '';
        if (instructions.trim()) {
            htmlBuilder += `
                <div class="mt-3 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <div class="font-bold flex items-center gap-1 mb-1 text-amber-950">
                        <span> </span> Allergy & Fruit Preference Notes:
                    </div>
                    <p class="italic text-amber-900 font-medium">${instructions.trim()}</p>
                </div>
            `;
        }

        checkoutDOM.summaryContainer.innerHTML = htmlBuilder;
    }

    // Update summary totals
    updateCheckoutSummary();
}

/**
 * Update checkout summary calculations
 */
function updateCheckoutSummary() {
    const total = typeof getCartTotal === 'function' ? getCartTotal() : 0;

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
    const instructions = localStorage.getItem('proteinPotCartInstructions') || '';

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

    let message = `New Order - Pot protein

Name: ${orderData.customerName}
Phone: ${orderData.customerPhone}

Address:
${orderData.customerAddress}

📍 Delivery Location:
${mapsLink}

Order:
${orderSummary}`;

    if (instructions.trim()) {
        message += `\n  Allergy / Special Notes:\n"${instructions.trim()}"\n`;
    }

    message += `\nTotal: ₹${totalAmount}
Order Number: #${orderNumber}`;

    return message;
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

        items: cart,
        specialInstructions: localStorage.getItem('proteinPotCartInstructions') || ''
    };

    localStorage.setItem('orderConfirmation', JSON.stringify(orderConfirmation));

    // Post order to Express/SQLite Backend API
    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            order_number: orderNumber,
            items: cart,
            total_amount: totalAmount,
            instructions: localStorage.getItem('proteinPotCartInstructions') || ''
        })
    }).catch(err => console.warn('[Orders API] Failed to record order:', err));

    // Open WhatsApp
    window.open(whatsappURL, '_blank');

    // Redirect to home page after a brief delay
    setTimeout(() => {
        localStorage.removeItem('proteinPotCart');
        localStorage.removeItem('proteinPotCartInstructions');
        localStorage.removeItem('orderDetails');
        window.location.href = 'index.html';
    }, 1500);
}

/**
 * Handle UPI QR Checkout Flow
 */
async function processUPIPayment(orderDetails) {
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const submitBtn = document.getElementById('submitOrderBtn');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generating UPI QR...';
    }

    try {
        const orderData = {
            customerName: orderDetails.name,
            customerPhone: orderDetails.phone,
            customerAddress: orderDetails.address,
            mapsUrl: checkoutDOM.mapsUrl || '',
            items: cart
        };

        const result = await window.UPIPayment.createPayment(orderData);

        // Show Modal and populate details
        const upiModal = document.getElementById('upiModal');
        const upiModalAmount = document.getElementById('upiModalAmount');
        const upiModalOrderId = document.getElementById('upiModalOrderId');
        const upiQrCodeImg = document.getElementById('upiQrCodeImg');
        const qrLoadingSpinner = document.getElementById('qrLoadingSpinner');
        const upiDirectPayLink = document.getElementById('upiDirectPayLink');
        const upiTimer = document.getElementById('upiTimer');
        const upiExpiredOverlay = document.getElementById('upiExpiredOverlay');

        upiModalAmount.textContent = result.amount;
        upiModalOrderId.textContent = result.orderId;
        upiQrCodeImg.src = result.qrCodeDataUrl;
        upiDirectPayLink.href = result.upiUri;

        qrLoadingSpinner.classList.add('hidden');
        upiQrCodeImg.classList.remove('hidden');
        upiExpiredOverlay.classList.add('hidden');

        upiModal.classList.remove('hidden');

        // Update instruction amount
        const upiInstructionAmount = document.getElementById('upiInstructionAmount');
        if (upiInstructionAmount) upiInstructionAmount.textContent = result.amount;

        const merchantVpaDisplay = document.getElementById('merchantVpaDisplay');
        if (merchantVpaDisplay) merchantVpaDisplay.textContent = result.merchantUpi;

        // Connect "I Have Paid — Submit Order on WhatsApp" button
        const confirmBtn = document.getElementById('confirmUpiPaymentBtn');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                // Build order confirmation receipt for WhatsApp
                const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
                let orderSummaryText = '';
                cart.forEach(item => {
                    orderSummaryText += `${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
                });

                const mapsLink = checkoutDOM.mapsUrl || "Location Not Shared";

                const waMessage = `New Order - Paid via UPI QR

Name: ${orderDetails.name}
Phone: ${orderDetails.phone}
Address: ${orderDetails.address}

📍 Delivery Location:
${mapsLink}

Order Summary:
${orderSummaryText}
Total Amount: ₹${result.amount}
Payment VPA: ${result.merchantUpi}
Order ID: #${result.orderId}

(Please verify payment of ₹${result.amount} on your UPI app)`;

                const whatsappNumber = '917871974777';
                const waURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

                // Show success modal
                handlePaymentSuccess({
                    orderId: result.orderId,
                    amount: result.amount,
                    paymentDetails: {
                        paymentId: 'UPI-DYNAMIC',
                        utr: 'N/A'
                    }
                });

                // Open WhatsApp
                window.open(waURL, '_blank');
            };
        }

    } catch (err) {
        alert('Could not initialize UPI payment: ' + err.message);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Proceed to UPI QR Payment';
        }
    }
}

/**
 * Handle successful payment callback
 */
function handlePaymentSuccess(statusData) {
    const upiModal = document.getElementById('upiModal');
    const successModal = document.getElementById('paymentSuccessModal');

    if (upiModal) upiModal.classList.add('hidden');

    document.getElementById('successOrderId').textContent = statusData.orderId;
    document.getElementById('successAmount').textContent = `₹${statusData.amount}`;
    document.getElementById('successPaymentId').textContent = statusData.paymentDetails?.paymentId || 'PAY-UPI';
    document.getElementById('successUtr').textContent = statusData.paymentDetails?.utr || 'N/A';

    if (successModal) successModal.classList.remove('hidden');

    // Clear cart & saved details
    localStorage.removeItem('proteinPotCart');
    localStorage.removeItem('orderDetails');

    // Update summary count if cart module exists
    if (typeof updateCartCount === 'function') updateCartCount();
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

    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'upi';

    // Save order details
    const orderDetails = {
        name: checkoutDOM.nameInput.value.trim(),
        phone: checkoutDOM.phoneInput.value.trim(),
        address: checkoutDOM.addressInput.value.trim(),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    if (selectedMethod === 'upi') {
        processUPIPayment(orderDetails);
    } else {
        // Send directly to WhatsApp
        sendViaWhatsApp({
            customerName: orderDetails.name,
            customerPhone: orderDetails.phone,
            customerAddress: orderDetails.address
        });
    }
}

/**
 * Setup payment method toggle listener to update button text and card styling dynamically
 */
function setupPaymentMethodToggle() {
    const submitBtn = document.getElementById('submitOrderBtn');
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');

    function updatePaymentState() {
        const selected = document.querySelector('input[name="paymentMethod"]:checked')?.value;

        paymentRadios.forEach(radio => {
            const card = radio.closest('.payment-method-card');
            if (card) {
                if (radio.checked) {
                    card.className = 'payment-method-card flex items-center p-4 border-2 border-[#3b113c] bg-[#faf3f5] rounded-2xl cursor-pointer transition shadow-xs';
                } else {
                    card.className = 'payment-method-card flex items-center p-4 border border-pink-200 bg-white rounded-2xl cursor-pointer hover:bg-[#faf3f5] transition';
                }
            }
        });

        if (submitBtn) {
            if (selected === 'whatsapp') {
                submitBtn.textContent = 'Order via WhatsApp 💬';
            } else {
                submitBtn.textContent = 'Proceed to UPI QR Payment 📱';
            }
        }
    }

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', updatePaymentState);
    });

    updatePaymentState();
}

/**
 * Initialize checkout page
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeCheckoutDOM();
    loadOrderSummary();
    setupPaymentMethodToggle();

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

    // Modal Close Buttons
    const closeUpiModalBtn = document.getElementById('closeUpiModalBtn');
    if (closeUpiModalBtn) {
        closeUpiModalBtn.addEventListener('click', () => {
            document.getElementById('upiModal')?.classList.add('hidden');
        });
    }

    const finishOrderBtn = document.getElementById('finishOrderBtn');
    if (finishOrderBtn) {
        finishOrderBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});