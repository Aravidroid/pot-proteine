/**
 * Pot protéine - Passwordless Customer Details Module
 * Collects ONLY Customer Name & 10-digit Phone Number (No Passwords, No Emails)
 */

// Determine API Base URL for local dev servers (Live Server port 5500, 5501, etc.)
const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isCustomDevPort = window.location.port && window.location.port !== '3000';

const API_BASE = (window.location.protocol === 'file:' || (isLocalHost && isCustomDevPort))
    ? 'http://localhost:3000'
    : '';

/**
 * Fetch with automatic 8-second timeout
 */
async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

const AuthAPI = {
    async getMe() {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/api/auth/me`, { credentials: 'include' });
            const data = await res.json();
            return data.success ? data.user : null;
        } catch (err) {
            console.warn('[Auth] Check session failed:', err);
            return null;
        }
    },

    async saveCustomerDetails(name, phone) {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/api/auth/customer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, phone })
            });
            return await res.json();
        } catch (err) {
            console.error('[Auth] Save customer details error:', err);
            if (err.name === 'AbortError') {
                return { success: false, message: 'Server request timed out. Please try again.' };
            }
            return { success: false, message: 'Unable to connect to server. Please check your connection.' };
        }
    },

    async logout() {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            return await res.json();
        } catch (err) {
            console.error('[Auth] Logout error:', err);
            return { success: false, message: 'Logout failed.' };
        }
    },

    async getOrders() {
        try {
            const res = await fetchWithTimeout(`${API_BASE}/api/orders`, { credentials: 'include' });
            const data = await res.json();
            return data.success ? data.orders : [];
        } catch (err) {
            console.error('[Auth] Fetch orders failed:', err);
            return [];
        }
    }
};

// Global Current User State
window.currentUser = null;

/**
 * Dynamically Inject Auth Modal HTML into Body if not present
 */
function injectAuthModalHTML() {
    if (document.getElementById('auth-modal')) return;

    const modalHTML = `
    <!-- Auth Modal Container -->
    <div id="auth-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300">
        <div class="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform scale-95 transition-transform duration-300 border border-purple-100" id="auth-modal-content">
            
            <!-- Modal Header -->
            <div class="relative bg-gradient-to-r from-[#3b113c] via-[#7a1c6a] to-[#51134f] px-6 py-5 text-white flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <img src="logo.webp" alt="Pot protéine" class="w-8 h-8 rounded-full border border-white/30 object-cover">
                    <h3 id="auth-modal-title" class="font-bold text-lg tracking-wide">Customer Details</h3>
                </div>
                <button id="auth-modal-close" class="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors" aria-label="Close modal">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <!-- Alert Notification Banner -->
            <div id="auth-alert" class="hidden mx-6 mt-4 p-3 rounded-xl text-xs font-medium border"></div>

            <!-- SINGLE CUSTOMER DETAILS FORM (Name + Phone ONLY) -->
            <form id="auth-form-customer" class="p-6 space-y-4">
                <p class="text-xs text-gray-500 mb-1">Enter your details for fast checkout and first-order offers:</p>
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                    <input type="text" id="customer-name" required placeholder="Enter your full name" 
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a1c6a] focus:border-transparent text-sm">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                    <input type="tel" id="customer-phone" required pattern="[0-9]{10}" maxlength="10" placeholder="10-digit mobile number" 
                        class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7a1c6a] focus:border-transparent text-sm">
                </div>
                <button type="submit" id="customer-submit-btn" 
                    class="w-full py-3 px-4 bg-gradient-to-r from-[#3b113c] to-[#7a1c6a] text-white font-bold rounded-xl shadow-lg hover:shadow-purple-900/20 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2">
                    <span>Save & Continue</span>
                </button>
            </form>

            <!-- LOGGED-IN PROFILE VIEW -->
            <div id="auth-profile-view" class="hidden p-6 space-y-4">
                <div class="p-4 rounded-2xl bg-purple-50/80 border border-purple-100 flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-[#3b113c] text-white flex items-center justify-center text-lg font-bold shadow-md" id="profile-avatar-icon">
                        👤
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900 text-base" id="profile-name">User Name</h4>
                        <p class="text-xs font-semibold text-[#7a1c6a]" id="profile-phone">+91 0000000000</p>
                    </div>
                </div>

                <!-- Order History Summary -->
                <div class="border-t border-gray-100 pt-3">
                    <h5 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Recent Order History</h5>
                    <div id="profile-order-history" class="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs">
                        <p class="text-gray-400 italic text-center py-2">Loading past orders...</p>
                    </div>
                </div>

                <button id="profile-logout-btn" class="w-full py-2.5 border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2">
                    <span>🚪 Sign Out</span>
                </button>
            </div>

        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupAuthModalListeners();
}

