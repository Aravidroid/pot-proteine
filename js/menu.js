// Protein Pot - Menu Page Management
// Handles: product filtering, grid rendering, and cart interactions for menu page

// ── Category metadata ────────────────────────────────────────────────────
const categoryMeta = {
    'weight-gain':     { label: 'Weight Gain',     badgeClass: 'badge-gain',    icon: '💪' },
    'weight-loss':     { label: 'Weight Loss',     badgeClass: 'badge-loss',    icon: '🏃' },
    'diabetic':        { label: 'Diabetic',        badgeClass: 'badge-diab',    icon: '🩺' },
    'healthy-workday': { label: 'Healthy Workday', badgeClass: 'badge-workday', icon: '💼' },
    'trial':           { label: 'Trial',           badgeClass: 'badge-trial',   icon: '🧪' },
};

// ── Derive category/tier from product name ───────────────────────────────
function parseProduct(p) {
    const n = p.name.toLowerCase();
    let category = 'other';
    if (n.includes('weight gain'))  category = 'weight-gain';
    else if (n.includes('weight loss')) category = 'weight-loss';
    else if (n.includes('diabetic')) category = 'diabetic';
    else if (n.includes('healthy workday') || n.includes('workday')) category = 'healthy-workday';
    else if (n.includes('trial'))   category = 'trial';

    let tier = 'regular';
    if (n.includes('supreme')) tier = 'supreme';
    else if (n.includes('trial')) tier = 'trial';

    return { ...p, category, tier };
}

// Helper to update price displayed on plan selection
function updatePlanPrice(productId) {
    const selectEl = document.getElementById(`plan-select-${productId}`);
    if (!selectEl) return;
    const priceTag = document.getElementById(`price-tag-${productId}`);
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const price = selectedOption.dataset.price;
    if (priceTag && price) {
        priceTag.textContent = `₹${price}`;
    }
}

// Helper to toggle ingredients visibility
function toggleIngredients(productId) {
    const container = document.getElementById(`ingredients-${productId}`);
    const btnText = document.getElementById(`ing-btn-text-${productId}`);
    const chevron = document.getElementById(`ing-chevron-${productId}`);
    
    if (!container) return;

    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
        container.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        if (btnText) {
            const count = container.children.length;
            btnText.textContent = `Hide Ingredients (${count})`;
        }
    } else {
        container.classList.add('hidden');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        if (btnText) {
            const count = container.children.length;
            btnText.textContent = `View Ingredients (${count})`;
        }
    }
}

