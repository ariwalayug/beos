import db from '../database/db.js';

class BloodRequest {
    static getAll(filters = {}) {
        let query = `
            SELECT br.*, h.name as hospital_name, h.city as hospital_city
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.status) {
            query += ' AND br.status = ?';
            params.push(filters.status);
        }

        if (filters.urgency) {
            query += ' AND br.urgency = ?';
            params.push(filters.urgency);
        }

        if (filters.blood_type) {
            query += ' AND br.blood_type = ?';
            params.push(filters.blood_type);
        }

        if (filters.hospital_id) {
            query += ' AND br.hospital_id = ?';
            params.push(filters.hospital_id);
        }

        // Order by urgency (critical first) and then by date
        query += ` ORDER BY 
            CASE br.urgency 
                WHEN 'critical' THEN 1 
                WHEN 'urgent' THEN 2 
                ELSE 3 
            END,
            br.created_at DESC
        `;

        return db.prepare(query).all(...params);
    }

    static getById(id) {
        return db.prepare(`
            SELECT br.*, h.name as hospital_name, h.city as hospital_city, h.phone as hospital_phone
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.id = ?
        `).get(id);
    }

    static getPending() {
        return this.getAll({ status: 'pending' });
    }

    static getCritical() {
        return db.prepare(`
            SELECT br.*, h.name as hospital_name, h.city as hospital_city
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.status = 'pending' AND br.urgency = 'critical'
            ORDER BY br.created_at ASC
        `).all();
    }

    static getHistory(donorId) {
        return db.prepare(`
            SELECT br.*, h.name as hospital_name, h.city as hospital_city
            FROM blood_requests br
            LEFT JOIN hospitals h ON br.hospital_id = h.id
            WHERE br.donor_id = ? AND br.status = 'fulfilled'
            ORDER BY br.fulfilled_at DESC
        `).all(donorId);
    }

    static create(request) {
        const stmt = db.prepare(`
            INSERT INTO blood_requests (
                hospital_id, patient_name, age, gender, hemoglobin, platelets, 
                blood_type, units, component_type, urgency, is_critical, 
                diagnosis, past_reaction, allergies, doctor_name, 
                status, contact_phone, notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            request.hospital_id || null,
            request.patient_name || null,
            request.age || null,
            request.gender || null,
            request.hemoglobin || null,
            request.platelets || null,
            request.blood_type,
            request.units || 1,
            request.component_type || 'Whole Blood',
            request.urgency || 'normal',
            request.is_critical ? 1 : 0,
            request.diagnosis || null,
            request.past_reaction || null,
            request.allergies || null,
            request.doctor_name || null,
            request.status || 'pending',
            request.contact_phone || null,
            request.notes || null
        );

        return this.getById(result.lastInsertRowid);
    }

    static update(id, request) {
        const fields = [];
        const params = [];

        if (request.hospital_id !== undefined) { fields.push('hospital_id = ?'); params.push(request.hospital_id); }
        if (request.patient_name !== undefined) { fields.push('patient_name = ?'); params.push(request.patient_name); }
        if (request.age !== undefined) { fields.push('age = ?'); params.push(request.age); }
        if (request.hemoglobin !== undefined) { fields.push('hemoglobin = ?'); params.push(request.hemoglobin); }
        if (request.platelets !== undefined) { fields.push('platelets = ?'); params.push(request.platelets); }
        if (request.blood_type) { fields.push('blood_type = ?'); params.push(request.blood_type); }
        if (request.units) { fields.push('units = ?'); params.push(request.units); }
        if (request.urgency) { fields.push('urgency = ?'); params.push(request.urgency); }
        if (request.past_reaction !== undefined) { fields.push('past_reaction = ?'); params.push(request.past_reaction); }
        if (request.status) {
            fields.push('status = ?');
            params.push(request.status);
            if (request.status === 'fulfilled') {
                fields.push('fulfilled_at = CURRENT_TIMESTAMP');
            }
        }
        if (request.contact_phone !== undefined) { fields.push('contact_phone = ?'); params.push(request.contact_phone); }
        if (request.notes !== undefined) { fields.push('notes = ?'); params.push(request.notes); }
        if (request.gender !== undefined) { fields.push('gender = ?'); params.push(request.gender); }
        if (request.doctor_name !== undefined) { fields.push('doctor_name = ?'); params.push(request.doctor_name); }
        if (request.component_type !== undefined) { fields.push('component_type = ?'); params.push(request.component_type); }
        if (request.diagnosis !== undefined) { fields.push('diagnosis = ?'); params.push(request.diagnosis); }
        if (request.allergies !== undefined) { fields.push('allergies = ?'); params.push(request.allergies); }
        if (request.is_critical !== undefined) { fields.push('is_critical = ?'); params.push(request.is_critical ? 1 : 0); }
        if (request.donor_id !== undefined) { fields.push('donor_id = ?'); params.push(request.donor_id); }

        if (fields.length === 0) return this.getById(id);

        params.push(id);
        db.prepare(`UPDATE blood_requests SET ${fields.join(', ')} WHERE id = ?`).run(...params);

        return this.getById(id);
    }

    static fulfill(id) {
        return this.update(id, { status: 'fulfilled' });
    }

    static cancel(id) {
        return this.update(id, { status: 'cancelled' });
    }

    static delete(id) {
        return db.prepare('DELETE FROM blood_requests WHERE id = ?').run(id);
    }

    static getStats() {
        const total = db.prepare('SELECT COUNT(*) as count FROM blood_requests').get();
        const pending = db.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'pending'").get();
        const fulfilled = db.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'fulfilled'").get();
        const critical = db.prepare("SELECT COUNT(*) as count FROM blood_requests WHERE status = 'pending' AND urgency = 'critical'").get();

        const byBloodType = db.prepare(`
            SELECT blood_type, COUNT(*) as count
            FROM blood_requests
            WHERE status = 'pending'
            GROUP BY blood_type
        `).all();

        return {
            total: total.count,
            pending: pending.count,
            fulfilled: fulfilled.count,
            critical: critical.count,
            byBloodType: byBloodType.reduce((acc, item) => {
                acc[item.blood_type] = item.count;
                return acc;
            }, {})
        };
    }
}

export default BloodRequest;
