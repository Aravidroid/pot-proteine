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

    // Delivery schedule elements
    deliveryDateInput: null,
    deliveryTimeInput: null,
    btnDateToday: null,
    btnDateTomorrow: null,
    scheduleTitle: null,
    dateLabel: null,
    timeLabel: null,
    subscriptionScheduleNote: null,
    deliveryScheduleSummary: null,
    summaryScheduleLabel: null,
    summaryScheduleText: null,

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

    // Delivery schedule bindings
    checkoutDOM.deliveryDateInput = document.getElementById('deliveryDate');
    checkoutDOM.deliveryTimeInput = document.getElementById('deliveryTime');
    checkoutDOM.btnDateToday = document.getElementById('btnDateToday');
    checkoutDOM.btnDateTomorrow = document.getElementById('btnDateTomorrow');
    checkoutDOM.scheduleTitle = document.getElementById('scheduleTitle');
    checkoutDOM.dateLabel = document.getElementById('dateLabel');
    checkoutDOM.timeLabel = document.getElementById('timeLabel');
    checkoutDOM.subscriptionScheduleNote = document.getElementById('subscriptionScheduleNote');
    checkoutDOM.deliveryScheduleSummary = document.getElementById('deliveryScheduleSummary');
    checkoutDOM.summaryScheduleLabel = document.getElementById('summaryScheduleLabel');
    checkoutDOM.summaryScheduleText = document.getElementById('summaryScheduleText');
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
            const rawId = String(item.id || '');
            const isSupreme = rawId === '3' || rawId === '4' || rawId.startsWith('3-') || rawId.startsWith('4-');
            const planId = item.selectedPlanId || (rawId.includes('-') ? rawId.split('-')[1] : 'daily');
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
 * Convert YYYY-MM-DD date string to readable format (e.g. Mon, 8 Sep 2026)
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string} Formatted date string
 */
function formatReadableDate(dateStr) {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            return d.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    } catch (e) {}
    return dateStr;
}

/**
 * Convert 24-hour time HH:MM to 12-hour AM/PM format (e.g. 08:30 AM)
 * @param {string} timeStr - HH:MM
 * @returns {string} Formatted time string
 */
function formatReadableTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Setup delivery date & time scheduler with dynamic single-order vs subscription behavior
 */
