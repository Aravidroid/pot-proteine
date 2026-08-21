const DEFAULT_PRODUCT_IMAGE = 'assets/pot-placeholder.svg';

const gymMenuProducts = [

    // ===== SUPREME BOX (Price: 199) =====
    {
        id: '3',
        name: 'Supreme Weight Gain Pot',
        category: 'Supreme Box',
        image: 'menu/supreme-weight-gain-pot.webp',
        price: 199,
        protein: 26,
        calories: 540,
        isPopular: false,
        benefits: "Adds avocado and premium fruits to increase healthy fats, calorie density, and micronutrient variety.",
        plans: [
            { id: 'daily', name: 'Daily', duration: '1 Day', days: 1, price: 199, originalPrice: 199, savingsTag: '' },
            { id: 'weekly', name: '6-Day', duration: '6 Days/wk', days: 6, price: 1134, originalPrice: 1194, savingsTag: 'Save ₹60' },
            { id: 'monthly', name: '26-Day', duration: '26 Days/mo', days: 26, price: 4654, originalPrice: 5174, savingsTag: 'Save ₹520' }
        ],
        ingredients: [
            { name: 'Avocado', weight: '50g', macro: '1.2g protein' },
            { name: 'Dragon fruit', weight: '70g', macro: '1.4g protein' },
            { name: 'Kiwi', weight: '40g', macro: '0.8g protein' },
            { name: 'Rambutan', weight: '40g', macro: '0.5g protein' },
            { name: 'Green Apple', weight: '50g', macro: '0.3g protein' },
            { name: 'Banana', weight: '60g', macro: '1.2g protein' },
            { name: 'Pomegranate', weight: '40g', macro: '1.0g protein' },
            { name: 'Guava', weight: '50g', macro: '2.6g protein' },
            { name: 'Watermelon', weight: '60g', macro: '0.6g protein' },
            { name: 'Muskmelon', weight: '50g', macro: '0.5g protein' },
            { name: 'Dates', weight: '30g', macro: '1.8g protein' },
            { name: 'Almond & Cashews', weight: '35g', macro: '7.8g protein' },
            { name: 'Sunflower seeds', weight: '20g', macro: '4.2g protein' }
        ]
    },

    {
        id: '4',
        name: 'Supreme Weight Loss Pot',
        category: 'Supreme Box',
        image: 'menu/supreme-weight-loss-pot.webp',
        price: 199,
        protein: 20,
        calories: 340,
        isPopular: true,
        benefits: "Packed with premium fruits rich in fiber and antioxidants for a nutrient dense, lower calorie fruit Box meal.",
        plans: [
            { id: 'daily', name: 'Daily', duration: '1 Day', days: 1, price: 199, originalPrice: 199, savingsTag: '' },
            { id: 'weekly', name: '6-Day', duration: '6 Days/wk', days: 6, price: 1134, originalPrice: 1194, savingsTag: 'Save ₹60' },
            { id: 'monthly', name: '26-Day', duration: '26 Days/mo', days: 26, price: 4654, originalPrice: 5174, savingsTag: 'Save ₹520' }
        ],
        ingredients: [
            { name: 'Dragon fruit', weight: '80g', macro: '1.6g protein' },
            { name: 'Kiwi', weight: '45g', macro: '0.9g protein' },
            { name: 'Strawberry', weight: '40g', macro: '0.4g protein' },
            { name: 'Rambutan', weight: '35g', macro: '0.4g protein' },
            { name: 'Green Apple', weight: '50g', macro: '0.3g protein' },
            { name: 'Papaya', weight: '60g', macro: '0.5g protein' },
            { name: 'Guava', weight: '50g', macro: '2.6g protein' },
            { name: 'Cucumber', weight: '50g', macro: '0.4g protein' },
            { name: 'Pineapple', weight: '40g', macro: '0.3g protein' },
            { name: 'Muskmelon', weight: '50g', macro: '0.5g protein' },
            { name: 'Pear', weight: '40g', macro: '0.2g protein' },
            { name: 'Almond & Cashews', weight: '25g', macro: '5.5g protein' },
            { name: 'Sunflower seeds', weight: '20g', macro: '4.2g protein' }
        ]
    },

    // ===== REGULAR BOX (Price: 149) =====

    {
        id: '1',
        name: 'Regular Weight Gain Pot',
        category: 'Regular Box',
        image: 'menu/regular-weight-gain-pot.webp',
        price: 149,
        protein: 18,
        calories: 420,
        isPopular: true,
        benefits: "Higher energy fruits with dates and nuts provide more calories, healthy fats, and natural carbohydrates to support increased energy intake.",
        plans: [
            { id: 'daily', name: 'Daily', duration: '1 Day', days: 1, price: 149, originalPrice: 149, savingsTag: '' },
            { id: 'weekly', name: '6-Day', duration: '6 Days/wk', days: 6, price: 849, originalPrice: 894, savingsTag: 'Save ₹45' },
            { id: 'monthly', name: '26-Day', duration: '26 Days/mo', days: 26, price: 3499, originalPrice: 3874, savingsTag: 'Save ₹375' }
        ],
        ingredients: [
            { name: 'Green Apple', weight: '60g', macro: '0.3g protein' },
            { name: 'Banana', weight: '60g', macro: '1.2g protein' },
            { name: 'Guava', weight: '50g', macro: '2.6g protein' },
            { name: 'Pomegranate', weight: '40g', macro: '1.0g protein' },
            { name: 'Watermelon', weight: '60g', macro: '0.6g protein' },
            { name: 'Muskmelon', weight: '50g', macro: '0.5g protein' },
            { name: 'Dates', weight: '30g', macro: '1.8g protein' },
            { name: 'Almond & Cashews', weight: '25g', macro: '5.5g protein' },
            { name: 'Sunflower seeds', weight: '20g', macro: '4.2g protein' }
        ]
    },

    {
        id: '2',
        name: 'Regular Weight Loss Pot',
        category: 'Regular Box',
        image: 'menu/regular-weight-loss-pot.webp',
        price: 149,
        protein: 14,
        calories: 280,
        isPopular: true,
        benefits: "Lower calorie, high-fiber fruits and cucumber help increase meal volume while keeping calorie intake relatively lower.",
        plans: [
            { id: 'daily', name: 'Daily', duration: '1 Day', days: 1, price: 149, originalPrice: 149, savingsTag: '' },
            { id: 'weekly', name: '6-Day', duration: '6 Days/wk', days: 6, price: 849, originalPrice: 894, savingsTag: 'Save ₹45' },
            { id: 'monthly', name: '26-Day', duration: '26 Days/mo', days: 26, price: 3499, originalPrice: 3874, savingsTag: 'Save ₹375' }
        ],
        ingredients: [
            { name: 'Green Apple', weight: '60g', macro: '0.3g protein' },
            { name: 'Papaya', weight: '60g', macro: '0.5g protein' },
            { name: 'Guava', weight: '50g', macro: '2.6g protein' },
            { name: 'Cucumber', weight: '60g', macro: '0.4g protein' },
            { name: 'Pineapple', weight: '40g', macro: '0.3g protein' },
            { name: 'Muskmelon', weight: '50g', macro: '0.5g protein' },
            { name: 'Pear', weight: '40g', macro: '0.2g protein' },
            { name: 'Almond & Cashews', weight: '20g', macro: '4.5g protein' },
            { name: 'Sunflower seeds', weight: '20g', macro: '4.2g protein' }
        ]
    },

    // ===== HEALTHY WORKDAY BOX (Price: 69/day) =====
    {
        id: 'healthy-workday-menu',
        name: 'Healthy Workday Pot',
        category: 'Healthy Workday',
        image: 'menu/healthy-workday-pot.webp',
        price: 69,
        protein: 15,
        calories: 310,
        isPopular: true,
        plans: [
            { id: 'daily', name: 'Daily', duration: '1 Day', days: 1, price: 69, originalPrice: 69, savingsTag: '' },
            { id: 'weekly', name: '6-Day', duration: '6 Days/wk', days: 6, price: 399, originalPrice: 414, savingsTag: 'Save ₹15' },
            { id: 'monthly', name: '26-Day', duration: '26 Days/mo', days: 26, price: 1699, originalPrice: 1794, savingsTag: 'Save ₹95' }
        ],
        benefits: "A convenient daily fruit Box for working professionals and students, providing a variety of fruits to help increase daily intake of vitamins, minerals, and dietary fiber.",
        ingredients: [
            { name: 'Dragon fruit (Fixed)', weight: '60g', macro: '1.2g protein' },
            { name: 'Kiwi (Fixed)', weight: '35g', macro: '0.7g protein' },
            { name: 'Strawberry (Fixed)', weight: '30g', macro: '0.3g protein' },
            { name: 'Apple', weight: '50g', macro: '0.3g protein' },
            { name: 'Orange', weight: '50g', macro: '0.6g protein' },
            { name: 'Guava', weight: '40g', macro: '2.1g protein' },
            { name: 'Papaya', weight: '50g', macro: '0.4g protein' },
            { name: 'Watermelon', weight: '50g', macro: '0.5g protein' },
            { name: 'Muskmelon', weight: '40g', macro: '0.4g protein' },
            { name: 'Pomegranate', weight: '35g', macro: '0.9g protein' },
            { name: 'Pineapple', weight: '35g', macro: '0.3g protein' },
            { name: 'Pear', weight: '35g', macro: '0.2g protein' }
        ]
    },

    // ===== DIABETIC BOX (Price: 69) =====
    {
        id: '5',
        name: 'Diabetic Menu Pot',
        category: 'Diabetic Box',
        image: 'menu/diabetic-menu-pot.webp',
        price: 69,
        protein: 16,
        calories: 240,
        isPopular: false,
        benefits: "Features fruits and vegetables selected for a relatively lower glycemic impact, making it a more blood sugar–conscious fruit option when eaten in appropriate portions.",
        plans: [
            { id: 'daily', name: 'Daily', duration: '1 Day', days: 1, price: 69, originalPrice: 69, savingsTag: '' },
            { id: 'weekly', name: '6-Day', duration: '6 Days/wk', days: 6, price: 399, originalPrice: 414, savingsTag: 'Save ₹15' },
            { id: 'monthly', name: '26-Day', duration: '26 Days/mo', days: 26, price: 1699, originalPrice: 1794, savingsTag: 'Save ₹95' }
        ],
        ingredients: [
            { name: 'Raspberry', weight: '50g', macro: '1.2g protein' },
            { name: 'Avocado', weight: '50g', macro: '1.0g protein' },
            { name: 'Dragon fruit', weight: '80g', macro: '1.6g protein' },
            { name: 'Strawberry', weight: '40g', macro: '0.4g protein' },
            { name: 'Pomelo', weight: '50g', macro: '0.6g protein' },
            { name: 'Cucumber', weight: '40g', macro: '0.3g protein' },
            { name: 'Kiwi', weight: '30g', macro: '0.6g protein' },
            { name: 'Almond & Seeds', weight: '25g', macro: '5.8g protein' }
        ]
    }
];