// ── Card HTML ────────────────────────────────────────────────────────────
function buildCard(p) {
    const meta = categoryMeta[p.category] || { label: p.category, badgeClass: '', icon: '🥗' };
    const tierLabel = p.tier.charAt(0).toUpperCase() + p.tier.slice(1);

    const nutritionHTML = (p.protein || p.calories)
        ? `<div class="flex flex-wrap gap-2 mb-3">
            ${p.protein  ? `<span class="nutrition-chip nutrition-chip-protein">💪 ${p.protein}g Protein</span>` : ''}
            ${p.calories ? `<span class="nutrition-chip nutrition-chip-cal">🔥 ${p.calories} kcal</span>` : ''}
           </div>` : '';

    // Ingredient pills preview
    const ingPreview = Array.isArray(p.ingredients) ? p.ingredients.slice(0, 4).map(i => {
        const name = typeof i === 'object' && i !== null ? i.name : i;
        return `<span class="ingredient-pill">${name}</span>`;
    }).join('') : '';

    const ingHTML = ingPreview ? `<div class="flex flex-wrap gap-1.5 mb-3">${ingPreview}<span class="ingredient-pill text-gray-500 bg-gray-100">+more</span></div>` : '';

    let planSelectorHTML = '';
    if (p.plans && p.plans.length > 0) {
        planSelectorHTML = `
        <div class="mb-3 bg-[#faf3f5] p-2.5 rounded-2xl border border-pink-100/80">
            <label for="plan-select-${p.id}" class="block text-xs font-bold text-[#2a0c2b] mb-1.5">Choose Plan Duration:</label>
            <select id="plan-select-${p.id}" onchange="updatePlanPrice('${p.id}')" class="w-full text-xs p-2 border border-pink-200 rounded-xl bg-white text-[#2a0c2b] font-bold focus:outline-none focus:ring-2 focus:ring-[#3b113c] shadow-xs cursor-pointer">
                ${p.plans.map(plan => `<option value="${plan.id}" data-price="${plan.price}">${plan.name} (${plan.duration}) - ₹${plan.price}</option>`).join('')}
            </select>
        </div>`;
    }

    return `
    <div class="product-card bg-white rounded-[28px] border border-pink-100/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col" data-category="${p.category}" data-id="${p.id}">
        <div class="product-image-wrap cursor-pointer relative" onclick="openProductModal('${p.id}')" title="Click to view full details">
            <img class="product-image" src="${p.image || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}">
        </div>

        <div class="p-5 flex flex-col flex-1">
            <!-- Badges row -->
            <div class="flex items-center justify-between mb-3">
                <span class="badge ${meta.badgeClass}">${meta.icon} ${meta.label}</span>
                <span class="tier-label">${tierLabel}</span>
            </div>

            <!-- Name -->
            <h3 class="font-extrabold text-[#2a0c2b] text-base mb-2 leading-snug cursor-pointer hover:text-[#7a1c6a] transition" onclick="openProductModal('${p.id}')">${p.name}</h3>

            <!-- Nutrition Macro Badges -->
            ${nutritionHTML}

            <!-- Ingredient Tags Preview -->
            ${ingHTML}

            <!-- Quick View button -->
            <button onclick="openProductModal('${p.id}')" class="text-xs font-bold text-[#7a1c6a] hover:text-[#3b113c] mb-3 text-left flex items-center gap-1">
                <span>🔍 Quick View & Ingredients</span>
            </button>

            <!-- Plan Duration Selector -->
            ${planSelectorHTML}

            <!-- Spacer pushes price+btn to bottom -->
            <div class="flex-1"></div>

            <!-- Price + Add -->
            <div class="flex items-center justify-between mt-3 gap-3 pt-2 border-t border-pink-100/60">
                <span class="price-tag text-[#2a0c2b] font-extrabold text-xl" id="price-tag-${p.id}">₹${p.price}</span>
                <div class="flex-1 max-w-[160px]" id="action-${p.id}">
                    <button class="add-btn" onclick="handleAdd('${p.id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    </div>`;
}

