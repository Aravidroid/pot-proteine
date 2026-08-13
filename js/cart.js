// Protein Pot - Cart Management System
// Handles: add to cart, remove item, quantity update, storage, and UI rendering

const CART_DEFAULT_PRODUCT_IMAGE = typeof DEFAULT_PRODUCT_IMAGE !== 'undefined'
    ? DEFAULT_PRODUCT_IMAGE
    : 'assets/pot-placeholder.svg';

let cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];

// Cache DOM elements
const cartDOM = {
    count: null,
    itemsContainer: null,
    totalContainer: null,
    modal: null,
    overlay: null
};

/**
 * Initialize DOM cache
 */
function initializeCartDOM() {
    cartDOM.count = document.getElementById('cart-count');
    cartDOM.itemsContainer = document.getElementById('cart-items');
    cartDOM.totalContainer = document.getElementById('cart-total');
    cartDOM.modal = document.getElementById('cart-modal');
    cartDOM.overlay = document.getElementById('cart-overlay');
}

/**
 * Update cart count badge
 */
function updateCartCount() {
    if (cartDOM.count) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        const oldCount = cartDOM.count.textContent;
        cartDOM.count.textContent = count;

        if (oldCount !== String(count)) {
            cartDOM.count.classList.remove('cart-badge-bump');
            void cartDOM.count.offsetWidth; // Force reflow
            cartDOM.count.classList.add('cart-badge-bump');
        }
    }
    renderMobileFloatingCartBar();
    if (typeof syncQtyButtons === 'function') {
        syncQtyButtons();
    }
}

/**
 * Add item to cart
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 * @param {string} customizationName - Custom Box name
 */
function addToCart(product, quantity = 1, customizationName = null) {
    const targetPlanId = product.selectedPlanId || (String(product.id).includes('-') ? String(product.id).split('-')[1] : 'daily');
    const existingItem = cart.find(item => {
        const itemPlanId = item.selectedPlanId || (String(item.id).includes('-') ? String(item.id).split('-')[1] : 'daily');
        const cleanItemId = String(item.id).split('-')[0];
        const cleanProdId = String(product.id).split('-')[0];
        return cleanItemId === cleanProdId && itemPlanId === targetPlanId && (customizationName === null || item.customizationName === customizationName);
    });

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const cartItem = {
            id: String(product.id).split('-')[0] || `custom-${Date.now()}`,
            selectedPlanId: targetPlanId,
            name: product.name || customizationName,
            price: product.price,
            quantity: quantity,
            protein: Number(product.protein || 0),
            calories: Number(product.calories || 0),
            image: product.image || product.icon || CART_DEFAULT_PRODUCT_IMAGE,
            isCustom: !!customizationName,
            customizationName: customizationName,
            details: product.ingredients || []
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartCount();
    updateCartDisplay();
    showCartNotification();
}

/**
 * Remove item from cart
 * @param {number} index - Item index
 */
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    updateCartDisplay();
}

/**
 * Update item quantity
 * @param {number} index - Item index
 * @param {number} quantity - New quantity
 */
function updateItemQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = quantity;
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    localStorage.setItem('proteinPotCart', JSON.stringify(cart));
}

/**
 * Update cart display - optimized with single DOM assignment
 */
