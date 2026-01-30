import db from '../database/pg.js';

// ==========================================
// AUDIT LOG MODEL
// ==========================================
class AuditLog {
    // Create audit entry (use queue in production)
    static async create(logData) {
        const {
            user_id,
            action,
            entity_type,
            entity_id,
            ip_address,
            user_agent,
            changes,
            metadata
        } = logData;

        const result = await db.run(`
            INSERT INTO audit_logs (
                user_id, action, entity_type, entity_id, 
                ip_address, user_agent, changes, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [
            user_id,
            action,
            entity_type,
            entity_id,
            ip_address,
            user_agent,
            changes ? JSON.stringify(changes) : null,
            metadata ? JSON.stringify(metadata) : null
        ]);

        return result.rows[0];
    }

    // Get logs for a specific entity
    static async getByEntity(entityType, entityId, limit = 50) {
        return await db.query(`
            SELECT al.*, u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.entity_type = $1 AND al.entity_id = $2
            ORDER BY al.created_at DESC
            LIMIT $3
        `, [entityType, entityId, limit]);
    }

    // Get logs for a specific user
    static async getByUser(userId, limit = 100) {
        return await db.query(`
            SELECT * FROM audit_logs
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `, [userId, limit]);
    }

    // Get recent activity (admin dashboard)
    static async getRecent(limit = 100) {
        return await db.query(`
            SELECT al.*, u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT $1
        `, [limit]);
    }

    // Get security events (failed logins, permission denials)
    static async getSecurityEvents(limit = 100) {
        return await db.query(`
            SELECT al.*, u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE al.action IN ('login_failed', 'unauthorized_access', 'permission_denied', 'invalid_token')
            ORDER BY al.created_at DESC
            LIMIT $1
        `, [limit]);
    }

    // Search logs
    static async search(filters, limit = 100) {
        let query = `
            SELECT al.*, u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.action) {
            query += ` AND al.action = $${paramIndex++}`;
            params.push(filters.action);
        }

        if (filters.entity_type) {
            query += ` AND al.entity_type = $${paramIndex++}`;
            params.push(filters.entity_type);
        }

        if (filters.user_id) {
            query += ` AND al.user_id = $${paramIndex++}`;
            params.push(filters.user_id);
        }

        if (filters.from_date) {
            query += ` AND al.created_at >= $${paramIndex++}`;
            params.push(filters.from_date);
        }

        if (filters.to_date) {
            query += ` AND al.created_at <= $${paramIndex++}`;
            params.push(filters.to_date);
        }

        query += ` ORDER BY al.created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);

        return await db.query(query, params);
    }

    // Get stats for dashboard
    static async getStats(days = 7) {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN action = 'login' THEN 1 END) as logins,
                COUNT(CASE WHEN action = 'request:create' THEN 1 END) as requests_created,
                COUNT(CASE WHEN action LIKE 'unauthorized%' OR action = 'permission_denied' THEN 1 END) as security_events
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${days} days'
        `);

        const dailyActivity = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);

        return {
            ...stats,
            dailyActivity
        };
    }

    // Cleanup old logs (GDPR compliance)
    static async cleanup(retentionDays = 365) {
        const result = await db.run(`
            DELETE FROM audit_logs
            WHERE created_at < NOW() - INTERVAL '${retentionDays} days'
        `);

        return { deleted: result.changes };
    }
}

export default AuditLog;