/**
 * Modal Listeners
 */
function setupAuthModalListeners() {
    const modal = document.getElementById('auth-modal');
    const modalContent = document.getElementById('auth-modal-content');
    const closeBtn = document.getElementById('auth-modal-close');
    const formCustomer = document.getElementById('auth-form-customer');
    const profileView = document.getElementById('auth-profile-view');

    // Close Modal
    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modalContent.classList.add('scale-95');
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle Customer Entry Submit (Name + Phone ONLY)
    formCustomer.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('customer-name').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();

        const btn = document.getElementById('customer-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span>Saving...</span>';

        try {
            const res = await AuthAPI.saveCustomerDetails(name, phone);
            btn.disabled = false;
            btn.innerHTML = '<span>Save & Continue</span>';

            if (res.success) {
                window.currentUser = res.user;
                localStorage.setItem('proteinPotCustomer', JSON.stringify(res.user));
                updateNavigationUI();
                showAlert(res.message || 'Details saved successfully!', 'success');
                setTimeout(() => {
                    closeModal();
                    autoFillCheckoutIfOnCheckoutPage();
                    // Refresh menu pricing cards, cart, and checkout if present
                    if (typeof window.refreshMenuGrid === 'function') {
                        window.refreshMenuGrid();
                    } else if (typeof renderGrid === 'function') {
                        renderGrid();
                    }
                    if (typeof updateCartDisplay === 'function') updateCartDisplay();
                    if (typeof loadOrderSummary === 'function') loadOrderSummary();
                }, 600);
            } else {
                showAlert(res.message || 'Failed to save details.', 'error');
            }
        } catch (err) {
            btn.disabled = false;
            btn.innerHTML = '<span>Save & Continue</span>';
            showAlert('Connection error. Please try again.', 'error');
        }
    });

    // Handle Logout
    document.getElementById('profile-logout-btn').addEventListener('click', async () => {
        await AuthAPI.logout();
        localStorage.removeItem('proteinPotCustomer');
        window.currentUser = null;
        closeModal();
        updateNavigationUI();
        if (typeof window.refreshMenuGrid === 'function') {
            window.refreshMenuGrid();
        } else if (typeof renderGrid === 'function') {
            renderGrid();
        }
        if (typeof updateCartDisplay === 'function') updateCartDisplay();
        if (typeof loadOrderSummary === 'function') loadOrderSummary();
    });
}

/**
 * Display Notification inside Modal
 */
function showAlert(msg, type = 'error') {
    const alert = document.getElementById('auth-alert');
    if (!alert) return;
    alert.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'border-red-200', 'bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    if (type === 'error') {
        alert.classList.add('bg-red-50', 'text-red-700', 'border-red-200');
    } else {
        alert.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-200');
    }
    alert.textContent = msg;
}

function hideAlert() {
    const alert = document.getElementById('auth-alert');
    if (alert) alert.classList.add('hidden');
}

/**
 * Open Auth Modal (Public helper)
 */
