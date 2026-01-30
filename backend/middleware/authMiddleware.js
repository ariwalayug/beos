import jwt from 'jsonwebtoken';
import { queueAuditLog } from '../queues/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ==========================================
// ROLE-BASED PERMISSIONS
// ==========================================
const ROLE_PERMISSIONS = {
    admin: ['*'], // Full access
    hospital: [
        'request:create',
        'request:read',
        'request:update:own',
        'request:cancel:own',
        'donor:read',
        'inventory:read',
        'analytics:read:own'
    ],
    blood_bank: [
        'inventory:create',
        'inventory:read',
        'inventory:update',
        'inventory:delete',
        'request:read',
        'request:fulfill',
        'batch:create',
        'batch:read',
        'batch:update'
    ],
    donor: [
        'request:respond',
        'profile:read:own',
        'profile:update:own',
        'donation:read:own'
    ],
    government: [
        'analytics:read',
        'request:read',
        'inventory:read',
        'donor:read:aggregate',
        'audit:read'
    ]
};

// Check if role has permission
function hasPermission(role, permission) {
    const perms = ROLE_PERMISSIONS[role] || [];

    // Admin has full access
    if (perms.includes('*')) return true;

    // Exact match
    if (perms.includes(permission)) return true;

    // Wildcard match (e.g., 'inventory:*' matches 'inventory:create')
    const [resource, action] = permission.split(':');
    if (perms.includes(`${resource}:*`)) return true;

    return false;
}

// ==========================================
// VERIFY TOKEN MIDDLEWARE
// ==========================================
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
};

// ==========================================
// OPTIONAL TOKEN (Guest Access)
// ==========================================
export const optionalVerifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// ==========================================
// ROLE AUTHORIZATION
// ==========================================
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required.' });
        }

        if (!roles.includes(req.user.role)) {
            // Log unauthorized access attempt
            queueAuditLog({
                user_id: req.user.id,
                action: 'unauthorized_access',
                entity_type: 'route',
                entity_id: null,
                ip_address: req.ip,
                metadata: {
                    path: req.path,
                    method: req.method,
                    required_roles: roles,
                    user_role: req.user.role
                }
            }).catch(() => { });

            return res.status(403).json({
                success: false,
                error: 'Access denied. Insufficient permissions.'
            });
        }
        next();
    };
};

// ==========================================
// PERMISSION-BASED AUTHORIZATION
// ==========================================
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required.' });
        }

        if (!hasPermission(req.user.role, permission)) {
            // Log unauthorized access attempt
            queueAuditLog({
                user_id: req.user.id,
                action: 'permission_denied',
                entity_type: 'route',
                entity_id: null,
                ip_address: req.ip,
                metadata: {
                    path: req.path,
                    method: req.method,
                    required_permission: permission,
                    user_role: req.user.role
                }
            }).catch(() => { });

            return res.status(403).json({
                success: false,
                error: `Access denied. Missing permission: ${permission}`
            });
        }
        next();
    };
};

// ==========================================
// OWNERSHIP CHECK
// ==========================================
export const checkOwnership = (getOwnerId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Authentication required.' });
        }

        // Admins bypass ownership check
        if (req.user.role === 'admin') {
            return next();
        }

        try {
            const ownerId = await getOwnerId(req);

            if (ownerId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only access your own resources.'
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Ownership check failed.' });
        }
    };
};

// ==========================================
// AUDIT LOG MIDDLEWARE
// ==========================================
export const auditLog = (action, entityType, getEntityId = () => null) => {
    return async (req, res, next) => {
        // Capture original response
        const originalJson = res.json.bind(res);

        res.json = async (data) => {
            // Log successful actions
            if (data.success !== false) {
                try {
                    const entityId = await getEntityId(req, data);

                    await queueAuditLog({
                        user_id: req.user?.id || null,
                        action,
                        entity_type: entityType,
                        entity_id: entityId,
                        ip_address: req.ip,
                        user_agent: req.get('User-Agent'),
                        metadata: {
                            method: req.method,
                            path: req.path,
                            body: sanitizeBody(req.body)
                        }
                    });
                } catch (error) {
                    console.error('Audit log failed:', error);
                }
            }

            return originalJson(data);
        };

        next();
    };
};

// Sanitize body for audit (remove sensitive data)
function sanitizeBody(body) {
    if (!body) return null;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'password_hash', 'token', 'secret'];

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
}

// ==========================================
// RATE LIMIT BY USER
// ==========================================
export const userRateLimit = (maxRequests, windowMs) => {
    const requests = new Map();

    return (req, res, next) => {
        const key = req.user?.id || req.ip;
        const now = Date.now();

        // Get or create request record
        let record = requests.get(key);
        if (!record || now - record.windowStart > windowMs) {
            record = { count: 0, windowStart: now };
            requests.set(key, record);
        }

        record.count++;

        if (record.count > maxRequests) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        next();
    };
};
