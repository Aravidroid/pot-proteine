// Protein Pot - Menu Page Management
// Redesigned: Product Card Hierarchy & Immersive Quick-View Modal

// ── Category metadata ────────────────────────────────────────────────────
const categoryMeta = {
    'weight-gain': { label: 'Weight Gain', badgeClass: 'badge-gain', icon: '💪' },
    'weight-loss': { label: 'Weight Loss', badgeClass: 'badge-loss', icon: '🏃' },
    'diabetic': { label: 'Diabetic', badgeClass: 'badge-diab', icon: '🩺' },
    'healthy-workday': { label: 'Healthy Workday', badgeClass: 'badge-workday', icon: '💼' },
    'trial': { label: 'Trial', badgeClass: 'badge-trial', icon: '🧪' },
};

// ── Track Selected Plan by Product ID (default: 'daily') ─────────────────
const selectedPlanByProduct = {};

// ── Derive category/tier from product name ───────────────────────────────
function parseProduct(p) {
    const n = p.name.toLowerCase();
    let category = 'other';
    if (n.includes('weight gain')) category = 'weight-gain';
    else if (n.includes('weight loss')) category = 'weight-loss';
    else if (n.includes('diabetic')) category = 'diabetic';
    else if (n.includes('healthy workday') || n.includes('workday')) category = 'healthy-workday';
    else if (n.includes('trial')) category = 'trial';

    let tier = 'regular';
    if (n.includes('supreme')) tier = 'supreme';
    else if (n.includes('trial')) tier = 'trial';

    return { ...p, category, tier };
}

// ── Helper to calculate total portion weight ─────────────────────────────
function calculateTotalWeight(ingredients) {
    if (!Array.isArray(ingredients)) return '450g';
    let totalGrams = 0;
    ingredients.forEach(i => {
        if (typeof i === 'object' && i !== null && i.weight) {
            const match = i.weight.match(/(\d+)/);
            if (match) totalGrams += parseInt(match[1], 10);
        } else {
            totalGrams += 35; // Default average per ingredient
        }
    });
    return totalGrams > 0 ? `${totalGrams}g` : '450g';
}

