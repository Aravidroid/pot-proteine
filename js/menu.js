// Protein Pot - Menu Page Management
// Handles: product filtering, grid rendering, and cart interactions for menu page

// ── Category metadata ────────────────────────────────────────────────────
const categoryMeta = {
    'weight-gain': { label: 'Weight Gain', badgeClass: 'badge-gain',  icon: '💪' },
    'weight-loss': { label: 'Weight Loss', badgeClass: 'badge-loss',  icon: '🏃' },
    'oldage':      { label: 'Old Age',     badgeClass: 'badge-old',   icon: '🧓' },
    'it':          { label: 'IT',          badgeClass: 'badge-it',    icon: '💻' },
    'diabetic':    { label: 'Diabetic',    badgeClass: 'badge-diab',  icon: '🩺' },
    'trial':       { label: 'Trial',       badgeClass: 'badge-trial', icon: '🧪' },
};

// ── Derive category/tier from product name ───────────────────────────────
function parseProduct(p) {
    const n = p.name.toLowerCase();
    let category = 'other';
    if (n.includes('weight gain'))  category = 'weight-gain';
    else if (n.includes('weight loss')) category = 'weight-loss';
    else if (n.includes('oldage') || n.includes('old age')) category = 'oldage';
    else if (n.includes(' it ') || n.includes('it pot') || n.includes('it menu')) category = 'it';
    else if (n.includes('diabetic')) category = 'diabetic';
    else if (n.includes('trial'))   category = 'trial';

    let tier = 'regular';
    if (n.includes('supreme')) tier = 'supreme';
    else if (n.includes('trial')) tier = 'trial';

    return { ...p, category, tier };
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
        .map(i => `<span class="ingredient-pill">${i}</span>`)
        .join('');

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

            <!-- Ingredients -->
            <div class="flex flex-wrap gap-1.5 mb-4">
                ${pills}
            </div>

            <!-- Spacer pushes price+btn to bottom -->
            <div class="flex-1"></div>

            <!-- Price + Add -->
            <div class="flex items-center justify-between mt-3 gap-3">
                <span class="price-tag">₹${p.price}</span>
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
    const parsed = allProducts.map(parseProduct);
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
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    // Use existing cart.js addToCart if available, else fallback
    if (typeof addToCart === 'function') {
        addToCart(product);
    } else {
        const cart  = JSON.parse(localStorage.getItem('proteinPotCart') || '[]');
        const idx   = cart.findIndex(i => i.id === id);
        if (idx > -1) { cart[idx].quantity++; }
        else          { cart.push({ ...product, quantity: 1, details: product.ingredients }); }
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
