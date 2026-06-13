const DEFAULT_PRODUCT_IMAGE = 'assets/pot-placeholder.svg';

const allProducts = [

    // ===== TRIAL BOX =====

    {
        id: '1',
        name: 'Trial Weight Gain Pot',
        image: 'menu/trial-weight-gain-pot.png',
        protein: 12,
        price: 119,
        ingredients: [
            'Banana',
            'Apple',
            'Orange',
            'Guava',
            'Watermelon',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '2',
        name: 'Trial Weight Loss Pot',
        image: 'menu/trial-weight-loss-pot.png',
        protein: 10,
        price: 119,
        ingredients: [
            'Apple',
            'Orange',
            'Guava',
            'Papaya',
            'Cucumber',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '3',
        name: 'Trial Oldage Home Pot',
        image: 'menu/trial-oldage-home-pot.png',
        protein: 8,
        price: 119,
        ingredients: [
            'Apple',
            'Guava',
            'Pomegranate',
            'Papaya',
            'Banana',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '4',
        name: 'Trial Diabetic Pot',
        image: 'menu/trial-diabetic-pot.png',
        protein: 11,
        price: 119,
        ingredients: [
            'Apple',
            'Guava',
            'Orange',
            'Pomegranate',
            'Pear',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '5',
        name: 'Trial IT Menu Pot',
        image: 'menu/trial-it-menu-pot.png',
        protein: 12,
        price: 119,
        ingredients: [
            'Apple',
            'Watermelon',
            'Cucumber',
            'Orange',
            'Muskmelon',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    // ===== REGULAR =====

    {
        id: '6',
        name: 'Regular Weight Gain Pot',
        image: 'menu/regular-weight-gain-pot.png',
        protein: 12,
        price: 149,
        ingredients: [
            'Banana',
            'Apple',
            'Orange',
            'Guava',
            'Dates',
            'Watermelon',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '7',
        name: 'Regular Weight Loss Pot',
        image: 'menu/regular-weight-loss-pot.png',
        protein: 10,
        price: 149,
        ingredients: [
            'Apple',
            'Orange',
            'Guava',
            'Papaya',
            'Cucumber',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '10',
        name: 'Regular Oldage Home Pot',
        image: 'menu/regular-oldage-home-pot.png',
        protein: 3,
        price: 149,
        ingredients: [
            'Apple',
            'Guava',
            'Pomegranate',
            'Banana',
            'Pear',
            'Papaya',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '12',
        name: 'Regular IT Pot',
        image: 'menu/regular-it-pot.png',
        protein: 3,
        price: 149,
        ingredients: [
            'Apple',
            'Watermelon',
            'Cucumber',
            'Orange',
            'Papaya',
            'Muskmelon',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    {
        id: '14',
        name: 'Regular Diabetic Pot',
        image: 'menu/regular-diabetic-pot.png',
        protein: 3,
        price: 149,
        ingredients: [
            'Apple',
            'Guava',
            'Cucumber',
            'Orange',
            'Pomegranate',
            'Pear',
            'Almonds',
            'Sunflower Seeds'
        ]
    },

    // ===== SUPREME =====

    {
        id: '8',
        name: 'Supreme Weight Gain Pot',
        image: 'menu/supreme-weight-gain-pot.png',
        protein: 14,
        price: 199,
        ingredients: [
            'Avocado',
            'Pomegranate',
            'Kiwi',
            'Strawberry',
            'Lychee',
            'Watermelon',
            'Pear',
            'Almonds',
            'Cashews',
            'Sunflower Seeds'
        ]
    },

    {
        id: '9',
        name: 'Supreme Weight Loss Pot',
        image: 'menu/supreme-weight-loss-pot.png',
        protein: 12,
        price: 199,
        ingredients: [
            'Avocado',
            'Kiwi',
            'Strawberry',
            'Lychee',
            'Papaya',
            'Watermelon',
            'Almonds',
            'Cashews',
            'Sunflower Seeds'
        ]
    },

    {
        id: '11',
        name: 'Supreme Oldage Home Pot',
        image: 'menu/supreme-oldage-home-pot.png',
        protein: 4,
        price: 199,
        ingredients: [
            'Avocado',
            'Kiwi',
            'Pear',
            'Dragon Fruit',
            'Apple',
            'Water Apple',
            'Almonds',
            'Cashews',
            'Sunflower Seeds'
        ]
    },

    {
        id: '13',
        name: 'Supreme IT Pot',
        image: 'menu/supreme-it-pot.png',
        protein: 4,
        price: 199,
        ingredients: [
            'Dragon Fruit',
            'Strawberry',
            'Kiwi',
            'Watermelon',
            'Water Apple',
            'Orange',
            'Almonds',
            'Cashews',
            'Sunflower Seeds'
        ]
    },

    {
        id: '15',
        name: 'Supreme Diabetic Pot',
        image: 'menu/supreme-diabetic-pot.png',
        protein: 4,
        price: 199,
        ingredients: [
            'Avocado',
            'Kiwi',
            'Strawberry',
            'Pomegranate',
            'Apple',
            'Cucumber',
            'Blueberry',
            'Almonds',
            'Cashews',
            'Sunflower Seeds'
        ]
    }
];

allProducts.forEach(product => {
    product.image = product.image || DEFAULT_PRODUCT_IMAGE;
    product.protein = Number(product.protein || 0);
    product.calories = Number(product.calories || 0);
    product.ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
});

const customizationData = {
    fruits: [
        { id: 'honey', name: 'Honey', price: 15, protein: 0.3, calories: 64, icon: '🍯' },
        { id: 'dates', name: 'Dates', price: 25, protein: 1.8, calories: 66, icon: '📅' },
        { id: 'plum', name: 'Plum', price: 20, protein: 0.5, calories: 30, icon: '🟣' },
        { id: 'jamun', name: 'Jamun', price: 20, protein: 0.7, calories: 35, icon: '🍇' }
    ]
};

// Helper function to get featured products
function getFeaturedProducts() {
    return allProducts.filter(p => p.isPopular).slice(0, 3);
}

// Helper function to get product by ID
function getProductById(id) {
    return allProducts.find(p => p.id === id);
}