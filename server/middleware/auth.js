const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pot-protein-jwt-secret-key-2026-secure';

/**
 * Authentication Middleware
 * Verifies JWT token from HTTP-Only cookie 'pot_token'
 */
function authenticateToken(req, res, next) {
    const token = req.cookies.pot_token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired session. Please sign in again.' });
        }

        req.user = user;
        next();
    });
}

/**
 * Optional Authentication Middleware
 * Attaches user to req.user if token is valid, but does not block request if missing
 */
function optionalAuth(req, res, next) {
    const token = req.cookies.pot_token;

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    optionalAuth,
    JWT_SECRET
};
