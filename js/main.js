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

    // Setup subtle scroll-based transform for featured hero image
    const featuredImg = document.querySelector('.featured-Box-img');
    if (featuredImg) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    if (scrollY < 900) {
                        featuredImg.style.transform = `translateY(${scrollY * 0.08}px)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
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
        htmlBuilder += `
            <div class="featured-item">
                <div class="featured-icon">
                    <img src="${product.image || DEFAULT_PRODUCT_IMAGE}" alt="${product.name}">
                </div>
                <div class="featured-content">
                    <h3 class="featured-name">${product.name}</h3>
                    <p class="featured-desc">${product.description || product.ingredients.map(i => typeof i === 'object' && i !== null ? i.name : i).join(', ')}</p>
                    <div class="nutrition-grid">
                        <div class="nutrition-item nutrition-protein">
                            <span class="nutrition-value">${product.protein}g</span>
                            <span class="nutrition-label">Protein</span>
                        </div>
                        <div class="nutrition-item nutrition-calories">
                            <span class="nutrition-value">${product.calories}</span>
                            <span class="nutrition-label">Cal</span>
                        </div>
                        <div class="nutrition-item nutrition-price">
                            <span class="nutrition-value">₹${product.price}</span>
                            <span class="nutrition-label">Price</span>
                        </div>
                    </div>
                    <button class="add-to-cart-btn w-full text-white py-2 rounded-lg font-semibold transition btn-featured-add-to-cart" data-product-id="${product.id}">
                        Add to Cart
                    </button>
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