function setupDeliverySchedule() {
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const isSubscription = cart.some(item => item.selectedPlanId === 'weekly' || item.selectedPlanId === 'monthly');

    const today = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);
    const maxDateStr = `${maxDate.getFullYear()}-${pad(maxDate.getMonth() + 1)}-${pad(maxDate.getDate())}`;

    if (checkoutDOM.deliveryDateInput) {
        checkoutDOM.deliveryDateInput.min = isSubscription ? tomorrowStr : todayStr;
        checkoutDOM.deliveryDateInput.max = maxDateStr;
    }

    if (isSubscription) {
        if (checkoutDOM.scheduleTitle) checkoutDOM.scheduleTitle.innerHTML = '🔄 Subscription Schedule *';
        if (checkoutDOM.dateLabel) checkoutDOM.dateLabel.textContent = 'Subscription Start Date *';
        if (checkoutDOM.timeLabel) checkoutDOM.timeLabel.textContent = 'Daily Preferred Delivery Time *';
        if (checkoutDOM.btnDateToday) checkoutDOM.btnDateToday.classList.add('hidden');
        if (checkoutDOM.btnDateTomorrow) checkoutDOM.btnDateTomorrow.textContent = 'Start Tomorrow';
        if (checkoutDOM.subscriptionScheduleNote) checkoutDOM.subscriptionScheduleNote.classList.remove('hidden');
        if (checkoutDOM.summaryScheduleLabel) checkoutDOM.summaryScheduleLabel.textContent = 'Daily Delivery:';
    } else {
        if (checkoutDOM.scheduleTitle) checkoutDOM.scheduleTitle.innerHTML = '📅 Delivery Schedule *';
        if (checkoutDOM.dateLabel) checkoutDOM.dateLabel.textContent = 'Preferred Delivery Date *';
        if (checkoutDOM.timeLabel) checkoutDOM.timeLabel.textContent = 'Preferred Delivery Time *';
        if (checkoutDOM.btnDateToday) checkoutDOM.btnDateToday.classList.remove('hidden');
        if (checkoutDOM.btnDateTomorrow) checkoutDOM.btnDateTomorrow.textContent = 'Tomorrow';
        if (checkoutDOM.subscriptionScheduleNote) checkoutDOM.subscriptionScheduleNote.classList.add('hidden');
        if (checkoutDOM.summaryScheduleLabel) checkoutDOM.summaryScheduleLabel.textContent = 'Delivery Schedule:';
    }

    // Determine initial date
    let savedDate = localStorage.getItem('proteinPotDeliveryDate');
    if (!savedDate || (isSubscription && savedDate < tomorrowStr) || savedDate < todayStr) {
        savedDate = isSubscription ? tomorrowStr : (today.getHours() >= 19 ? tomorrowStr : todayStr);
    }
    if (checkoutDOM.deliveryDateInput) {
        checkoutDOM.deliveryDateInput.value = savedDate;
    }

    // Determine initial time
    let savedTime = localStorage.getItem('proteinPotDeliveryTime');
    if (!savedTime) {
        savedTime = '08:30'; // Popular fresh morning slot
    }
    if (checkoutDOM.deliveryTimeInput) {
        checkoutDOM.deliveryTimeInput.value = savedTime;
    }

    function updateQuickPillStyles() {
        const curDate = checkoutDOM.deliveryDateInput ? checkoutDOM.deliveryDateInput.value : '';
        if (checkoutDOM.btnDateToday) {
            if (curDate === todayStr) {
                checkoutDOM.btnDateToday.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-[#3b113c] bg-[#3b113c] text-white shadow-xs';
            } else {
                checkoutDOM.btnDateToday.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold border border-pink-200 bg-white text-[#3b113c] hover:bg-[#3b113c] hover:text-white transition shadow-2xs';
            }
        }
        if (checkoutDOM.btnDateTomorrow) {
            if (curDate === tomorrowStr) {
                checkoutDOM.btnDateTomorrow.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 border-[#3b113c] bg-[#3b113c] text-white shadow-xs';
            } else {
                checkoutDOM.btnDateTomorrow.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold border border-pink-200 bg-white text-[#3b113c] hover:bg-[#3b113c] hover:text-white transition shadow-2xs';
            }
        }
    }

    function updateScheduleSummary() {
        const curDate = checkoutDOM.deliveryDateInput ? checkoutDOM.deliveryDateInput.value : '';
        const curTime = checkoutDOM.deliveryTimeInput ? checkoutDOM.deliveryTimeInput.value : '';

        if (curDate) {
            localStorage.setItem('proteinPotDeliveryDate', curDate);
        }
        if (curTime) {
            localStorage.setItem('proteinPotDeliveryTime', curTime);
        }

        if (checkoutDOM.deliveryScheduleSummary) {
            if (curDate && curTime) {
                checkoutDOM.deliveryScheduleSummary.classList.remove('hidden');
                if (checkoutDOM.summaryScheduleText) {
                    const dateText = curDate === todayStr ? 'Today' : (curDate === tomorrowStr ? 'Tomorrow' : formatReadableDate(curDate));
                    checkoutDOM.summaryScheduleText.textContent = `${dateText} @ ${formatReadableTime(curTime)}`;
                }
            }
        }
        updateQuickPillStyles();
    }

    if (checkoutDOM.btnDateToday) {
        checkoutDOM.btnDateToday.onclick = () => {
            if (checkoutDOM.deliveryDateInput) {
                checkoutDOM.deliveryDateInput.value = todayStr;
                updateScheduleSummary();
            }
        };
    }

    if (checkoutDOM.btnDateTomorrow) {
        checkoutDOM.btnDateTomorrow.onclick = () => {
            if (checkoutDOM.deliveryDateInput) {
                checkoutDOM.deliveryDateInput.value = tomorrowStr;
                updateScheduleSummary();
            }
        };
    }

    if (checkoutDOM.deliveryDateInput) {
        checkoutDOM.deliveryDateInput.onchange = updateScheduleSummary;
    }

    if (checkoutDOM.deliveryTimeInput) {
        checkoutDOM.deliveryTimeInput.oninput = updateScheduleSummary;
        checkoutDOM.deliveryTimeInput.onchange = updateScheduleSummary;
    }

    updateScheduleSummary();
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

    if (checkoutDOM.deliveryDateInput && !checkoutDOM.deliveryDateInput.value) {
        errors.push('Please select a delivery date');
    }

    if (checkoutDOM.deliveryTimeInput && !checkoutDOM.deliveryTimeInput.value) {
        errors.push('Please select a preferred delivery time');
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

    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;
    let orderSummary = '';
    cart.forEach(item => {
        const rawId = String(item.id || '');
        const isSupreme = rawId === '3' || rawId === '4' || rawId.startsWith('3-') || rawId.startsWith('4-');
        const planId = item.selectedPlanId || (rawId.includes('-') ? rawId.split('-')[1] : 'daily');
        let unitPrice = Number(item.price || 0);
        if (isSupreme && planId === 'daily' && isEligible) {
            unitPrice = 119;
        }
        orderSummary += `${item.name} x${item.quantity} - ₹${unitPrice * item.quantity}\n`;
        if (item.details && item.details.length > 0) {
            const ingNames = item.details.map(i => typeof i === 'object' && i !== null ? (i.name || i) : i);
            orderSummary += `   Ingredients: ${ingNames.join(', ')}\n`;
        }
    });

    const totalAmount = getCartTotal();
    const orderNumber = orderData.orderNumber;
    const mapsLink = checkoutDOM.mapsUrl || "Location Not Shared";

    const dateVal = checkoutDOM.deliveryDateInput?.value || localStorage.getItem('proteinPotDeliveryDate') || '';
    const timeVal = checkoutDOM.deliveryTimeInput?.value || localStorage.getItem('proteinPotDeliveryTime') || '';
    const isSubscription = cart.some(item => item.selectedPlanId === 'weekly' || item.selectedPlanId === 'monthly');

    const formattedDate = formatReadableDate(dateVal);
    const formattedTime = formatReadableTime(timeVal);

    let scheduleSection = '';
    if (isSubscription) {
        scheduleSection = `🔄 Subscription Start Date: ${formattedDate}\n⏰ Daily Delivery Time: ${formattedTime} (Mon–Sat)\n`;
    } else {
        scheduleSection = `📅 Delivery Date: ${formattedDate}\n⏰ Preferred Delivery Time: ${formattedTime}\n`;
    }

    let message = `${isSubscription ? 'New Subscription' : 'New Order'} - Pot protein

Name: ${orderData.customerName}
Phone: ${orderData.customerPhone}

${scheduleSection}Address:
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
async function sendViaWhatsApp(orderData) {
    const orderNumber = generateOrderNumber();
    orderData.orderNumber = orderNumber;

    const message = buildWhatsAppMessage(orderData);
    const whatsappNumber = '917871974777';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Save order to localStorage before redirecting
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const totalAmount = getCartTotal();

    const dateVal = checkoutDOM.deliveryDateInput?.value || localStorage.getItem('proteinPotDeliveryDate') || '';
    const timeVal = checkoutDOM.deliveryTimeInput?.value || localStorage.getItem('proteinPotDeliveryTime') || '';
    const isSubscription = cart.some(item => item.selectedPlanId === 'weekly' || item.selectedPlanId === 'monthly');

    const scheduleSummaryString = `[${isSubscription ? 'Subscription Start' : 'Delivery'}: ${formatReadableDate(dateVal)} @ ${formatReadableTime(timeVal)}]`;
    const userNotes = localStorage.getItem('proteinPotCartInstructions') || '';
    const combinedInstructions = userNotes.trim()
        ? `${scheduleSummaryString} Notes: ${userNotes.trim()}`
        : scheduleSummaryString;

    const orderConfirmation = {
        orderNumber: orderNumber,
        amount: totalAmount,
        timestamp: new Date().toISOString(),

        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,

        deliveryDate: dateVal,
        deliveryTime: timeVal,
        formattedSchedule: `${formatReadableDate(dateVal)} @ ${formatReadableTime(timeVal)}`,

        latitude: checkoutDOM.latitude,
        longitude: checkoutDOM.longitude,
        mapsUrl: checkoutDOM.mapsUrl,

        items: cart,
        specialInstructions: combinedInstructions
    };

    localStorage.setItem('orderConfirmation', JSON.stringify(orderConfirmation));

    // Post order to Express/SQLite Backend API (await fetch so DB record completes before WhatsApp redirect)
    try {
        await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                order_number: orderNumber,
                items: cart,
                total_amount: totalAmount,
                instructions: combinedInstructions
            })
        });
    } catch (err) {
        console.warn('[Orders API] Failed to record order:', err);
    }

    // Update local user state so subsequent orders are treated as returning customer
    if (window.currentUser) {
        window.currentUser.is_first_order = false;
        localStorage.setItem('proteinPotCustomer', JSON.stringify(window.currentUser));
    }

    // Open WhatsApp
    window.open(whatsappURL, '_blank');

    // Redirect to home page after a brief delay
    setTimeout(() => {
        localStorage.removeItem('proteinPotCart');
        localStorage.removeItem('proteinPotCartInstructions');
        localStorage.removeItem('proteinPotDeliveryDate');
        localStorage.removeItem('proteinPotDeliveryTime');
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
                const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;
                let orderSummaryText = '';
                cart.forEach(item => {
                    const rawId = String(item.id || '');
                    const isSupreme = rawId === '3' || rawId === '4' || rawId.startsWith('3-') || rawId.startsWith('4-');
                    const planId = item.selectedPlanId || (rawId.includes('-') ? rawId.split('-')[1] : 'daily');
                    let unitPrice = Number(item.price || 0);
                    if (isSupreme && planId === 'daily' && isEligible) {
                        unitPrice = 119;
                    }
                    orderSummaryText += `${item.name} x${item.quantity} - ₹${unitPrice * item.quantity}\n`;
                });

                const mapsLink = checkoutDOM.mapsUrl || "Location Not Shared";

                const dateVal = checkoutDOM.deliveryDateInput?.value || localStorage.getItem('proteinPotDeliveryDate') || '';
                const timeVal = checkoutDOM.deliveryTimeInput?.value || localStorage.getItem('proteinPotDeliveryTime') || '';
                const isSubscription = cart.some(item => item.selectedPlanId === 'weekly' || item.selectedPlanId === 'monthly');
                const formattedDate = formatReadableDate(dateVal);
                const formattedTime = formatReadableTime(timeVal);

                let scheduleSection = '';
                if (isSubscription) {
                    scheduleSection = `🔄 Subscription Start Date: ${formattedDate}\n⏰ Daily Delivery Time: ${formattedTime} (Mon–Sat)\n`;
                } else {
                    scheduleSection = `📅 Delivery Date: ${formattedDate}\n⏰ Preferred Delivery Time: ${formattedTime}\n`;
                }

                const waMessage = `New Order - Paid via UPI QR

Name: ${orderDetails.name}
Phone: ${orderDetails.phone}

${scheduleSection}Address: ${orderDetails.address}

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
    localStorage.removeItem('proteinPotCartInstructions');
    localStorage.removeItem('proteinPotDeliveryDate');
    localStorage.removeItem('proteinPotDeliveryTime');
    localStorage.removeItem('orderDetails');

    // Update summary count if cart module exists
    if (typeof updateCartCount === 'function') updateCartCount();
}

/**
 * Handle checkout form submission
 */
async function handleCheckoutSubmit(e) {
    e.preventDefault();

    const validation = validateCheckoutForm();
    if (!validation.isValid) {
        alert('Please fix the following errors:\n' + validation.errors.join('\n'));
        return;
    }

    const name = checkoutDOM.nameInput.value.trim();
    const phone = checkoutDOM.phoneInput.value.trim();
    const address = checkoutDOM.addressInput.value.trim();

    // Auto-save customer details & establish session before placing order so user_id is linked
    if (typeof AuthAPI !== 'undefined' && typeof AuthAPI.saveCustomerDetails === 'function') {
        try {
            const authRes = await AuthAPI.saveCustomerDetails(name, phone);
            if (authRes.success && authRes.user) {
                window.currentUser = authRes.user;
                localStorage.setItem('proteinPotCustomer', JSON.stringify(authRes.user));
                if (typeof updateNavigationUI === 'function') updateNavigationUI();
            }
        } catch (err) {
            console.warn('[Checkout] Auto-auth failed:', err);
        }
    }

    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'upi';

    // Save order details
    const orderDetails = {
        name,
        phone,
        address,
        deliveryDate: checkoutDOM.deliveryDateInput?.value || '',
        deliveryTime: checkoutDOM.deliveryTimeInput?.value || '',
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    if (selectedMethod === 'upi') {
        processUPIPayment(orderDetails);
    } else {
        // Send directly to WhatsApp
        await sendViaWhatsApp({
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
    setupDeliverySchedule();
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