// ── Select Plan on Card ──────────────────────────────────────────────────
function selectCardPlan(productId, planId) {
    selectedPlanByProduct[productId] = planId;
    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    // 1. Update Segmented Pills UI active states
    const pillContainer = document.getElementById(`plan-segmented-${productId}`);
    if (pillContainer) {
        const buttons = pillContainer.querySelectorAll('.plan-pill-btn');
        buttons.forEach(btn => {
            if (btn.dataset.planId === planId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 2. Update Price Tag and Savings Tag
    renderCardPrice(product, planId);

    // 3. Sync Qty Button
    syncCardAction(productId);
}

// ── Render Card Price Display ────────────────────────────────────────────
function renderCardPrice(product, planId = 'daily') {
    const priceContainer = document.getElementById(`price-tag-container-${product.id}`);
    if (!priceContainer) return;

    const plan = (product.plans && product.plans.find(pl => pl.id === planId)) || { price: product.price, originalPrice: product.price, savingsTag: '' };
    const isSupreme = String(product.id) === '3' || String(product.id) === '4';
    const isEligible = typeof isFirstOrderEligible === 'function' ? isFirstOrderEligible() : false;
    const isGuest = !window.currentUser;

    if (isSupreme && planId === 'daily') {
        if (isEligible) {
            priceContainer.innerHTML = `
                <div class="flex items-baseline gap-1.5">
                    <span class="price-tag text-[#7a1c6a] font-black text-xl" id="price-tag-${product.id}">₹119</span>
                    <span class="line-through text-gray-400 text-xs font-semibold">₹199</span>
                </div>
                <span class="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">🎉 First Order Offer</span>
            `;
            return;
        } else if (isGuest) {
            priceContainer.innerHTML = `
                <div class="flex items-baseline gap-1.5">
                    <span class="price-tag text-[#2a0c2b] font-black text-xl" id="price-tag-${product.id}">₹199</span>
                </div>
                <button onclick="openAuthModal()"
                    class="text-[10px] font-bold text-[#7a1c6a] hover:underline mt-0.5 text-left block">
                    🎉 Login for ₹119 first order offer
                </button>
            `;
            return;
        }
    }

    // Standard plan price display
    const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price;
    priceContainer.innerHTML = `
        <div class="flex items-baseline gap-1.5">
            <span class="price-tag text-[#2a0c2b] font-black text-xl" id="price-tag-${product.id}">₹${plan.price}</span>
            ${hasDiscount ? `<span class="line-through text-gray-400 text-xs font-semibold">₹${plan.originalPrice}</span>` : ''}
        </div>
        ${plan.savingsTag ? `<span class="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">💰 ${plan.savingsTag}</span>` : `<span class="text-[10px] font-medium text-gray-400">${plan.duration || '1 Day'}</span>`}
    `;
}

// ── Card HTML Builder ────────────────────────────────────────────────────
function buildCard(p) {
    const meta = categoryMeta[p.category] || { label: p.category, badgeClass: '', icon: '🥗' };
    const tierLabel = p.tier.charAt(0).toUpperCase() + p.tier.slice(1);
    const activePlanId = selectedPlanByProduct[p.id] || 'daily';

    // 1. Macro Strip
    const macroStripHTML = `
        <div class="macro-strip mb-3">
            ${p.protein ? `<span class="macro-item macro-protein">💪 ${p.protein}g Protein</span>` : ''}
            <span class="macro-divider"></span>
            ${p.calories ? `<span class="macro-item macro-cal">🔥 ${p.calories} kcal</span>` : ''}
            <span class="macro-divider"></span>
            <span class="macro-item text-[#065f46]">✨ 100% Real Food</span>
        </div>
    `;

    // 2. 3-Pill Ingredient Preview + "+more" trigger
    const ingredients = Array.isArray(p.ingredients) ? p.ingredients : [];
    const top3 = ingredients.slice(0, 3).map(i => {
        const name = typeof i === 'object' && i !== null ? i.name : i;
        const weight = typeof i === 'object' && i !== null && i.weight ? ` ${i.weight}` : '';
        return `<span class="ingredient-pill">${name}${weight}</span>`;
    }).join('');

    const remainingCount = Math.max(0, ingredients.length - 3);
    const morePillHTML = remainingCount > 0
        ? `<button type="button" class="ingredient-more-pill" onclick="openProductModal('${p.id}')" title="Click to view all ${ingredients.length} ingredients with exact weights">+${remainingCount} more</button>`
        : '';

    const ingredientPreviewHTML = `
        <div class="ingredient-pills-row mb-3.5">
            ${top3}
            ${morePillHTML}
        </div>
    `;

    // 3. Sleek Segmented Plan Pills (Daily / 6-Day / 26-Day)
    const plans = p.plans || [
        { id: 'daily', name: 'Daily', duration: '1 Day', price: p.price, savingsTag: '' },
        { id: 'weekly', name: '6-Day', duration: '6 Days/wk', price: p.price * 6, savingsTag: 'Save ₹60' },
        { id: 'monthly', name: '26-Day', duration: '26 Days/mo', price: p.price * 26, savingsTag: 'Save ₹520' }
    ];

    const segmentedPillsHTML = `
        <div class="plan-segmented-wrapper mb-3.5" id="plan-segmented-${p.id}">
            <div class="plan-segmented-grid">
                ${plans.map(plan => {
                    const isActive = plan.id === activePlanId;
                    let badgeHTML = '';
                    if (plan.savingsTag) {
                        badgeHTML = `<span class="plan-pill-badge plan-badge-savings">${plan.savingsTag}</span>`;
                    } else if (String(p.id) === '3' || String(p.id) === '4') {
                        badgeHTML = `<span class="plan-pill-badge plan-badge-offer">₹119 Offer</span>`;
                    }
                    return `
                        <button type="button" 
                            class="plan-pill-btn ${isActive ? 'active' : ''}" 
                            data-plan-id="${plan.id}" 
                            onclick="selectCardPlan('${p.id}', '${plan.id}')"
                            aria-label="Choose ${plan.name} Plan">
                            ${badgeHTML}
                            <span class="plan-pill-name">${plan.name}</span>
                            <span class="plan-pill-price">₹${plan.price}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    `;

    return `
    <div class="product-card bg-white rounded-[28px] border border-pink-100/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group" data-category="${p.category}" data-id="${p.id}">
        <!-- Header Image with Quick-View Trigger -->
        <div class="product-image-wrap cursor-pointer relative overflow-hidden bg-gradient-to-tr from-purple-50/50 to-pink-50/30" onclick="openProductModal('${p.id}')" title="Click to view full ingredient weights & nutrition">
            <img class="product-image group-hover:scale-105 transition-transform duration-500" src="${p.image || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}">
            <div class="absolute top-3 left-3 flex items-center gap-1.5">
                <span class="badge ${meta.badgeClass} shadow-xs">${meta.icon} ${meta.label}</span>
            </div>
            <div class="absolute top-3 right-3">
                <span class="tier-label bg-white/90 backdrop-blur-xs shadow-2xs">${tierLabel}</span>
            </div>
            <div class="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[#7a1c6a] hover:text-[#3b113c] text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>🔍 Quick View</span>
            </div>
        </div>

        <div class="p-5 flex flex-col flex-1">
            <!-- 1. Product Title -->
            <h3 class="font-extrabold text-[#2a0c2b] text-lg mb-2.5 leading-snug cursor-pointer hover:text-[#7a1c6a] transition-colors" onclick="openProductModal('${p.id}')">
                ${p.name}
            </h3>

            <!-- 2. Macro Strip -->
            ${macroStripHTML}

            <!-- 3. 3-Pill Ingredient Preview -->
            ${ingredientPreviewHTML}

            <!-- 4. Sleek Segmented Plan Pills -->
            ${segmentedPillsHTML}

            <div class="flex-1"></div>

            <!-- 5. Bottom Price + Tactile Add Button -->
            <div class="flex items-center justify-between mt-2 pt-3 border-t border-pink-100/70 gap-3">
                <div class="flex flex-col leading-tight min-w-0" id="price-tag-container-${p.id}">
                    <!-- Rendered via JS initialization -->
                </div>
                <div class="shrink-0 min-w-[120px] sm:min-w-[130px]" id="action-${p.id}">
                    <button class="btn-tactile-add" onclick="handleAdd('${p.id}')">
                        <span>＋ Add</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Product Quick-View Slide-Up Modal ────────────────────────────────────
function openProductModal(productId) {
    const modal = document.getElementById('product-details-modal');
    const content = document.getElementById('product-modal-content');
    if (!modal || !content) return;

    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const p = products.find(prod => String(prod.id) === String(productId));
    if (!p) return;

    const parsed = parseProduct(p);
    const meta = categoryMeta[parsed.category] || { label: parsed.category, badgeClass: '', icon: '🥗' };
    const activePlanId = selectedPlanByProduct[p.id] || 'daily';
    const totalWeight = calculateTotalWeight(p.ingredients);
    const plans = p.plans || [];

    // Exact Ingredient Weights Breakdown Cards
    let ingredientsGridHTML = '';
    if (Array.isArray(p.ingredients) && p.ingredients.length > 0) {
        ingredientsGridHTML = p.ingredients.map(i => {
            const name = typeof i === 'object' && i !== null ? i.name : i;
            const weight = typeof i === 'object' && i !== null && i.weight ? i.weight : '35g';
            const macro = typeof i === 'object' && i !== null && i.macro ? i.macro : 'Natural Nutrients';

            return `
                <div class="ingredient-weight-card">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span class="font-bold text-[#2a0c2b] text-xs truncate">${name}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <span class="bg-[#faf3f5] text-[#7a1c6a] px-2 py-0.5 rounded-lg font-extrabold text-[11px] border border-pink-100">${weight}</span>
                        <span class="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-lg font-semibold text-[10px] hidden sm:inline-block">${macro}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal Segmented Plan Selector
    const modalPlansHTML = plans.length > 0 ? `
        <div class="my-4 p-3.5 bg-[#faf3f5] border border-pink-100 rounded-2xl">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-extrabold uppercase tracking-wider text-[#2a0c2b]">Select Subscription Plan</span>
                <span class="text-[10px] font-bold text-[#7a1c6a] bg-purple-100/70 px-2 py-0.5 rounded-full">Flexible Delivery</span>
            </div>
            <div class="plan-segmented-grid" id="modal-segmented-plan-${p.id}">
                ${plans.map(plan => {
                    const isActive = plan.id === activePlanId;
                    let badgeHTML = '';
                    if (plan.savingsTag) {
                        badgeHTML = `<span class="plan-pill-badge plan-badge-savings">${plan.savingsTag}</span>`;
                    }
                    return `
                        <button type="button" 
                            class="plan-pill-btn ${isActive ? 'active' : ''}" 
                            data-plan-id="${plan.id}" 
                            onclick="selectModalPlan('${p.id}', '${plan.id}')">
                            ${badgeHTML}
                            <span class="plan-pill-name">${plan.name}</span>
                            <span class="plan-pill-price">₹${plan.price}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    ` : '';

    content.innerHTML = `
        <div class="relative flex flex-col">
            <!-- Mobile Pull Drag Bar Indicator -->
            <div class="sm:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-2.5 mb-1 shrink-0"></div>

            <!-- Hero Image Banner -->
            <div class="w-full h-48 sm:h-56 bg-gradient-to-br from-pink-50 via-purple-50 to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden shrink-0">
                <img src="${p.image || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}" class="max-h-full max-w-full object-contain drop-shadow-xl transform hover:scale-105 transition duration-500">
                <div class="absolute bottom-3 left-4 flex gap-2 items-center">
                    <span class="badge ${meta.badgeClass} shadow-xs">${meta.icon} ${meta.label}</span>
                    <span class="bg-white/95 text-[#2a0c2b] text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs border border-pink-100">⚖️ ${totalWeight} Total</span>
                </div>
            </div>

            <!-- Body Details -->
            <div class="p-5 sm:p-7 overflow-y-auto flex-1">
                <div class="flex items-start justify-between gap-4 mb-2">
                    <h2 class="text-xl sm:text-2xl font-black text-[#2a0c2b] leading-tight">${p.name}</h2>
                </div>

                <!-- Macro Strip in Modal -->
                <div class="macro-strip mb-4">
                    ${p.protein ? `<span class="macro-item macro-protein text-xs">💪 ${p.protein}g Protein</span>` : ''}
                    <span class="macro-divider"></span>
                    ${p.calories ? `<span class="macro-item macro-cal text-xs">🔥 ${p.calories} kcal</span>` : ''}
                    <span class="macro-divider"></span>
                    <span class="macro-item text-[#065f46] text-xs">✨ Zero Added Sugar</span>
                </div>

                <!-- Plan Selection in Modal -->
                ${modalPlansHTML}

                <!-- Benefits Callout -->
                ${p.benefits ? `
                <div class="my-4 p-4 bg-purple-50/70 border border-purple-100 rounded-2xl">
                    <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#7a1c6a] mb-1.5 flex items-center gap-1.5">
                        <span>✨</span> Why This Pot Works
                    </h4>
                    <p class="text-xs sm:text-sm text-[#4b2040] leading-relaxed font-medium">
                        ${p.benefits}
                    </p>
                </div>` : ''}

                <!-- Exact Ingredient Weights Section -->
                <div class="my-4">
                    <div class="flex items-center justify-between mb-2.5">
                        <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#2a0c2b] flex items-center gap-1.5">
                            <span>🥗</span> Exact Ingredient Weights (${p.ingredients ? p.ingredients.length : 0})
                        </h4>
                        <span class="text-[11px] font-bold text-[#10b981]">Freshly Cut Daily</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${ingredientsGridHTML}
                    </div>
                </div>
            </div>

            <!-- Sticky Bottom CTA Bar -->
            <div class="p-4 sm:p-5 border-t border-pink-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-4 sticky bottom-0 z-20 shrink-0">
                <div class="flex flex-col" id="modal-price-container-${p.id}">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selected Plan Price</span>
                    <span class="text-2xl font-black text-[#2a0c2b]" id="modal-price-display-${p.id}">₹${p.price}</span>
                </div>
                <button onclick="handleAddFromModal('${p.id}'); closeProductModal();" 
                    class="btn-tactile-add !w-auto flex-1 py-3 px-6 text-sm sm:text-base">
                    <span>🛒 Add to Cart</span>
                </button>
            </div>
        </div>
    `;

    // Initialize price in modal
    updateModalPriceDisplay(p, activePlanId);

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.add('is-opening');
    });
    document.body.style.overflow = 'hidden';
}

// ── Select Plan inside Quick-View Modal ──────────────────────────────────
function selectModalPlan(productId, planId) {
    selectedPlanByProduct[productId] = planId;
    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;

    // 1. Update modal segmented buttons
    const container = document.getElementById(`modal-segmented-plan-${productId}`);
    if (container) {
        container.querySelectorAll('.plan-pill-btn').forEach(btn => {
            if (btn.dataset.planId === planId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // 2. Update modal price display
    updateModalPriceDisplay(product, planId);

    // 3. Sync card as well
    selectCardPlan(productId, planId);
}

function updateModalPriceDisplay(product, planId) {
    const displayEl = document.getElementById(`modal-price-display-${product.id}`);
    if (!displayEl) return;
    const plan = (product.plans && product.plans.find(pl => pl.id === planId)) || { price: product.price };
    const effectivePrice = typeof getProductEffectivePrice === 'function' ? getProductEffectivePrice(product, planId) : plan.price;
    displayEl.textContent = `₹${effectivePrice}`;
}

function closeProductModal() {
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.classList.remove('is-opening');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProductModal();
});

// ── Cart Interactions with Chosen Plan ───────────────────────────────────
function handleAdd(id) {
    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const product = products.find(p => String(p.id) === String(id));
    if (!product) return;

    const chosenPlanId = selectedPlanByProduct[id] || 'daily';
    const chosenPlan = (product.plans && product.plans.find(pl => pl.id === chosenPlanId)) || {
        id: 'daily',
        name: 'Daily',
        duration: '1 Day',
        days: 1,
        price: product.price
    };

    const effectivePrice = typeof getProductEffectivePrice === 'function' 
        ? getProductEffectivePrice(product, chosenPlanId) 
        : chosenPlan.price;

    const itemToAdd = {
        ...product,
        id: `${product.id}-${chosenPlan.id}`,
        selectedPlanId: chosenPlan.id,
        name: `${product.name} (${chosenPlan.name})`,
        price: effectivePrice,
        planName: chosenPlan.name,
        duration: chosenPlan.duration,
        days: chosenPlan.days,
        details: product.ingredients
    };

    if (typeof addToCart === 'function') {
        addToCart(itemToAdd);
    } else {
        const currentCart = getCartItems();
        const idx = currentCart.findIndex(i => i.id === itemToAdd.id);
        if (idx > -1) {
            currentCart[idx].quantity++;
        } else {
            currentCart.push({ ...itemToAdd, quantity: 1 });
        }
        localStorage.setItem('proteinPotCart', JSON.stringify(currentCart));
    }

    syncQtyButtons();
    if (typeof updateCartCount === 'function') updateCartCount();
}

function handleAddFromModal(productId) {
    handleAdd(productId);
}

function handleRemove(cartItemId, productId) {
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        const itemIndex = cart.findIndex(i => i.id === cartItemId);
        if (itemIndex > -1) {
            updateItemQuantity(itemIndex, cart[itemIndex].quantity - 1);
        }
    } else {
        const currentCart = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
        const itemIndex = currentCart.findIndex(i => i.id === cartItemId);
        if (itemIndex > -1) {
            currentCart[itemIndex].quantity--;
            if (currentCart[itemIndex].quantity <= 0) {
                currentCart.splice(itemIndex, 1);
            }
            localStorage.setItem('proteinPotCart', JSON.stringify(currentCart));
        }
    }

    syncQtyButtons();
    if (typeof updateCartCount === 'function') updateCartCount();
}

// ── Sync Qty Buttons on Cards ────────────────────────────────────────────
function syncCardAction(productId) {
    const wrapper = document.getElementById(`action-${productId}`);
    if (!wrapper) return;

    const chosenPlanId = selectedPlanByProduct[productId] || 'daily';
    const cartItemId = `${productId}-${chosenPlanId}`;
    const currentCart = getCartItems();
    const cartItem = currentCart.find(item => item.id === cartItemId || item.id === productId);

    if (cartItem && cartItem.quantity > 0) {
        wrapper.innerHTML = `
            <div class="qty-controls">
                <button type="button" class="qty-btn" onclick="handleRemove('${cartItem.id}', '${productId}')" aria-label="Decrease quantity">−</button>
                <span class="qty-display">${cartItem.quantity}</span>
                <button type="button" class="qty-btn" onclick="handleAdd('${productId}')" aria-label="Increase quantity">＋</button>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <button type="button" class="btn-tactile-add" onclick="handleAdd('${productId}')">
                <span>＋ Add</span>
            </button>
        `;
    }
}

function syncQtyButtons() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productId = card.dataset.id;
        if (productId) syncCardAction(productId);
    });
}

function getCartItems() {
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        return cart;
    }
    return JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
}

// ── Render Grid ──────────────────────────────────────────────────────────
let currentFilter = 'all';

function renderGrid(filter = currentFilter) {
    currentFilter = filter;
    const grid = document.getElementById('product-grid');
    const empty = document.getElementById('empty-state');
    if (!grid) return;

    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const parsed = products.map(parseProduct);
    const filtered = filter === 'all' ? parsed : parsed.filter(p => p.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
    } else {
        if (empty) empty.style.display = 'none';
        grid.innerHTML = filtered.map(buildCard).join('');

        // Initialize price displays and actions for all cards
        filtered.forEach(p => {
            const defaultPlanId = selectedPlanByProduct[p.id] || 'daily';
            renderCardPrice(p, defaultPlanId);
            syncCardAction(p.id);
        });
    }
}

window.refreshMenuGrid = function() {
    renderGrid(currentFilter);
};

// ── Initialize menu page ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Setup filter tabs
    const filterTabs = document.getElementById('filter-tabs');
    if (filterTabs) {
        filterTabs.addEventListener('click', e => {
            const btn = e.target.closest('.filter-tab');
            if (!btn) return;
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            renderGrid(btn.dataset.filter);
        });
    }

    // Initial render
    renderGrid('all');
    if (typeof updateCartCount === 'function') updateCartCount();
});
