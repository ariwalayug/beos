import Donor from '../models/Donor.js';

class NotificationService {
    static sendPush(userId, title, message) {
        // Mock Push Notification
        console.log(`[PUSH] To User ${userId}: ${title} - ${message}`);
        // Integration with FCM/OneSignal would go here
    }

    static sendSMS(phone, message) {
        // Mock SMS
        console.log(`[SMS] To ${phone}: ${message}`);
        // Integration with Twilio/SNS would go here
    }

    static async broadcastCritical(request) {
        console.log(`[ALERT] Processing Critical Request #${request.id}`);

        // 1. Find all matching donors
        const donors = Donor.findMatches({
            blood_type: request.blood_type,
            // In a real app, you might want to broaden the search for critical requests
        });

        console.log(`[ALERT] Found ${donors.length} potential donors for critical alert.`);

        // 2. Send SMS to top 5 nearest/available donors
        const topDonors = donors.slice(0, 5);

        topDonors.forEach(donor => {
            const msg = `CRITICAL BLOOD ALERT: ${request.blood_type} needed at ${request.hospital_id} URGENTLY. Patient: ${request.patient_name}. Contact: ${request.contact_phone}`;
            this.sendSMS(donor.phone, msg);
            if (donor.user_id) {
                this.sendPush(donor.user_id, 'Urgent Blood Request', msg);
            }
        });
    }
}

export default NotificationService;