// ── Product Details Modal Popup ──────────────────────────────────────────
function openProductModal(productId) {
    const modal = document.getElementById('product-details-modal');
    const content = document.getElementById('product-modal-content');
    if (!modal || !content) return;

    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    const parsed = parseProduct(p);
    const meta = categoryMeta[parsed.category] || { label: parsed.category, badgeClass: '', icon: '🥗' };

    const ingredientCount = p.ingredients ? p.ingredients.length : 0;

    // Format ingredients
    let ingredientsListHTML = '';
    if (p.ingredients && p.ingredients.length > 0) {
        ingredientsListHTML = p.ingredients.map(i => {
            if (typeof i === 'object' && i !== null) {
                return `
                <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                    <span class="font-semibold text-gray-800 text-xs sm:text-sm">🥗 ${i.name}</span>
                    <div class="flex items-center gap-1.5 text-xs text-gray-600">
                        ${i.weight ? `<span class="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium text-[11px]">${i.weight}</span>` : ''}
                        ${i.macro ? `<span class="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium text-[11px]">${i.macro}</span>` : ''}
                    </div>
                </div>`;
            } else {
                return `
                <div class="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5"> ${i}
                </div>`;
            }
        }).join('');
    }

    // Format plan selector HTML if plans exist
    let plansHTML = '';
    if (p.plans && p.plans.length > 0) {
        plansHTML = `
        <div class="my-4 p-4 bg-green-50/70 border border-green-200 rounded-xl">
            <label for="modal-plan-select-${p.id}" class="block text-xs font-bold text-green-900 mb-1.5">Choose Subscription Plan:</label>
            <select id="modal-plan-select-${p.id}" onchange="updateModalPlanPrice('${p.id}')" class="w-full text-sm p-2.5 border border-green-300 rounded-lg bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm">
                ${p.plans.map(plan => `<option value="${plan.id}" data-price="${plan.price}">${plan.name} (${plan.duration}) - ₹${plan.price}</option>`).join('')}
            </select>
            <p class="text-xs text-green-700 mt-2 font-medium flex items-center gap-1">
                <span>🥦</span> 5 fresh super-fruits selected daily from pool
            </p>
        </div>`;
    }

    content.innerHTML = `
        <div class="relative">
            <div class="w-full h-52 sm:h-60 bg-gradient-to-br from-green-50 via-emerald-100 to-teal-50 flex items-center justify-center p-6 relative overflow-hidden">
                <img src="${p.image || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}" class="max-h-full max-w-full object-contain drop-shadow-lg transform hover:scale-105 transition duration-300">
                <div class="absolute bottom-3 left-4 flex gap-2">
                    <span class="badge ${meta.badgeClass} shadow-sm">${meta.icon} ${meta.label}</span>
                </div>
            </div>

            <div class="p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">${p.name}</h2>
                <div class="flex items-center gap-3 text-sm text-gray-600 mb-4">
                    <span class="text-xl font-bold text-gray-900" id="modal-price-${p.id}">₹${p.price}</span>
                    ${p.protein ? `<span class="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">💪 ${p.protein}g Protein</span>` : ''}
                    ${p.calories ? `<span class="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-semibold">🔥 ${p.calories} kcal</span>` : ''}
                </div>

                ${plansHTML}

                ${p.benefits ? `
                <div class="my-4 p-3.5 bg-green-50/80 border border-green-200/80 rounded-xl">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-green-800 mb-1 flex items-center gap-1.5">
                        <span>✨</span> What Makes It Special?
                    </h3>
                    <p class="text-xs text-gray-700 leading-relaxed font-medium">
                        ${p.benefits}
                    </p>
                </div>` : ''}

                <div class="my-4">
                    <h3 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Included Ingredients (${ingredientCount})</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        ${ingredientsListHTML}
                    </div>
                </div>

                <div class="mt-6 pt-4 border-t flex items-center gap-3">
                    <button onclick="handleAddFromModal('${p.id}'); closeProductModal();" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                        <span>🛒 Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function updateModalPlanPrice(productId) {
    const selectEl = document.getElementById(`modal-plan-select-${productId}`);
    const priceEl = document.getElementById(`modal-price-${productId}`);
    if (!selectEl || !priceEl) return;
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const price = selectedOption.dataset.price;
    if (price) {
        priceEl.textContent = `₹${price}`;
    }
}

function handleAddFromModal(productId) {
    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let itemToAdd = { ...product };
    if (product.plans && product.plans.length > 0) {
        const selectEl = document.getElementById(`modal-plan-select-${productId}`);
        const chosenPlanId = selectEl ? selectEl.value : product.plans[0].id;
        const chosenPlan = product.plans.find(pl => pl.id === chosenPlanId) || product.plans[0];

        itemToAdd = {
            ...product,
            id: `${product.id}-${chosenPlan.id}`,
            name: `${product.name} (${chosenPlan.name})`,
            price: chosenPlan.price,
            planName: chosenPlan.name,
            duration: chosenPlan.duration,
            days: chosenPlan.days
        };
    }

    if (typeof addToCart === 'function') {
        addToCart(itemToAdd);
    } else {
        const cart  = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
        const idx   = cart.findIndex(i => i.id === itemToAdd.id);
        if (idx > -1) { cart[idx].quantity++; }
        else          { cart.push({ ...itemToAdd, quantity: 1, details: itemToAdd.ingredients }); }
        localStorage.setItem('proteinPotCart', JSON.stringify(cart));
    }
    syncQtyButtons();
    updateCartCount();
}

function closeProductModal() {
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeProductModal();
});

// ── Render grid ──────────────────────────────────────────────────────────
function renderGrid(filter = 'all') {
    const grid  = document.getElementById('product-grid');
    const empty = document.getElementById('empty-state');
    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const parsed = products.map(parseProduct);
    const filtered = filter === 'all' ? parsed : parsed.filter(p => p.category === filter);

    if (filtered.length === 0) {
        grid.innerHTML  = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        grid.innerHTML = filtered.map(buildCard).join('');
        // Sync qty buttons with current cart state
        syncQtyButtons();
    }
}

// ── Helper to get active cart ─────────────────────────────────────────────
function getCartItems() {
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        return cart;
    }
    return JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
}

// ── Qty button sync ──────────────────────────────────────────────────────
function syncQtyButtons() {
    const currentCart = getCartItems();
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productId = card.dataset.id;
        if (!productId) return;

        const wrapper = document.getElementById(`action-${productId}`);
        if (!wrapper) return;

        const cartItem = currentCart.find(item => item.id === productId || item.id.startsWith(`${productId}-`));

        if (cartItem && cartItem.quantity > 0) {
            wrapper.innerHTML = `
                <div class="qty-controls">
                    <button class="qty-btn" onclick="handleRemove('${cartItem.id}')" aria-label="Decrease quantity">−</button>
                    <span class="qty-display" id="qty-${productId}">${cartItem.quantity}</span>
                    <button class="qty-btn" onclick="handleAdd('${productId}')" aria-label="Increase quantity">+</button>
                </div>`;
        } else {
            wrapper.innerHTML = `
                <button class="add-btn" onclick="handleAdd('${productId}')">Add to Cart</button>`;
        }
    });
}

// ── Cart interactions ────────────────────────────────────────────────────
function handleAdd(id) {
    const products = typeof allProducts !== 'undefined' ? allProducts : gymMenuProducts;
    const product = products.find(p => p.id === id);
    if (!product) return;

    let itemToAdd = { ...product };
    if (product.plans && product.plans.length > 0) {
        const selectEl = document.getElementById(`plan-select-${id}`);
        const chosenPlanId = selectEl ? selectEl.value : product.plans[0].id;
        const chosenPlan = product.plans.find(pl => pl.id === chosenPlanId) || product.plans[0];

        itemToAdd = {
            ...product,
            id: `${product.id}-${chosenPlan.id}`,
            name: `${product.name} (${chosenPlan.name})`,
            price: chosenPlan.price,
            planName: chosenPlan.name,
            duration: chosenPlan.duration,
            days: chosenPlan.days
        };
    }

    if (typeof addToCart === 'function') {
        addToCart(itemToAdd);
    } else {
        const currentCart = getCartItems();
        const idx = currentCart.findIndex(i => i.id === itemToAdd.id);
        if (idx > -1) {
            currentCart[idx].quantity++;
        } else {
            currentCart.push({ ...itemToAdd, quantity: 1, details: itemToAdd.ingredients });
        }
        localStorage.setItem('proteinPotCart', JSON.stringify(currentCart));
    }

    syncQtyButtons();
    updateCartCount();
}

function handleRemove(id) {
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
        const itemIndex = cart.findIndex(i => i.id === id);
        if (itemIndex > -1) {
            updateItemQuantity(itemIndex, cart[itemIndex].quantity - 1);
        }
    } else {
        const currentCart = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
        const itemIndex = currentCart.findIndex(i => i.id === id);
        if (itemIndex > -1) {
            currentCart[itemIndex].quantity--;
            if (currentCart[itemIndex].quantity <= 0) {
                currentCart.splice(itemIndex, 1);
            }
            localStorage.setItem('proteinPotCart', JSON.stringify(currentCart));
        }
    }

    syncQtyButtons();
    updateCartCount();
}

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
    updateCartCount();
});
