// Protein Pot - Main Application Script
// Handles: page initialization, featured products display, and utility functions

// Cache DOM elements
const appDOM = {
    featuredProductsContainer: null,
    mobileMenuBtn: null,
    mobileMenu: null
};

/**
 * Initialize DOM cache
 */
function initializeAppDOM() {
    appDOM.featuredProductsContainer = document.getElementById('featured-products');
    appDOM.mobileMenuBtn = document.getElementById('mobile-menu-btn');
    appDOM.mobileMenu = document.getElementById('mobile-menu');
}

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM cache
    initializeAppDOM();

    // Load featured products on home page
    if (appDOM.featuredProductsContainer) {
        loadFeaturedProducts();
    }

    // Setup mobile menu toggle with smooth slide-down animation
    if (appDOM.mobileMenuBtn && appDOM.mobileMenu) {
        const iconOpen = document.getElementById('menu-icon-open');
        const iconClose = document.getElementById('menu-icon-close');

        const toggleMenu = (show) => {
            const isOpen = show !== undefined ? show : !appDOM.mobileMenu.classList.contains('is-open');
            if (isOpen) {
                appDOM.mobileMenu.classList.remove('hidden');
                // Trigger reflow to ensure CSS max-height transition runs smoothly
                void appDOM.mobileMenu.offsetWidth;
                appDOM.mobileMenu.classList.add('is-open');
                appDOM.mobileMenuBtn.setAttribute('aria-expanded', 'true');
                if (iconOpen) iconOpen.classList.add('hidden');
                if (iconClose) iconClose.classList.remove('hidden');
            } else {
                appDOM.mobileMenu.classList.remove('is-open');
                appDOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
                if (iconOpen) iconOpen.classList.remove('hidden');
                if (iconClose) iconClose.classList.add('hidden');
                setTimeout(() => {
                    if (!appDOM.mobileMenu.classList.contains('is-open')) {
                        appDOM.mobileMenu.classList.add('hidden');
                    }
                }, 350);
            }
        };

        appDOM.mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close mobile menu when a link is clicked
        const mobileMenuLinks = appDOM.mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleMenu(false);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (appDOM.mobileMenu.classList.contains('is-open') &&
                !appDOM.mobileMenu.contains(e.target) &&
                !appDOM.mobileMenuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        });
    }
});

/**
 * Load and display featured products
 */
function loadFeaturedProducts() {
    if (!appDOM.featuredProductsContainer) return;

    const featured = getFeaturedProducts();
    
    // Build HTML string at once
    let htmlBuilder = '';
    
    featured.forEach(product => {
        const effectivePrice = typeof getProductEffectivePrice === 'function' ? getProductEffectivePrice(product) : product.price;
        const isDiscounted = effectivePrice < product.price;
        const priceHTML = isDiscounted
            ? `<div class="flex items-center gap-1">
                <span class="line-through text-gray-400 text-xs font-semibold">₹${product.price}</span>
                <span class="nutrition-value text-[#7a1c6a] font-extrabold">₹${effectivePrice}</span>
               </div>`
            : `<span class="nutrition-value">₹${product.price}</span>`;

        const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
        const top3Pills = ingredients.slice(0, 3).map(i => {
            const name = typeof i === 'object' && i !== null ? i.name : i;
            return `<span class="ingredient-pill">${name}</span>`;
        }).join('');

        htmlBuilder += `
            <div class="featured-item">
                <div class="featured-icon">
                    <img src="${product.image || DEFAULT_PRODUCT_IMAGE}" alt="${product.name}">
                </div>
                <div class="featured-content">
                    <h3 class="featured-name">${product.name}</h3>
                    <div class="macro-strip my-2">
                        <span class="macro-item macro-protein">💪 ${product.protein}g Protein</span>
                        <span class="macro-divider"></span>
                        <span class="macro-item macro-cal">🔥 ${product.calories} kcal</span>
                    </div>
                    <div class="ingredient-pills-row mb-3">
                        ${top3Pills}
                    </div>
                    <div class="flex items-center justify-between mt-auto pt-2 border-t border-pink-100 gap-2">
                        <div>
                            ${priceHTML}
                        </div>
                        <button class="add-to-cart-btn btn-tactile-add !w-auto !py-2 !px-4 text-xs font-bold" data-product-id="${product.id}">
                            ＋ Add
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    // Assign HTML once
    appDOM.featuredProductsContainer.innerHTML = htmlBuilder;

    // Attach event listeners to add to cart buttons
    document.querySelectorAll('#featured-products .add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.productId;
            const product = getProductById(productId);
            if (product) {
                addToCart(product);
            }
        });
    });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const phone = document.getElementById("contact-phone").value;
    const message = document.getElementById("contact-message").value;

    const whatsappMessage = `Hello Protein Pot 👋

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);

    const whatsappNumber = "917871974777";

    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    this.reset();
    });
}
