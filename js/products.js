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
        ingredients: [
            'Avocado',
            'Dragon fruit',
            'Rambutan',
            'Kiwi',
            'Green Apple',
            'Banana',
            'Guava',
            'Pomegranate',
            'Watermelon',
            'Muskmelon',
            'Dates',
            'Sunflower seeds',
            'Almond',
            'Cashews'
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
        ingredients: [
            'Dragon fruit',
            'Kiwi',
            'Rambutan',
            'Strawberry',
            'Green Apple',
            'Papaya',
            'Guava',
            'Cucumber',
            'Pineapple',
            'Muskmelon',
            'Pear',
            'Sunflower seeds',
            'Almond',
            'Cashews'
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
        ingredients: [
            'Green Apple',
            'Banana',
            'Guava',
            'Pomegranate',
            'Watermelon',
            'Muskmelon',
            'Dates',
            'Sunflower seeds',
            'Almond',
            'Cashews'
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
        ingredients: [
            'Green Apple',
            'Papaya',
            'Guava',
            'Cucumber',
            'Pineapple',
            'Muskmelon',
            'Pear',
            'Sunflower seeds',
            'Almond',
            'Cashews'
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
            { id: 'daily', name: 'Daily Pack', duration: '1 Day', days: 1, price: 69 },
            { id: 'weekly', name: 'Weekly Pack', duration: '6 Days/wk', days: 6, price: 414 },
            { id: 'monthly', name: 'Monthly Pack', duration: '26 Days/mo', days: 26, price: 1794 }
        ],
        benefits: "A convenient daily fruit Box for working professionals and students, providing a variety of fruits to help increase daily intake of vitamins, minerals, and dietary fiber.",
        ingredients: [
            'Apple',
            'Orange',
            'Guava',
            'Papaya',
            'Watermelon',
            'Muskmelon',
            'Pineapple',
            'Pear',
            'Pomegranate',
            'Dragon fruit (Fixed)',
            'Kiwi (Fixed)',
            'Strawberry (Fixed)'
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
        ingredients: [
            {
                name: 'Raspberry',
                weight: '50gm',
                macro: '4gm'
            },
            {
                name: 'Avocado',
                weight: '50gm',
                macro: '0.7gm'
            },
            {
                name: 'Dragon fruit',
                weight: '80gm',
                macro: '8gm'
            },
            {
                name: 'Strawberry',
                weight: '40gm',
                macro: '5gm'
            },
            {
                name: 'Pomelo',
                weight: '50gm',
                macro: '6gm'
            },
            {
                name: 'Cucumber',
                weight: '40gm',
                macro: '2gm'
            },
            {
                name: 'Kiwi',
                weight: '30gm',
                macro: '9gm'
            }
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
    if (!window.currentUser) return true; // Guest visitors are eligible for first order
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