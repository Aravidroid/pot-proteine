require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const csrfOriginProtection = require('../server/middleware/csrf');
const authRoutes = require('../server/routes/auth');
const orderRoutes = require('../server/routes/orders');

const app = express();

// Security Middlewares
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(cors({
    origin: true,
    credentials: true // Crucial for HTTP-Only Cookie transmission
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Global CSRF / Origin Protection on API endpoints
app.use('/api', csrfOriginProtection);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for non-API routes if requested
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    next();
});

// Start Server in Local Environment
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`[Express Backend] Running on http://localhost:${PORT}`);
    });
}

// Export for Vercel Serverless
module.exports = app;