function updateCartDisplay() {
    if (!cartDOM.itemsContainer) return;

    if (cart.length === 0) {
        cartDOM.itemsContainer.innerHTML = `
            <div class="text-center py-12">
                <p class="text-gray-600 text-lg mb-4">🛒 Your cart is empty</p>
                <p class="text-gray-500 text-sm mb-6">Add delicious protein boxes to get started</p>
                <a href="menu.html" class="inline-block bg-primary-light text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-hover transition">
                    Browse Menu
                </a>
            </div>
        `;

        if (cartDOM.totalContainer) {
            cartDOM.totalContainer.textContent = '₹0';
        }

        const proteinEl = document.getElementById("cart-protein");
        if (proteinEl) {
            proteinEl.innerText = "0g";
        }

        return;
    }

    // Build entire HTML at once
    let htmlBuilder = '';
    let totalPrice = 0;
    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;

    cart.forEach((item, index) => {
        const protein = Number(item.protein || 0);
        const calories = Number(item.calories || 0);
        const details = Array.isArray(item.details) ? item.details : [];
        
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
        totalPrice += itemTotal;
        const itemImg = item.image || CART_DEFAULT_PRODUCT_IMAGE;

        const priceDisplayHTML = isDiscounted
            ? `<div class="text-right">
                <span class="line-through text-gray-400 text-xs mr-1">₹${199 * item.quantity}</span>
                <span class="font-extrabold text-[#7a1c6a] text-base">₹${itemTotal}</span>
                <span class="block text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded">🎉 First Order Offer</span>
               </div>`
            : `<span class="font-extrabold text-gray-900 text-base">₹${itemTotal}</span>`;

        htmlBuilder += `
        <div class="border-b pb-4 mb-4 last:border-b-0 border-gray-100">
            <div class="flex items-center gap-3">
                <img src="${itemImg}" 
                     alt="${item.name}" 
                     class="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm shrink-0 bg-gray-50"
                     onerror="this.src='logo.webp'">
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <p class="font-bold text-gray-900 text-sm truncate">${item.name}</p>
                        <button onclick="removeFromCart(${index})"
                            class="text-red-500 hover:text-red-700 text-lg font-bold p-1 leading-none ml-2">×</button>
                    </div>
                    ${details.length > 0 ? `<p class="text-xs text-gray-500 line-clamp-1 mt-0.5">${details.map(i => typeof i === 'object' && i !== null ? (i.name || i) : i).join(', ')}</p>` : ''}
                    <div class="text-xs font-semibold text-[#7a1c6a] mt-1">
                        ${(protein * item.quantity).toFixed(1)}g Protein | ${(calories * item.quantity).toFixed(0)} Cal
                    </div>
                </div>
            </div>

            <div class="flex justify-between items-center mt-3 pt-1">
                <div class="flex items-center gap-2">
                    <button onclick="updateItemQuantity(${index}, ${item.quantity - 1})"
                        class="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-sm transition">−</button>
                    <span class="w-8 text-center font-bold text-sm text-gray-900">${item.quantity}</span>
                    <button onclick="updateItemQuantity(${index}, ${item.quantity + 1})"
                        class="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-sm transition">+</button>
                </div>
                ${priceDisplayHTML}
            </div>
        </div>
        `;
    });

    // Assign HTML once
    cartDOM.itemsContainer.innerHTML = htmlBuilder;

    // Update total
    if (cartDOM.totalContainer) {
        cartDOM.totalContainer.textContent = `₹${totalPrice}`;
    }
    updateCartSummary();
    setupInstructionsField();
}

/**
 * Setup Custom Instructions / Allergy Notes Field in Cart Footer
 */
function setupInstructionsField() {
    const cartFooter = document.querySelector('#cart-modal .cart-footer');
    if (!cartFooter) return;

    let instructionsEl = document.getElementById('cart-instructions');
    if (!instructionsEl) {
        const container = document.createElement('div');
        container.id = 'cart-instructions-container';
        container.className = 'space-y-1.5 bg-[#faf3f5] p-3 rounded-2xl border border-pink-200/80 mb-3';
        container.innerHTML = `
            <label for="cart-instructions" class="block text-xs font-bold text-[#2a0c2b] flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                    <span> </span> Allergy Notes & Fruit Preferences
                </span>
                <span class="text-[10px] text-[#7a1c6a] font-semibold uppercase">Optional</span>
            </label>
            <textarea id="cart-instructions" rows="2" 
                placeholder="e.g., Allergic to pineapple, please swap for extra watermelon or kiwi..."
                class="w-full text-xs p-2.5 rounded-xl border border-pink-200 bg-white text-[#2a0c2b] focus:ring-2 focus:ring-[#7a1c6a] focus:outline-none resize-none transition shadow-xs"></textarea>
        `;
        cartFooter.insertBefore(container, cartFooter.firstChild);
        instructionsEl = document.getElementById('cart-instructions');
    }

    if (instructionsEl) {
        const savedVal = localStorage.getItem('proteinPotCartInstructions') || '';
        if (document.activeElement !== instructionsEl && instructionsEl.value !== savedVal) {
            instructionsEl.value = savedVal;
        }

        if (!instructionsEl.dataset.hasListener) {
            instructionsEl.addEventListener('input', (e) => {
                localStorage.setItem('proteinPotCartInstructions', e.target.value);
            });
            instructionsEl.dataset.hasListener = 'true';
        }
    }
}

let lastToggleTimestamp = 0;

/**
 * Toggle cart modal
 */
function toggleCartModal(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    // Debounce rapid duplicate invocations (e.g. inline onclick + addEventListener firing simultaneously)
    const now = Date.now();
    if (now - lastToggleTimestamp < 250) {
        return;
    }
    lastToggleTimestamp = now;

    // Dynamic lookup to guarantee elements exist
    const modal = cartDOM.modal || document.getElementById('cart-modal');
    const overlay = cartDOM.overlay || document.getElementById('cart-overlay');

    if (!modal) {
        console.warn('[Cart] cart-modal element not found in DOM');
        return;
    }

    cartDOM.modal = modal;
    cartDOM.overlay = overlay;

    const isCurrentlyHidden = modal.classList.contains('hidden');

    if (isCurrentlyHidden) {
        modal.classList.remove('hidden');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        document.body.classList.add('overflow-hidden');
    } else {
        modal.classList.add('hidden');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        document.body.classList.remove('overflow-hidden');
    }

    updateCartDisplay();
}

