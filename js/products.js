const DEFAULT_PRODUCT_IMAGE = 'assets/pot-placeholder.svg';

const gymMenuProducts = [

    // ===== REGULAR BOX (Price: 149) =====

    {
        id: '1',
        name: 'Regular Weight Gain Pot',
        category: 'Regular Box',
        image: 'menu/regular-weight-gain-pot.png',
        price: 149,
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
        image: 'menu/regular-weight-loss-pot.png',
        price: 149,
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

    // ===== SUPREME BOX (Price: 199) =====
    {
        id: '3',
        name: 'Supreme Weight Gain Pot',
        category: 'Supreme Box',
        image: 'menu/supreme-weight-gain-pot.png',
        price: 199,
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
        image: 'menu/supreme-weight-loss-pot.png',
        price: 199,
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

    // ===== HEALTHY WORKDAY BOX (Price: 69/day) =====
    {
        id: 'healthy-workday-menu',
        name: 'Healthy Workday Pot',
        category: 'Healthy Workday',
        image: 'menu/healthy-workday-pot.png',
        price: 69,
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
        image: 'menu/diabetic-menu-pot.png',
        price: 69,
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

// Delivery and Pricing Policy Notes from Menu
const deliveryPolicy = {
    inclusiveDelivery: true,
    gymBulkDiscount: "If 5 orders at the same gym, there will be no delivery charges.",
    distanceSurcharge: "Above 10 KM - delivery fee will be recharged."
};

// Data Normalization
gymMenuProducts.forEach(product => {
    product.image = product.image || DEFAULT_PRODUCT_IMAGE;
    product.protein = Number(product.protein || 0);
    product.calories = Number(product.calories || 0);
    product.ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
});


// Helper function to get featured products
function getFeaturedProducts(limit = 3) {
    return gymMenuProducts.filter(p => p.isPopular).slice(0, limit);
}

// Helper function to get product by ID
function getProductById(id) {
    return gymMenuProducts.find(p => p.id === String(id));
}