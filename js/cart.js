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
    if (!cartDOM.count) return;
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartDOM.count.textContent = count;
}

/**
 * Add item to cart
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity to add
 * @param {string} customizationName - Custom bowl name
 */
function addToCart(product, quantity = 1, customizationName = null) {
    const existingItem = cart.find(item =>
        item.id === product.id &&
        (customizationName === null || item.customizationName === customizationName)
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const cartItem = {
            id: product.id || `custom-${Date.now()}`,
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
                <p class="text-gray-500 text-sm mb-6">Add delicious protein bowls to get started</p>
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

    cart.forEach((item, index) => {
        const protein = Number(item.protein || 0);
        const calories = Number(item.calories || 0);
        const details = Array.isArray(item.details) ? item.details : [];
        const itemTotal = Number(item.price || 0) * item.quantity;
        totalPrice += itemTotal;

        htmlBuilder += `
        <div class="border-b pb-4 mb-4 last:border-b-0">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <p class="font-semibold text-gray-800">${item.name}</p>
                    <p class="text-xs text-gray-600">${details.map(i => typeof i === 'object' && i !== null ? (i.name || i) : i).join(', ')}</p>
                </div>
                <button onclick="removeFromCart(${index})"
                    class="text-red-500 hover:text-red-700 text-lg">×</button>
            </div>

            <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                    <button onclick="updateItemQuantity(${index}, ${item.quantity - 1})"
                        class="px-2 py-1 bg-gray-200 rounded">−</button>
                    <input type="number" value="${item.quantity}" min="1"
                        onchange="updateItemQuantity(${index}, parseInt(this.value))"
                        class="w-12 text-center border border-gray-300 rounded py-1">
                    <button onclick="updateItemQuantity(${index}, ${item.quantity + 1})"
                        class="px-2 py-1 bg-gray-200 rounded">+</button>
                </div>
                <span class="font-semibold text-gray-800">₹${itemTotal}</span>
            </div>

            <div class="text-xs text-gray-600">
                <p>
                    Protein: ${(protein * item.quantity).toFixed(1)}g |
                    Calories: ${(calories * item.quantity).toFixed(0)}
                </p>
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
}

/**
 * Toggle cart modal
 */
function toggleCartModal() {
    if (!cartDOM.modal) return;
    cartDOM.modal.classList.toggle('hidden');
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
    const cart = JSON.parse(localStorage.getItem('proteinPotCart')) || [];

    return cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
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
 * Initialize cart system on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache
    initializeCartDOM();
    
    // Load cart state
    updateCartCount();
    updateCartDisplay();

    // Attach event listeners
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCartModal);
    }

    const closeCartBtn = document.getElementById('close-cart');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCartModal);
    }

    // Close modal by clicking overlay
    const cartOverlay = document.getElementById('cart-overlay');
    if (cartOverlay && cartOverlay.parentElement) {
        cartOverlay.parentElement.addEventListener('click', (e) => {
            if (e.target.id === 'cart-modal' || e.target.id === 'cart-overlay') {
                toggleCartModal();
            }
        });
    }
});

function updateCartSummary() {
    let total = 0;
    let totalProtein = 0;

    cart.forEach(item => {
        total += Number(item.price || 0) * item.quantity;
        totalProtein += Number(item.protein || 0) * item.quantity;
    });

    document.getElementById("cart-total").innerText = `₹${total}`;
    const proteinEl = document.getElementById("cart-protein");
if (proteinEl) {
    proteinEl.innerText = `${totalProtein}g`;
}
}