/**
 * Show cart notification
 */
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-40 animate-pulse';
    notification.textContent = 'Added to cart! 🎉';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

/**
 * Get total cart value
 * @returns {number} Total price
 */
function getCartTotal() {
    const cartList = JSON.parse(localStorage.getItem('proteinPotCart')) || [];
    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;

    return cartList.reduce((sum, item) => {
        const rawId = String(item.id || '');
        const isSupreme = rawId === '3' || rawId === '4' || rawId.startsWith('3-') || rawId.startsWith('4-');
        const planId = item.selectedPlanId || (rawId.includes('-') ? rawId.split('-')[1] : 'daily');
        let unitPrice = Number(item.price || 199);
        if (isSupreme && (planId === 'daily' || planId === 'default') && isEligible) {
            unitPrice = 119;
        }
        return sum + (unitPrice * item.quantity);
    }, 0);
}
/**
 * Clear cart with confirmation
 */
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartDisplay();
    }
}

/**
 * Update cart summary totals (price, total protein)
 */
function updateCartSummary() {
    let total = 0;
    let totalProtein = 0;
    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;

    cart.forEach(item => {
        const rawId = String(item.id || '');
        const isSupreme = rawId === '3' || rawId === '4' || rawId.startsWith('3-') || rawId.startsWith('4-');
        const planId = item.selectedPlanId || (rawId.includes('-') ? rawId.split('-')[1] : 'daily');
        let unitPrice = Number(item.price || 0);
        if (isSupreme && planId === 'daily' && isEligible) {
            unitPrice = 119;
        }
        total += unitPrice * item.quantity;
        totalProtein += Number(item.protein || 0) * item.quantity;
    });

    const cartTotalEl = document.getElementById("cart-total");
    if (cartTotalEl) cartTotalEl.innerText = `₹${total}`;

    const proteinEl = document.getElementById("cart-protein");
    if (proteinEl) {
        const formattedProtein = Number.isInteger(totalProtein) ? totalProtein : totalProtein.toFixed(1);
        proteinEl.innerText = `${formattedProtein}g`;
    }

    renderMobileFloatingCartBar();
}

/**
 * Render Sticky Mobile Floating Cart Bar
 */
function renderMobileFloatingCartBar() {
    // Don't render on checkout page itself
    if (window.location.pathname.endsWith('checkout.html')) return;

    let barEl = document.getElementById('mobileFloatingCartBar');
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : true;
    const totalAmount = cart.reduce((sum, item) => {
        const rawId = String(item.id || '');
        const isSupreme = rawId === '3' || rawId === '4' || rawId.startsWith('3-') || rawId.startsWith('4-');
        const planId = item.selectedPlanId || (rawId.includes('-') ? rawId.split('-')[1] : 'daily');
        let unitPrice = Number(item.price || 0);
        if (isSupreme && planId === 'daily' && isEligible) {
            unitPrice = 119;
        }
        return sum + (unitPrice * item.quantity);
    }, 0);

    if (totalCount === 0) {
        if (barEl) barEl.classList.add('hidden-bar');
        document.body.classList.remove('has-mobile-cart');
        return;
    }

    document.body.classList.add('has-mobile-cart');

    if (!barEl) {
        barEl = document.createElement('div');
        barEl.id = 'mobileFloatingCartBar';
        barEl.className = 'mobile-floating-cart-bar';
        document.body.appendChild(barEl);
    }

    barEl.onclick = (e) => {
        toggleCartModal(e);
    };

    barEl.innerHTML = `
        <div class="flex items-center gap-3 cursor-pointer">
            <div class="relative flex items-center justify-center w-10 h-10 bg-white/10 rounded-full">
                <span class="text-xl">🛒</span>
                <span class="absolute -top-1 -right-1 bg-[#fef08a] text-[#3b113c] font-extrabold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs">${totalCount}</span>
            </div>
            <div>
                <span class="block text-xs text-pink-200 uppercase tracking-wider font-bold">Cart Total</span>
                <span class="text-lg font-extrabold text-white">₹${totalAmount}</span>
            </div>
        </div>
        <button type="button" class="bg-white text-[#3b113c] px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform">
            <span>View Cart</span>
            <span class="text-sm">→</span>
        </button>
    `;

    barEl.classList.remove('hidden-bar');
}

/**
 * Initialize cart system on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache
    initializeCartDOM();

    // Load cart state
    updateCartCount();
    updateCartDisplay();
    renderMobileFloatingCartBar();

    // Close modal by clicking overlay or modal container background
    const cartOverlay = document.getElementById('cart-overlay');
    const cartModal = document.getElementById('cart-modal');

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCartModal(e);
        });
    }

    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                toggleCartModal(e);
            }
        });
    }
});
