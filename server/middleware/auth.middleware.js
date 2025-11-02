// server/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes: Verifies the JWT token and attaches 
 * user data (id and role) to the request object.
 */
exports.protect = (req, res, next) => {
    let token;

    // 1. Check if the Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Attach decoded user info (id and role) to req.user
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            // Proceed to the next middleware or controller
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            // 401 Unauthorized: Token is invalid, expired, or corrupted
            return res.status(401).json({ message: 'Not authorized, token failed or expired.' });
        }
    }

    // 4. Handle case where no token is provided
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }
};

/**
 * Role-Based Access Control (RBAC) middleware: Checks if the verified 
 * user's role is 'Employee'. Must be used AFTER the protect middleware.
 */
exports.employee = (req, res, next) => {
    if (req.user && req.user.role === 'Employee') {
        next();
    } else {
        // 403 Forbidden: User is authenticated but lacks the necessary role
        res.status(403).json({ message: 'Access denied: Employee role required.' });
    }
};

/**
 * Role-Based Access Control (RBAC) middleware: Checks if the verified 
 * user's role is 'Admin'. Must be used AFTER the protect middleware.
 */
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        // 403 Forbidden: User is authenticated but lacks the necessary role
        res.status(403).json({ message: 'Access denied: Admin role required.' });
    }
};


/**
 * Middleware to allow EITHER Employee or Admin access.
 */
exports.employeeOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Employee' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Employee or Admin role required.' });
    }
};