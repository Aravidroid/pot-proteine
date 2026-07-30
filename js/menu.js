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
        ? `<div class="flex gap-2 mb-3">
            ${p.protein  ? `<div class="nutrition-chip"><span>${p.protein}g</span><span>Protein</span></div>` : ''}
            ${p.calories ? `<div class="nutrition-chip"><span>${p.calories}</span><span>kcal</span></div>` : ''}
           </div>` : '';

    const pills = p.ingredients
        .map(i => {
            const name = typeof i === 'object' && i !== null ? (i.weight ? `${i.name} (${i.weight})` : i.name) : i;
            return `<span class="ingredient-pill">${name}</span>`;
        })
        .join('');

    const ingredientCount = p.ingredients ? p.ingredients.length : 0;
    let ingredientsHTML = '';
    if (ingredientCount > 0) {
        ingredientsHTML = `
        <div class="mb-3">
            <button type="button" 
                    onclick="toggleIngredients('${p.id}')" 
                    class="w-full flex items-center justify-between text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 transition-colors duration-200">
                <span class="flex items-center gap-1.5 font-semibold text-primary-dark">
                    <span>🥗</span> 
                    <span id="ing-btn-text-${p.id}">View Ingredients (${ingredientCount})</span>
                </span>
                <span id="ing-chevron-${p.id}" class="text-xs transition-transform duration-200 inline-block">▼</span>
            </button>
            <div id="ingredients-${p.id}" class="hidden mt-2.5 flex flex-wrap gap-1.5 transition-all duration-300">
                ${pills}
            </div>
        </div>`;
    }

    let planSelectorHTML = '';
    if (p.plans && p.plans.length > 0) {
        planSelectorHTML = `
        <div class="mb-3">
            <label for="plan-select-${p.id}" class="block text-xs font-semibold text-gray-700 mb-1 font-sans">Choose Plan Duration:</label>
            <select id="plan-select-${p.id}" onchange="updatePlanPrice('${p.id}')" class="w-full text-xs p-2 border border-gray-300 rounded bg-white text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-green-500 shadow-sm">
                ${p.plans.map(plan => `<option value="${plan.id}" data-price="${plan.price}">${plan.name} (${plan.duration}) - ₹${plan.price}</option>`).join('')}
            </select>
            <p class="text-[11px] text-green-700 mt-1.5 font-medium flex items-center gap-1">
                <span>🥦</span> 5 fresh super-fruits selected daily from pool
            </p>
        </div>`;
    }

    return `
    <div class="product-card" data-category="${p.category}" data-id="${p.id}">
        <div class="product-image-wrap">
            <img class="product-image" src="${p.image || DEFAULT_PRODUCT_IMAGE}" alt="${p.name}">
        </div>

        <div class="p-5 flex flex-col flex-1">
            <!-- Badges row -->
            <div class="flex items-center justify-between mb-3">
                <span class="badge ${meta.badgeClass}">${meta.icon} ${meta.label}</span>
                <span class="tier-label">${tierLabel}</span>
            </div>

            <!-- Name -->
            <h3 class="font-bold text-primary-dark text-base mb-3 leading-snug">${p.name}</h3>

            <!-- Nutrition (if available) -->
            ${nutritionHTML}

            <!-- Collapsible Ingredients -->
            ${ingredientsHTML}

            <!-- Optional Plan Selector -->
            ${planSelectorHTML}

            <!-- Spacer pushes price+btn to bottom -->
            <div class="flex-1"></div>

            <!-- Price + Add -->
            <div class="flex items-center justify-between mt-3 gap-3">
                <span class="price-tag" id="price-tag-${p.id}">₹${p.price}</span>
                <div class="flex-1 max-w-[160px]" id="action-${p.id}">
                    <button class="add-btn" onclick="handleAdd('${p.id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    </div>`;
}

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

// ── Qty button sync ──────────────────────────────────────────────────────
function syncQtyButtons() {
    const cart = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
    cart.forEach(item => {
        const wrapper = document.getElementById(`action-${item.id}`);
        if (!wrapper) return;
        wrapper.innerHTML = `
            <div class="qty-controls">
                <button class="qty-btn" onclick="handleRemove('${item.id}')">−</button>
                <span class="qty-display" id="qty-${item.id}">${item.quantity}</span>
                <button class="qty-btn" onclick="handleAdd('${item.id}')">+</button>
            </div>`;
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

    // Use existing cart.js addToCart if available, else fallback
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

function handleRemove(id) {
    const currentCart = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
    const itemIndex = currentCart.findIndex(i => i.id === id);

    if (typeof updateItemQuantity === 'function' && itemIndex > -1) {
        updateItemQuantity(itemIndex, currentCart[itemIndex].quantity - 1);
    } else {
        let cart = currentCart;
        const idx = cart.findIndex(i => i.id === id);
        if (idx > -1) {
            cart[idx].quantity--;
            if (cart[idx].quantity <= 0) cart.splice(idx, 1);
        }
        localStorage.setItem('proteinPotCart', JSON.stringify(cart));
    }

    // If qty hits 0, revert to Add button
    const cart = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
    const item = cart.find(i => i.id === id);
    const wrapper = document.getElementById(`action-${id}`);
    if (!item && wrapper) {
        wrapper.innerHTML = `<button class="add-btn" onclick="handleAdd('${id}')">Add to Cart</button>`;
    } else {
        syncQtyButtons();
    }
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