window.openAuthModal = function () {
    injectAuthModalHTML();
    const modal = document.getElementById('auth-modal');
    const modalContent = document.getElementById('auth-modal-content');
    const modalTitle = document.getElementById('auth-modal-title');
    const formCustomer = document.getElementById('auth-form-customer');
    const profileView = document.getElementById('auth-profile-view');

    hideAlert();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modalContent.classList.remove('scale-95');

    if (window.currentUser) {
        modalTitle.textContent = 'My Account';
        document.getElementById('profile-name').textContent = window.currentUser.name;
        document.getElementById('profile-phone').textContent = window.currentUser.phone;
        document.getElementById('profile-avatar-icon').textContent = window.currentUser.name.charAt(0).toUpperCase();

        formCustomer.classList.add('hidden');
        profileView.classList.remove('hidden');

        // Fetch Order History
        AuthAPI.getOrders().then(orders => {
            const container = document.getElementById('profile-order-history');
            if (!orders || orders.length === 0) {
                container.innerHTML = '<p class="text-gray-400 italic text-center py-2">No past orders yet.</p>';
            } else {
                container.innerHTML = orders.map(ord => {
                    const statusText = (!ord.status || ord.status.toLowerCase() === 'pending') ? 'Order Placed' : ord.status;
                    return `
                    <div class="p-2 rounded-xl bg-white border border-gray-100 flex justify-between items-center shadow-2xs">
                        <div>
                            <span class="font-bold text-gray-800">#${ord.order_number}</span>
                            <span class="block text-[10px] text-gray-400">${new Date(ord.created_at).toLocaleDateString()}</span>
                        </div>
                        <div class="text-right">
                            <span class="font-semibold text-[#7a1c6a]">₹${ord.total_amount}</span>
                            <span class="block text-[10px] text-emerald-600 font-medium">${statusText}</span>
                        </div>
                    </div>
                `;
                }).join('');
            }
        });
    } else {
        modalTitle.textContent = 'Customer Details';
        formCustomer.classList.remove('hidden');
        profileView.classList.add('hidden');
    }
};

/**
 * Update Header Navigation UI across all pages
 */
function updateNavigationUI() {
    const desktopActionContainer = document.querySelector('.nav-container .flex.items-center.justify-end');
    if (!desktopActionContainer) return;

    let userBtn = document.getElementById('nav-user-btn');
    if (!userBtn) {
        userBtn = document.createElement('button');
        userBtn.id = 'nav-user-btn';
        userBtn.className = 'hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-purple-100/70 hover:bg-purple-200 text-[#3b113c] text-xs font-semibold transition-all duration-200';
        // Insert right before cart button
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            desktopActionContainer.insertBefore(userBtn, cartBtn);
        } else {
            desktopActionContainer.prepend(userBtn);
        }
    }

    if (window.currentUser) {
        const firstName = window.currentUser.name.split(' ')[0];
        userBtn.innerHTML = `
            <span class="w-5 h-5 rounded-full bg-[#3b113c] text-white flex items-center justify-center text-[10px] font-bold">${firstName.charAt(0)}</span>
            <span>👋 Hi, ${firstName}</span>
        `;
        userBtn.onclick = () => openAuthModal();
    } else {
        userBtn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>Sign in</span>
        `;
        userBtn.onclick = () => openAuthModal();
    }
}

/**
 * Auto-fill checkout fields if user is on checkout.html
 */
function autoFillCheckoutIfOnCheckoutPage() {
    if (!window.location.pathname.includes('checkout.html')) return;
    if (!window.currentUser) return;

    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');

    if (nameInput && !nameInput.value) nameInput.value = window.currentUser.name;
    if (phoneInput && !phoneInput.value) phoneInput.value = window.currentUser.phone;
}

// Initialize Auth State on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    injectAuthModalHTML();

    // Check server session cookie
    const serverUser = await AuthAPI.getMe();
    if (serverUser) {
        window.currentUser = serverUser;
        localStorage.setItem('proteinPotCustomer', JSON.stringify(serverUser));
    } else {
        // Clear any stale localStorage session on failed server auth
        localStorage.removeItem('proteinPotCustomer');
    }

    updateNavigationUI();
    autoFillCheckoutIfOnCheckoutPage();

    // Refresh menu cards, cart, and checkout summary once auth state is resolved
    if (typeof window.refreshMenuGrid === 'function') {
        window.refreshMenuGrid();
    } else if (typeof renderGrid === 'function') {
        renderGrid();
    }
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
    if (typeof loadOrderSummary === 'function') loadOrderSummary();
});