const allProducts = gymMenuProducts;

// Data Normalization & Default Plan Duration Assignment
gymMenuProducts.forEach(product => {
    product.image = product.image || DEFAULT_PRODUCT_IMAGE;
    product.protein = Number(product.protein || 0);
    product.calories = Number(product.calories || 0);
    product.ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];

    // Ensure every Pot has Daily, Weekly, and Monthly plan duration options
    if (!product.plans || product.plans.length === 0) {
        const base = Number(product.price || 0);
        product.plans = [
            { id: 'daily', name: 'Daily Pack', duration: '1 Day', days: 1, price: base },
            { id: 'weekly', name: 'Weekly Pack', duration: '6 Days/wk', days: 6, price: base * 6 },
            { id: 'monthly', name: 'Monthly Pack', duration: '26 Days/mo', days: 26, price: base * 26 }
        ];
    }
});


// Helper function to get featured products
function getFeaturedProducts(limit = 3) {
    return gymMenuProducts.filter(p => p.isPopular).slice(0, limit);
}

// Helper function to get product by ID
function getProductById(id) {
    return gymMenuProducts.find(p => p.id === String(id));
}

// Helper to check if customer is eligible for First-Order Supreme Box Offer (₹119)
function isFirstOrderEligible() {
    if (!window.currentUser) return false; // Must be logged in to use the offer
    return window.currentUser.is_first_order !== false;
}

// Helper to calculate effective price considering Supreme Box First-Order Offer (₹119 instead of ₹199)
function getProductEffectivePrice(product, planId = 'daily') {
    if (!product) return 0;
    const isSupreme = String(product.id) === '3' || String(product.id) === '4';
    if (isSupreme && planId === 'daily' && isFirstOrderEligible()) {
        return 119;
    }
    const base = Number(product.price || 199);
    if (planId === 'weekly') return base * 6;
    if (planId === 'monthly') return base * 26;
    return base;
}