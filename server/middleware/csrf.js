/**
 * CSRF & Origin Validation Middleware
 * Protects state-changing API endpoints (POST, PUT, PATCH, DELETE) against cross-site request forgery.
 * Allows local development origins (localhost / 127.0.0.1 Live Server) & ALLOWED_ORIGINS.
 */

function csrfOriginProtection(req, res, next) {
    // Only check state-changing HTTP methods
    const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!stateChangingMethods.includes(req.method.toUpperCase())) {
        return next();
    }

    const host = req.headers.host;
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const secFetchSite = req.headers['sec-fetch-site'];

    // Allowed origins configured in environment variables
    const rawAllowedOrigins = process.env.ALLOWED_ORIGINS || '';
    const allowedOrigins = rawAllowedOrigins
        .split(',')
        .map(o => o.trim().toLowerCase())
        .filter(Boolean);

    /**
     * Check if a given origin/referer matches local host or allowed origins
     */
    function isAllowedUrl(urlString) {
        if (!urlString) return false;
        try {
            const url = new URL(urlString);
            const targetHost = url.host.toLowerCase();
            const targetOrigin = url.origin.toLowerCase();
            const targetHostname = url.hostname.toLowerCase();

            // 1. Same-origin match with current Host header
            if (host && targetHost === host.toLowerCase()) {
                return true;
            }

            // 2. Allow local dev origins (localhost / 127.0.0.1 / Live Server ports) in development
            if (process.env.NODE_ENV !== 'production' && !process.env.CSRF_STRICT) {
                if (targetHostname === 'localhost' || targetHostname === '127.0.0.1') {
                    return true;
                }
            }

            // 3. Explicitly allowed origin match from environment variables
            if (allowedOrigins.includes(targetOrigin) || allowedOrigins.includes(targetHost)) {
                return true;
            }

            return false;
        } catch (e) {
            return false; // Malformed URL
        }
    }

    // 1. Validate Origin header if present
    if (origin) {
        if (isAllowedUrl(origin)) {
            return next();
        }
        console.warn(`[CSRF Protection] Rejected request with invalid Origin: ${origin}`);
        return res.status(403).json({ success: false, message: 'Forbidden: Request origin not allowed.' });
    }

    // 2. Fallback to Referer header if Origin is absent
    if (referer) {
        if (isAllowedUrl(referer)) {
            return next();
        }
        console.warn(`[CSRF Protection] Rejected request with invalid Referer: ${referer}`);
        return res.status(403).json({ success: false, message: 'Forbidden: Request referer not allowed.' });
    }

    // 3. Fallback for missing Origin & Referer
    if (secFetchSite) {
        if (secFetchSite === 'same-origin' || secFetchSite === 'none') {
            return next();
        }
        if (secFetchSite === 'cross-site') {
            console.warn('[CSRF Protection] Rejected cross-site request with missing origin headers.');
            return res.status(403).json({ success: false, message: 'Forbidden: Cross-site request rejected.' });
        }
    }

    // In development mode, allow tool requests with missing origin headers (curl/postman)
    if (process.env.NODE_ENV !== 'production' && !process.env.CSRF_STRICT) {
        return next();
    }

    // Default reject if headers are missing in production mode
    console.warn('[CSRF Protection] Rejected request missing Origin/Referer headers.');
    return res.status(403).json({ success: false, message: 'Forbidden: Origin verification header missing.' });
}

module.exports = csrfOriginProtection;
